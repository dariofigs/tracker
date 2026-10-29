import type { BannerInsight } from '../features/today/InsightBanner'

/** The strongest current insight for the Today banner. Always null until the correlation engine exists (6.11). */
export function useTopInsight(): BannerInsight | null {
  return null
}
