import { describe, expect, it, vi } from 'vitest'
import { classifyError, createSaveQueue, type SaveQueueOptions } from './saveQueue'

const KEY = 'test.queue'

/** In-memory stand-in for localStorage. */
function memoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    raw: () => data.get(KEY) ?? null,
  }
}

/** An error shaped like a DataError from the repository. */
const coded = (code: string | undefined) => Object.assign(new Error(`code ${code}`), { code })

const AM = { entryDate: '2026-10-28', period: 'AM' as const }
const PM = { entryDate: '2026-10-28', period: 'PM' as const }

type QueueOverrides = Partial<Omit<SaveQueueOptions, 'saveEntry' | 'saveTimedLog'>> & {
  save?: SaveQueueOptions['saveEntry']
  saveTimedLog?: SaveQueueOptions['saveTimedLog']
}

function makeQueue({ save, saveTimedLog, ...overrides }: QueueOverrides = {}) {
  return createSaveQueue({
    saveEntry: save ?? vi.fn().mockResolvedValue({}),
    saveTimedLog: saveTimedLog ?? vi.fn().mockResolvedValue({}),
    hasSession: async () => true,
    storage: memoryStorage(),
    storageKey: KEY,
    retryDelaysMs: [60_000],
    ...overrides,
  })
}

describe('classifyError', () => {
  it('treats a missing code as a connection problem', () => {
    expect(classifyError(coded(undefined))).toBe('transient')
    expect(classifyError(coded(''))).toBe('transient')
  })

  it('treats server-side codes as transient', () => {
    expect(classifyError(coded('XX000'))).toBe('transient')
  })

  it('treats auth and row-level security refusals as permission', () => {
    expect(classifyError(coded('PGRST301'))).toBe('permission')
    expect(classifyError(coded('42501'))).toBe('permission')
  })

  it('treats bad data and constraint violations as permanent', () => {
    expect(classifyError(coded('23514'))).toBe('permanent')
    expect(classifyError(coded('22P02'))).toBe('permanent')
  })
})

describe('save queue', () => {
  it('sends a save and clears the queue when it succeeds', async () => {
    const save = vi.fn().mockResolvedValue({})
    const storage = memoryStorage()
    const queue = makeQueue({ save, storage })

    await queue.save({ ...AM, wakingPain: 4 })

    expect(save).toHaveBeenCalledWith({ ...AM, wakingPain: 4 })
    expect(queue.getStatus()).toEqual({ state: 'saved', pending: 0, failed: 0 })
    expect(storage.raw()).toBeNull()
  })

  it('keeps the entry when the connection drops, then retries until it is saved', async () => {
    const save = vi.fn().mockRejectedValueOnce(coded(undefined)).mockResolvedValue({})
    const storage = memoryStorage()
    const queue = makeQueue({ save, storage, retryDelaysMs: [0] })

    await queue.save({ ...AM, wakingPain: 4 })
    expect(queue.getStatus()).toMatchObject({ state: 'not_saved', pending: 1, failed: 0 })
    expect(storage.raw()).not.toBeNull()

    await vi.waitFor(() => expect(queue.getStatus()).toMatchObject({ state: 'saved', pending: 0 }))
    expect(save).toHaveBeenCalledTimes(2)
    expect(storage.raw()).toBeNull()
  })

  it('merges saves for the same day and period so no field is lost', async () => {
    const save = vi.fn().mockRejectedValue(coded(undefined))
    const queue = makeQueue({ save })

    await queue.save({ ...AM, wakingPain: 4 })
    await queue.save({ ...AM, sleepHours: 7.5 })

    expect(queue.getStatus().pending).toBe(1)
    expect(save).toHaveBeenLastCalledWith({ ...AM, wakingPain: 4, sleepHours: 7.5 })
  })

  it('does not drop a save made while an earlier one is still sending', async () => {
    let release!: () => void
    const save = vi
      .fn()
      .mockImplementationOnce(() => new Promise<void>((resolve) => (release = resolve)))
      .mockResolvedValue({})
    const queue = makeQueue({ save })

    const first = queue.save({ ...AM, wakingPain: 4 })
    const second = queue.save({ ...AM, sleepHours: 7.5 })
    release()
    await Promise.all([first, second])

    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith({ ...AM, wakingPain: 4, sleepHours: 7.5 })
    expect(queue.getStatus()).toEqual({ state: 'saved', pending: 0, failed: 0 })
  })

  it('restores unsent entries from storage in a new session and sends them', async () => {
    const storage = memoryStorage()
    const failing = makeQueue({ save: vi.fn().mockRejectedValue(coded(undefined)), storage })
    await failing.save({ ...AM, wakingPain: 4 })

    const save = vi.fn().mockResolvedValue({})
    const restored = makeQueue({ save, storage })
    expect(restored.getStatus().pending).toBe(1)

    await restored.flush()

    expect(save).toHaveBeenCalledWith({ ...AM, wakingPain: 4 })
    expect(restored.getStatus()).toEqual({ state: 'saved', pending: 0, failed: 0 })
  })

  it('works in memory when storage is unavailable', async () => {
    const queue = makeQueue({ save: vi.fn().mockResolvedValue({}), storage: null })

    await queue.save({ ...AM, wakingPain: 4 })

    expect(queue.getStatus()).toEqual({ state: 'saved', pending: 0, failed: 0 })
  })

  it('flags a refused entry, keeps it, and still sends the others', async () => {
    const save = vi.fn((input: { period: string }) =>
      input.period === 'AM' ? Promise.reject(coded('23514')) : Promise.resolve({}),
    )
    const storage = memoryStorage()
    const queue = makeQueue({ save, storage })

    await queue.save({ ...AM, wakingPain: 99 })
    await queue.save({ ...PM, endPain: 3 })

    expect(queue.getStatus()).toEqual({ state: 'needs_attention', pending: 0, failed: 1 })
    expect(save).toHaveBeenCalledWith({ ...PM, endPain: 3 })
    expect(storage.raw()).toContain('2026-10-28|AM')
  })

  it('retries a refused entry only when asked, then clears it once it is accepted', async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(coded('23514'))
      .mockResolvedValue({})
    const storage = memoryStorage()
    const queue = makeQueue({ save, storage })

    await queue.save({ ...AM, wakingPain: 4 })
    expect(queue.getStatus().failed).toBe(1)

    await queue.retryFailed()

    expect(save).toHaveBeenCalledTimes(2)
    expect(queue.getStatus()).toEqual({ state: 'saved', pending: 0, failed: 0 })
    expect(storage.raw()).toBeNull()
  })

  it('discards a refused entry on request', async () => {
    const queue = makeQueue({ save: vi.fn().mockRejectedValue(coded('23514')) })

    await queue.save({ ...AM, wakingPain: 4 })
    queue.discard(AM.entryDate, AM.period)

    expect(queue.getStatus()).toEqual({ state: 'idle', pending: 0, failed: 0 })
  })

  it('pauses when signed out and sends the entries after sign-in', async () => {
    let signedIn = false
    const save = vi.fn().mockRejectedValueOnce(coded('42501')).mockResolvedValue({})
    const storage = memoryStorage()
    const queue = makeQueue({ save, storage, hasSession: async () => signedIn })

    await queue.save({ ...AM, wakingPain: 4 })
    expect(queue.getStatus()).toMatchObject({ state: 'paused', pending: 1, failed: 0 })
    expect(storage.raw()).not.toBeNull()

    signedIn = true
    await queue.flush()

    expect(queue.getStatus()).toEqual({ state: 'saved', pending: 0, failed: 0 })
  })

  it('treats a refusal as permanent when a session exists', async () => {
    const queue = makeQueue({ save: vi.fn().mockRejectedValue(coded('42501')), hasSession: async () => true })

    await queue.save({ ...AM, wakingPain: 4 })

    expect(queue.getStatus()).toMatchObject({ state: 'needs_attention', failed: 1 })
  })
})

