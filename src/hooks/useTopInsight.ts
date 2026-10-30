import { useMemo } from 'react'
import type { BannerInsight } from '../features/today/InsightBanner'
import { findInsights } from '../features/insights/engine/insights'
import { addDays, todayString } from '../lib/dates'
import { useEntriesInRange } from './useEntriesInRange'

/** How far back the engine looks. More days make small effects findable. */
export const ENGINE_DAYS = 365

/** The strongest current insight for the Today banner, or null while loading, on error, or when nothing stands out. */
export function useTopInsight(): BannerInsight | null {
  const today = todayString()
  const { entries } = useEntriesInRange(addDays(today, -ENGINE_DAYS), today)

  return useMemo(() => {
    const result = findInsights(entries)
    if (result.status !== 'ready' || result.insights.length === 0) return null
    return { text: result.insights[0].text }
  }, [entries])
}
