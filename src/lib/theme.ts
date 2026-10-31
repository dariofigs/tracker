import { useSyncExternalStore } from 'react'
import { preferences, type Preferences, type PreferencesStore } from './preferences'

export type ResolvedTheme = 'light' | 'dark'

// Matches the theme-color metas in index.html: the light one is the brand sage.
const THEME_COLOR: Record<ResolvedTheme, string> = { light: '#2D5A46', dark: '#1B1B19' }

function minutesOf(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number)
  return hours * 60 + minutes
}

/** Dark from `darkFrom` until `lightFrom`, wrapping past midnight when dark starts later in the day. */
export function scheduledTheme(now: Date, darkFrom: string, lightFrom: string): ResolvedTheme {
  const time = now.getHours() * 60 + now.getMinutes()
  const dark = minutesOf(darkFrom)
  const light = minutesOf(lightFrom)
  if (dark === light) return 'light'
  const isDark = dark < light ? time >= dark && time < light : time >= dark || time < light
  return isDark ? 'dark' : 'light'
}

export function resolveTheme(
  prefs: Pick<Preferences, 'theme' | 'darkFrom' | 'lightFrom'>,
  now: Date,
  systemDark: boolean,
): ResolvedTheme {
  if (prefs.theme === 'system') return systemDark ? 'dark' : 'light'
  if (prefs.theme === 'schedule') return scheduledTheme(now, prefs.darkFrom, prefs.lightFrom)
  return prefs.theme
}

export function applyTheme(theme: ResolvedTheme, doc: Document = document): void {
  doc.documentElement.dataset.theme = theme
  doc
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute('content', THEME_COLOR[theme]))
}

const listeners = new Set<() => void>()

function currentTheme(): ResolvedTheme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/** The theme on screen right now, after resolving System and Schedule. */
export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    currentTheme,
  )
}

/**
 * Keeps the page theme in step with the preference, the device setting and the clock.
 * Returns a cleanup function.
 */
export function startThemeSync(
  store: PreferencesStore = preferences,
  win: Window = window,
): () => void {
  const query = win.matchMedia('(prefers-color-scheme: dark)')

  function update() {
    const next = resolveTheme(store.get(), new Date(), query.matches)
    const changed = next !== currentTheme()
    applyTheme(next, win.document)
    if (changed) listeners.forEach((listener) => listener())
  }

  update()
  const unsubscribe = store.subscribe(update)
  query.addEventListener('change', update)
  // The schedule moves with the clock, and a backgrounded phone misses timers: check again on return.
  const timer = win.setInterval(update, 60_000)
  win.document.addEventListener('visibilitychange', update)

  return () => {
    unsubscribe()
    query.removeEventListener('change', update)
    win.clearInterval(timer)
    win.document.removeEventListener('visibilitychange', update)
  }
}
