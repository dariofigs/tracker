import { supabase } from '../lib/supabase'
import { newId } from '../lib/ids'
import { repository } from './repository'
import type { EntryInput, TimedLogInput } from './types'

/** saved: all sent · saving: sending · not_saved: retrying · paused: signed out · needs_attention: some refused */
export type SaveState = 'idle' | 'saving' | 'saved' | 'not_saved' | 'paused' | 'needs_attention'

export interface SaveStatus {
  state: SaveState
  /** Items waiting to be sent. */
  pending: number
  /** Items the database refused. They stay on the phone until retried or discarded. */
  failed: number
}

/**
 * transient: no response or a server error, so retrying can help.
 * permission: refused, which means signed out (pause) or a rule the data breaks (fail).
 * permanent: the data itself was refused, so retrying can't help.
 */
export type FailureKind = 'transient' | 'permission' | 'permanent'

type QueueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** Entries merge per day and period. Timed logs keep their own id and are never merged. */
type QueuedItem = { failed: boolean } & (
  | { kind: 'entry'; input: EntryInput }
  | { kind: 'timed'; id: string; input: TimedLogInput }
)

export interface SaveQueueOptions {
  saveEntry: (input: EntryInput) => Promise<unknown>
  /** Upserts on the id, so a retry after a lost response can't create a second row. */
  saveTimedLog: (id: string, input: TimedLogInput) => Promise<unknown>
  /** Tells a permission refusal apart: no session means signed out. */
  hasSession: () => Promise<boolean>
  /** Where unsent items are kept between visits. Null keeps them in memory only. */
  storage: QueueStorage | null
  storageKey?: string
  retryDelaysMs?: number[]
}

const DEFAULT_STORAGE_KEY = 'tracker.saveQueue.v3'
const DEFAULT_RETRY_DELAYS_MS = [2_000, 4_000, 8_000, 16_000, 32_000, 60_000]

/** Postgres class 22 (bad data) and 23 (constraint violated) mean the data is wrong. */
export function classifyError(error: unknown): FailureKind {
  const code = (error as { code?: string } | null)?.code
  if (!code) return 'transient'
  if (code === 'PGRST301' || code === 'PGRST302' || code === '42501') return 'permission'
  if (code.startsWith('22') || code.startsWith('23')) return 'permanent'
  return 'transient'
}

const entryKey = (input: Pick<EntryInput, 'entryDate' | 'period'>) =>
  `entry|${input.entryDate}|${input.period}`
const timedKey = (id: string) => `timed|${id}`

function withoutUndefined<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}

/**
 * Keeps saves until the database accepts them. Entries for the same day and period merge, so no
 * field is lost if several saves happen before the first goes through. Timed logs are kept one
 * per id, so each one is sent exactly once, even if it is retried.
 */
