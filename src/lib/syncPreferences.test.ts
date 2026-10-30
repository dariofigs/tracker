import { describe, expect, it, vi } from 'vitest'
import { createPreferencesStore } from './preferences'
import { syncMorningCutoff } from './syncPreferences'

function memoryStore() {
  const data = new Map<string, string>()
  return createPreferencesStore({
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  })
}

describe('syncMorningCutoff', () => {
  it('takes the saved time over this device’s default', async () => {
    const store = memoryStore()
    const repo = { getMorningCutoff: async () => '15:30', setMorningCutoff: vi.fn() }
    await syncMorningCutoff(repo, store)
    expect(store.get().morningCutoff).toBe('15:30')
    expect(repo.setMorningCutoff).not.toHaveBeenCalled()
  })

  it('uploads a time set here when nothing is saved yet', async () => {
    const store = memoryStore()
    store.set({ morningCutoff: '14:00' })
    const repo = { getMorningCutoff: async () => null, setMorningCutoff: vi.fn() }
    await syncMorningCutoff(repo, store)
    expect(repo.setMorningCutoff).toHaveBeenCalledWith('14:00')
    expect(store.get().morningCutoff).toBe('14:00')
  })

  it('keeps the local time when the lookup fails', async () => {
    const store = memoryStore()
    store.set({ morningCutoff: '14:00' })
    const repo = {
      getMorningCutoff: async () => {
        throw new Error('offline')
      },
      setMorningCutoff: vi.fn(),
    }
    await syncMorningCutoff(repo, store)
    expect(store.get().morningCutoff).toBe('14:00')
  })
})
