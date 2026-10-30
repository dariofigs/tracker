import { useSyncExternalStore } from 'react'
import { DEFAULT_MORNING_CUTOFF } from './dates'

/** Settings that live on this phone. Backed up inside the JSON export, but not in the database. */
export type Preferences = {
  /** AM before this "HH:mm" time, PM from it onward. */
  morningCutoff: string
  /** ISO timestamp of the last JSON export, or null if never exported. */
  lastExportAt: string | null
  /** ISO timestamp until which the backup reminder stays hidden, or null. */
  backupReminderSnoozedUntil: string | null
}

export const DEFAULT_PREFERENCES: Preferences = {
  morningCutoff: DEFAULT_MORNING_CUTOFF,
  lastExportAt: null,
  backupReminderSnoozedUntil: null,
}

const STORAGE_KEY = 'tracker.preferences'

type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>

export function isValidCutoff(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

function isoOrNull(value: unknown): string | null {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null
}

/** Reads stored preferences, falling back to defaults field by field when anything is missing or invalid. */
export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return DEFAULT_PREFERENCES
  try {
    const data = JSON.parse(raw) as Record<string, unknown>
    return {
      morningCutoff: isValidCutoff(data.morningCutoff)
        ? data.morningCutoff
        : DEFAULT_PREFERENCES.morningCutoff,
      lastExportAt: isoOrNull(data.lastExportAt),
      backupReminderSnoozedUntil: isoOrNull(data.backupReminderSnoozedUntil),
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function createPreferencesStore(storage: PreferenceStorage | null) {
  const listeners = new Set<() => void>()
  let current: Preferences | null = null

  function read(): Preferences {
    try {
      return parsePreferences(storage?.getItem(STORAGE_KEY) ?? null)
    } catch {
      return DEFAULT_PREFERENCES
    }
  }

  return {
    /** Stable between changes, so it is safe as a useSyncExternalStore snapshot. */
    get(): Preferences {
      current ??= read()
      return current
    },

    set(changes: Partial<Preferences>) {
      const next = parsePreferences(JSON.stringify({ ...this.get(), ...changes }))
      current = next
      try {
        storage?.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage full or blocked: the value still applies until the app is closed.
      }
      listeners.forEach((listener) => listener())
    },

    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

export type PreferencesStore = ReturnType<typeof createPreferencesStore>

function browserStorage(): PreferenceStorage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const preferences = createPreferencesStore(browserStorage())

export function usePreferences(): Preferences {
  return useSyncExternalStore(preferences.subscribe, preferences.get)
}

/** The AM/PM switch time from Settings. */
export function useMorningCutoff(): string {
  return usePreferences().morningCutoff
}