export function createSaveQueue(options: SaveQueueOptions) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const retryDelays = options.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS
  const listeners = new Set<() => void>()

  const items = restore()
  let status: SaveStatus = { state: 'idle', ...counts() }
  let inFlight: Promise<void> | null = null
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let failures = 0

  function restore(): Map<string, QueuedItem> {
    try {
      const raw = options.storage?.getItem(storageKey)
      return new Map(raw ? (JSON.parse(raw) as [string, QueuedItem][]) : [])
    } catch {
      return new Map()
    }
  }

  function persist() {
    try {
      if (items.size === 0) options.storage?.removeItem(storageKey)
      else options.storage?.setItem(storageKey, JSON.stringify([...items]))
    } catch {
      // Storage is full or blocked. The items stay in memory until the page closes.
    }
  }

  function counts() {
    const failed = [...items.values()].filter((item) => item.failed).length
    return { pending: items.size - failed, failed }
  }

  function setStatus(next: Partial<SaveStatus>) {
    status = { ...status, ...counts(), ...next }
    listeners.forEach((listener) => listener())
  }

  function nextRetryable(): [string, QueuedItem] | undefined {
    for (const pair of items) if (!pair[1].failed) return pair
    return undefined
  }

  function send(item: QueuedItem) {
    return item.kind === 'entry'
      ? options.saveEntry(item.input)
      : options.saveTimedLog(item.id, item.input)
  }

  async function run() {
    clearTimeout(retryTimer)
    setStatus({ state: 'saving' })

    for (let next = nextRetryable(); next; next = nextRetryable()) {
      const [key, item] = next
      try {
        await send(item)
      } catch (error) {
        const kind = classifyError(error)

        if (kind === 'permission' && !(await options.hasSession())) {
          setStatus({ state: 'paused' })
          return
        }
        if (kind === 'transient') {
          const delay = retryDelays[Math.min(failures, retryDelays.length - 1)]
          failures++
          retryTimer = setTimeout(() => void flush(), delay)
          setStatus({ state: 'not_saved' })
          return
        }

        // Refused by the data or the rules. Keep it on the phone and stop retrying it.
        items.set(key, { ...item, failed: true })
        persist()
        setStatus({})
        continue
      }

      // If an entry changed while it was being sent, keep it so the newer fields go out next.
      if (items.get(key) === item) items.delete(key)
      persist()
      setStatus({})
    }

    failures = 0
    setStatus({ state: status.failed > 0 ? 'needs_attention' : 'saved' })
  }

  /** Sends everything queued. Calls made while a send is running share its result. */
  function flush(): Promise<void> {
    if (!nextRetryable()) {
      setStatus({ state: status.failed > 0 ? 'needs_attention' : 'idle' })
      return Promise.resolve()
    }
    if (!inFlight) {
      inFlight = run().finally(() => {
        inFlight = null
      })
    }
    return inFlight
  }

  return {
    /** Queues a save for one day and period, merging into any entry already waiting for it. */
    save(input: EntryInput): Promise<void> {
      const key = entryKey(input)
      const existing = items.get(key)
      const previous = existing?.kind === 'entry' ? existing.input : undefined
      items.set(key, {
        kind: 'entry',
        input: { ...previous, ...withoutUndefined(input) } as EntryInput,
        failed: false,
      })
      persist()
      setStatus({})
      return flush()
    },

    /** Queues a timed log under its id, then sends it. Returns the id so the screen can refer to it. */
    async logTimed(input: TimedLogInput, id: string = newId()): Promise<string> {
      items.set(timedKey(id), { kind: 'timed', id, input, failed: false })
      persist()
      setStatus({})
      await flush()
      return id
    },

    /** Sends whatever is waiting. Also used to resume after sign-in. */
    flush,

    /** Puts refused items back in the queue and sends them again. */
    retryFailed(): Promise<void> {
      for (const [key, item] of items) {
        if (item.failed) items.set(key, { ...item, failed: false })
      }
      persist()
      return flush()
    },

    /** Drops one queued entry. The caller must confirm with the user first. */
    discard(entryDate: string, period: EntryInput['period']) {
      items.delete(entryKey({ entryDate, period }))
      persist()
      setStatus({ state: items.size === 0 ? 'idle' : status.state })
    },

    /** Drops one queued timed log. The caller must confirm with the user first. */
    discardTimedLog(id: string) {
      items.delete(timedKey(id))
      persist()
      setStatus({ state: items.size === 0 ? 'idle' : status.state })
    },

    getStatus: () => status,

    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

export type SaveQueue = ReturnType<typeof createSaveQueue>

function browserStorage(): QueueStorage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const saveQueue = createSaveQueue({
  saveEntry: (input) => repository.upsertEntry(input),
  saveTimedLog: (id, input) => repository.upsertTimedLog(id, input),
  hasSession: async () => Boolean((await supabase.auth.getSession()).data.session),
  storage: browserStorage(),
})

// Retry as soon as the connection comes back, rather than waiting for the backoff timer.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void saveQueue.flush())
}

// Resume after sign-in, which also sends anything saved on this phone before the app opened.
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) void saveQueue.flush()
})
