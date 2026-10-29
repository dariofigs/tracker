import { supabase } from '../lib/supabase'
import { repository } from './repository'
import type { EntryInput } from './types'

/** saved: all sent · saving: sending · not_saved: retrying · paused: signed out · needs_attention: some refused */
export type SaveState = 'idle' | 'saving' | 'saved' | 'not_saved' | 'paused' | 'needs_attention'

export interface SaveStatus {
  state: SaveState
  /** Entries waiting to be sent. */
  pending: number
  /** Entries the database refused. They stay on the phone until retried or discarded. */
  failed: number
}

/**
 * transient: no response or a server error, so retrying can help.
 * permission: refused, which means signed out (pause) or a rule the data breaks (fail).
 * permanent: the data itself was refused, so retrying can't help.
 */
export type FailureKind = 'transient' | 'permission' | 'permanent'

type QueueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

interface QueuedEntry {
  input: EntryInput
  failed: boolean
}

export interface SaveQueueOptions {
  save: (input: EntryInput) => Promise<unknown>
  /** Tells a permission refusal apart: no session means signed out. */
  hasSession: () => Promise<boolean>
  /** Where unsent entries are kept between visits. Null keeps them in memory only. */
  storage: QueueStorage | null
  storageKey?: string
  retryDelaysMs?: number[]
}

const DEFAULT_STORAGE_KEY = 'tracker.saveQueue.v2'
const DEFAULT_RETRY_DELAYS_MS = [2_000, 4_000, 8_000, 16_000, 32_000, 60_000]

/** Postgres class 22 (bad data) and 23 (constraint violated) mean the data is wrong. */
export function classifyError(error: unknown): FailureKind {
  const code = (error as { code?: string } | null)?.code
  if (!code) return 'transient'
  if (code === 'PGRST301' || code === 'PGRST302' || code === '42501') return 'permission'
  if (code.startsWith('22') || code.startsWith('23')) return 'permanent'
  return 'transient'
}

const keyOf = (input: Pick<EntryInput, 'entryDate' | 'period'>) => `${input.entryDate}|${input.period}`

function withoutUndefined(input: EntryInput): Partial<EntryInput> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined))
}

/**
 * Keeps saves until the database accepts them. One queued item per day and period: later saves
 * merge into it, so no field is lost if several saves happen before the first one goes through.
 */
export function createSaveQueue(options: SaveQueueOptions) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const retryDelays = options.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS
  const listeners = new Set<() => void>()

  let items = restore()
  let status: SaveStatus = { state: 'idle', ...counts() }
  let inFlight: Promise<void> | null = null
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let failures = 0

  function restore(): Map<string, QueuedEntry> {
    try {
      const raw = options.storage?.getItem(storageKey)
      return new Map(raw ? (JSON.parse(raw) as [string, QueuedEntry][]) : [])
    } catch {
      return new Map()
    }
  }

  function persist() {
    try {
      if (items.size === 0) options.storage?.removeItem(storageKey)
      else options.storage?.setItem(storageKey, JSON.stringify([...items]))
    } catch {
      // Storage is full or blocked. The entries stay in memory until the page closes.
    }
  }

  function counts() {
    const failed = [...items.values()].filter((entry) => entry.failed).length
    return { pending: items.size - failed, failed }
  }

  function setStatus(next: Partial<SaveStatus>) {
    status = { ...status, ...counts(), ...next }
    listeners.forEach((listener) => listener())
  }

  function nextRetryable(): [string, QueuedEntry] | undefined {
    for (const pair of items) if (!pair[1].failed) return pair
    return undefined
  }

  async function run() {
    clearTimeout(retryTimer)
    setStatus({ state: 'saving' })

    for (let next = nextRetryable(); next; next = nextRetryable()) {
      const [key, entry] = next
      try {
        await options.save(entry.input)
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
        items.set(key, { ...entry, failed: true })
        persist()
        setStatus({})
        continue
      }

      // If the entry changed while it was being sent, keep it so the newer fields go out next.
      if (items.get(key) === entry) items.delete(key)
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
    /** Queues a save for one day and period, then tries to send it right away. */
    save(input: EntryInput): Promise<void> {
      const key = keyOf(input)
      const existing = items.get(key)?.input
      items.set(key, {
        input: { ...existing, ...withoutUndefined(input) } as EntryInput,
        failed: false,
      })
      persist()
      setStatus({})
      return flush()
    },

    /** Sends whatever is waiting. Also used to resume after sign-in. */
    flush,

    /** Puts refused entries back in the queue and sends them again. */
    retryFailed(): Promise<void> {
      for (const [key, entry] of items) {
        if (entry.failed) items.set(key, { ...entry, failed: false })
      }
      persist()
      return flush()
    },

    /** Drops one queued entry. The caller must confirm with the user first. */
    discard(entryDate: string, period: EntryInput['period']) {
      items.delete(keyOf({ entryDate, period }))
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
  save: (input) => repository.upsertEntry(input),
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
