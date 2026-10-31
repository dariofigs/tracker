import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchWeatherIcon, iconForWeather, isFresh, readWeatherCache } from './weather'

afterEach(() => {
  window.localStorage.clear()
  vi.useRealTimers()
})

describe('iconForWeather', () => {
  it.each([
    [0, true, 'sun'],
    [0, false, 'moon-stars'],
    [1, true, 'cloud-sun'],
    [2, false, 'cloud-sun'],
    [3, true, 'clouds'],
    [45, true, 'fog'],
    [48, true, 'fog'],
    [51, true, 'cloud-rain'],
    [65, true, 'cloud-rain'],
    [81, true, 'cloud-rain'],
    [71, true, 'snowflake'],
    [86, true, 'snowflake'],
    [95, true, 'cloud-storm'],
    [99, false, 'cloud-storm'],
    [1234, true, 'today'],
  ])('code %i (day: %s) shows %s', (code, isDay, expected) => {
    expect(iconForWeather(code, isDay)).toBe(expected)
  })
})

function respond(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => body })
}

describe('fetchWeatherIcon', () => {
  it('maps the response and caches it', async () => {
    const fetcher = respond({ current: { weather_code: 61, is_day: 1 } })
    const icon = await fetchWeatherIcon({ lat: 51.5, lon: -0.12 }, fetcher)
    expect(icon).toBe('cloud-rain')
    expect(fetcher.mock.calls[0][0]).toContain('latitude=51.5&longitude=-0.12')
    expect(readWeatherCache()).toMatchObject({ icon: 'cloud-rain', lat: 51.5, lon: -0.12 })
  })

  it('shows the moon on a clear night', async () => {
    const fetcher = respond({ current: { weather_code: 0, is_day: 0 } })
    expect(await fetchWeatherIcon({ lat: 1, lon: 2 }, fetcher)).toBe('moon-stars')
  })

  it('rejects and caches nothing when the request or body is bad', async () => {
    await expect(fetchWeatherIcon({ lat: 1, lon: 2 }, respond({}, false))).rejects.toThrow()
    await expect(fetchWeatherIcon({ lat: 1, lon: 2 }, respond({}))).rejects.toThrow()
    expect(readWeatherCache()).toBeNull()
  })
})

describe('weather cache', () => {
  it('is fresh for 30 minutes', () => {
    const cache = { lat: 1, lon: 2, icon: 'sun' as const, fetchedAt: 1_000_000 }
    expect(isFresh(cache, 1_000_000 + 29 * 60_000)).toBe(true)
    expect(isFresh(cache, 1_000_000 + 31 * 60_000)).toBe(false)
  })

  it('ignores corrupt storage', () => {
    window.localStorage.setItem('tracker.weather', '{nope')
    expect(readWeatherCache()).toBeNull()
  })
})
