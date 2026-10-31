import { useEffect, useState } from 'react'
import type { IconName } from '../components/ui'
import { usePreferences } from '../lib/preferences'
import {
  DEFAULT_WEATHER_ICON,
  fetchWeatherIcon,
  isFresh,
  readWeatherCache,
  requestLocation,
} from '../lib/weather'
import { useOnline } from './useOnline'

/**
 * The icon for the Today tab: the current weather when it is turned on in Settings, otherwise the sun.
 * Keeps showing the last known weather while offline or when a lookup fails.
 */
export function useWeatherIcon(): IconName {
  const { weatherIcon } = usePreferences()
  const online = useOnline()
  const [icon, setIcon] = useState<IconName>(() =>
    weatherIcon ? (readWeatherCache()?.icon ?? DEFAULT_WEATHER_ICON) : DEFAULT_WEATHER_ICON,
  )

  useEffect(() => {
    if (!weatherIcon) return

    let cancelled = false
    async function refresh() {
      if (!online) return
      const current = readWeatherCache()
      if (current && isFresh(current)) return
      try {
        // Already allowed in Settings, so this does not prompt; fall back to the last position otherwise.
        const coords = await requestLocation().catch(() => current)
        if (!coords) return
        const next = await fetchWeatherIcon(coords)
        if (!cancelled) setIcon(next)
      } catch {
        // Keep whatever is showing.
      }
    }

    void refresh()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [weatherIcon, online])

  return weatherIcon ? icon : DEFAULT_WEATHER_ICON
}