describe('timed logs in the save queue', () => {
  const PAIN = { occurredAt: '2026-10-28T10:00:00.000Z', kind: 'pain' as const, pain: 6 }

  it('sends a timed log with the id it was given', async () => {
    const saveTimedLog = vi.fn().mockResolvedValue({})
    const queue = makeQueue({ saveTimedLog })

    const id = await queue.logTimed(PAIN, 'log-1')

    expect(id).toBe('log-1')
    expect(saveTimedLog).toHaveBeenCalledWith('log-1', PAIN)
    expect(queue.getStatus()).toEqual({ state: 'saved', pending: 0, failed: 0 })
  })

  it('reuses the same id on a retry, so a lost response cannot duplicate the log', async () => {
    const saveTimedLog = vi.fn().mockRejectedValueOnce(coded(undefined)).mockResolvedValue({})
    const queue = makeQueue({ saveTimedLog, retryDelaysMs: [0] })

    await queue.logTimed(PAIN, 'log-2')
    await vi.waitFor(() => expect(queue.getStatus().state).toBe('saved'))

    expect(saveTimedLog).toHaveBeenCalledTimes(2)
    expect(saveTimedLog.mock.calls[0][0]).toBe('log-2')
    expect(saveTimedLog.mock.calls[1][0]).toBe('log-2')
  })

  it('keeps every timed log separate instead of merging them', async () => {
    const queue = makeQueue({ saveTimedLog: vi.fn().mockRejectedValue(coded(undefined)) })

    await queue.logTimed(PAIN, 'a')
    await queue.logTimed({ ...PAIN, pain: 2 }, 'b')

    expect(queue.getStatus().pending).toBe(2)
  })

  it('restores a timed log queued offline in a new session and sends it', async () => {
    const storage = memoryStorage()
    const offline = makeQueue({ saveTimedLog: vi.fn().mockRejectedValue(coded(undefined)), storage })
    await offline.logTimed(PAIN, 'c')

    const saveTimedLog = vi.fn().mockResolvedValue({})
    const restored = makeQueue({ saveTimedLog, storage })
    expect(restored.getStatus().pending).toBe(1)

    await restored.flush()

    expect(saveTimedLog).toHaveBeenCalledWith('c', PAIN)
    expect(restored.getStatus()).toEqual({ state: 'saved', pending: 0, failed: 0 })
  })

  it('flags a refused timed log and discards it by id', async () => {
    const queue = makeQueue({ saveTimedLog: vi.fn().mockRejectedValue(coded('23514')) })

    await queue.logTimed(PAIN, 'd')
    expect(queue.getStatus()).toEqual({ state: 'needs_attention', pending: 0, failed: 1 })

    queue.discardTimedLog('d')
    expect(queue.getStatus()).toEqual({ state: 'idle', pending: 0, failed: 0 })
  })
})
