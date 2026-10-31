import { useSyncExternalStore } from 'react'
import { isDemo } from '../demo/mode'
import { DEFAULT_MORNING_CUTOFF } from './dates'

/** Light, dark, follow the device, or switch by time of day (darkFrom / lightFrom). */
export type ThemeMode = 'light' | 'dark' | 'system' | 'schedule'

const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system', 'schedule']

/** Settings that live on this phone. Backed up inside the JSON export, but not in the database. */
export type Preferences = {
  /** AM before this "HH:mm" time, PM from it onward. */
  morningCutoff: string
  theme: ThemeMode
  /** "HH:mm" the dark theme starts when theme is "schedule". */
  darkFrom: string
  /** "HH:mm" the light theme starts when theme is "schedule". */
  lightFrom: string
  /** ISO timestamp of the last JSON export, or null if never exported. */
  lastExportAt: string | null
  /** ISO timestamp until which the backup reminder stays hidden, or null. */
  backupReminderSnoozedUntil: string | null
  /** Show the current weather as the Today tab icon. Needs location access. */
  weatherIcon: boolean
}

export const DEFAULT_PREFERENCES: Preferences = {
  morningCutoff: DEFAULT_MORNING_CUTOFF,
  theme: 'system',
  darkFrom: '19:00',
  lightFrom: '07:00',
  lastExportAt: null,
  backupReminderSnoozedUntil: null,
  weatherIcon: false,
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
      theme: THEME_MODES.includes(data.theme as ThemeMode)
        ? (data.theme as ThemeMode)
        : DEFAULT_PREFERENCES.theme,
      darkFrom: isValidCutoff(data.darkFrom) ? data.darkFrom : DEFAULT_PREFERENCES.darkFrom,
      lightFrom: isValidCutoff(data.lightFrom)
        ? data.lightFrom
        : DEFAULT_PREFERENCES.lightFrom,
      lastExportAt: isoOrNull(data.lastExportAt),
      backupReminderSnoozedUntil: isoOrNull(data.backupReminderSnoozedUntil),
      weatherIcon: data.weatherIcon === true,
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

// The demo keeps settings in memory only, so nothing it does is left on the visitor's device.
export const preferences = createPreferencesStore(isDemo ? null : browserStorage())

export function usePreferences(): Preferences {
  return useSyncExternalStore(preferences.subscribe, preferences.get)
}

/** The AM/PM switch time from Settings. */
export function useMorningCutoff(): string {
  return usePreferences().morningCutoff
}
