import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_PREFERENCES,
  createPreferencesStore,
  parsePreferences,
} from './preferences'

function memoryStorage(initial?: string) {
  let value = initial ?? null
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next
    },
    read: () => value,
  }
}

describe('parsePreferences', () => {
  it('returns defaults for nothing or garbage', () => {
    expect(parsePreferences(null)).toEqual(DEFAULT_PREFERENCES)
    expect(parsePreferences('not json')).toEqual(DEFAULT_PREFERENCES)
  })

  it('falls back field by field for invalid values', () => {
    const result = parsePreferences(
      JSON.stringify({ morningCutoff: '25:00', lastExportAt: 'yesterday-ish' }),
    )
    expect(result).toEqual(DEFAULT_PREFERENCES)
  })

  it('keeps valid values', () => {
    const result = parsePreferences(
      JSON.stringify({
        morningCutoff: '14:30',
        lastExportAt: '2026-10-01T10:00:00.000Z',
      }),
    )
    expect(result.morningCutoff).toBe('14:30')
    expect(result.lastExportAt).toBe('2026-10-01T10:00:00.000Z')
  })
})

describe('preferences store', () => {
  it('saves changes, notifies listeners and keeps the snapshot stable between changes', () => {
    const storage = memoryStorage()
    const store = createPreferencesStore(storage)
    const listener = vi.fn()
    store.subscribe(listener)

    expect(store.get()).toBe(store.get())
    store.set({ morningCutoff: '11:00' })

    expect(store.get().morningCutoff).toBe('11:00')
    expect(listener).toHaveBeenCalledTimes(1)
    expect(JSON.parse(storage.read()!).morningCutoff).toBe('11:00')
  })

  it('ignores an invalid cutoff', () => {
    const store = createPreferencesStore(memoryStorage())
    store.set({ morningCutoff: 'noon' })
    expect(store.get().morningCutoff).toBe(DEFAULT_PREFERENCES.morningCutoff)
  })

  it('works without storage', () => {
    const store = createPreferencesStore(null)
    store.set({ morningCutoff: '10:00' })
    expect(store.get().morningCutoff).toBe('10:00')
  })
})
