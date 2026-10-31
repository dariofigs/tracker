import type { IconName } from '../components/ui'

/** The Today tab icon when there is no weather to show. */
export const DEFAULT_WEATHER_ICON: IconName = 'today'

const STORAGE_KEY = 'tracker.weather'
const MAX_AGE_MS = 30 * 60 * 1000

export type Coords = { lat: number; lon: number }

type WeatherCache = Coords & { icon: IconName; fetchedAt: number }

/** Maps a WMO weather code (as returned by Open-Meteo) to a Today icon. Clear nights show the moon. */
export function iconForWeather(code: number, isDay: boolean): IconName {
  if (code === 0) return isDay ? 'sun' : 'moon-stars'
  if (code === 1 || code === 2) return 'cloud-sun'
  if (code === 3) return 'clouds'
  if (code === 45 || code === 48) return 'fog'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'cloud-rain'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snowflake'
  if (code >= 95 && code <= 99) return 'cloud-storm'
  return DEFAULT_WEATHER_ICON
}

/** Rounded to two decimals (about 1 km) so a precise position never leaves the phone. */
function coarse(value: number): number {
  return Math.round(value * 100) / 100
}

export function readWeatherCache(storage: Pick<Storage, 'getItem'> | null = safeStorage()): WeatherCache | null {
  try {
    const data = JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null') as Partial<WeatherCache> | null
    if (
      data &&
      typeof data.lat === 'number' &&
      typeof data.lon === 'number' &&
      typeof data.icon === 'string' &&
      typeof data.fetchedAt === 'number'
    ) {
      return data as WeatherCache
    }
  } catch {
    // Missing or corrupt: treat as no cache.
  }
  return null
}

function writeWeatherCache(cache: WeatherCache) {
  try {
    safeStorage()?.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    // Storage full or blocked: the icon still applies until the app is closed.
  }
}

export function clearWeatherCache() {
  try {
    safeStorage()?.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
}

function safeStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function isFresh(cache: WeatherCache, now: number = Date.now()): boolean {
  return now - cache.fetchedAt < MAX_AGE_MS
}

/** Asks the browser for the current position. Prompts the first time; rejects if denied or unavailable. */
export function requestLocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: coarse(pos.coords.latitude), lon: coarse(pos.coords.longitude) }),
      reject,
      { maximumAge: MAX_AGE_MS, timeout: 10_000 },
    )
  })
}

/** Looks up current conditions for a position and caches the resulting icon. Rejects on any failure. */
export async function fetchWeatherIcon(
  coords: Coords,
  fetcher: typeof fetch = fetch,
): Promise<IconName> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${coords.lat}&longitude=${coords.lon}&current=weather_code,is_day`
  const res = await fetcher(url)
  if (!res.ok) throw new Error(`weather ${res.status}`)
  const body = (await res.json()) as { current?: { weather_code?: unknown; is_day?: unknown } }
  const code = body.current?.weather_code
  if (typeof code !== 'number') throw new Error('weather: no current conditions')
  const icon = iconForWeather(code, body.current?.is_day !== 0)
  writeWeatherCache({ ...coords, icon, fetchedAt: Date.now() })
  return icon
}
