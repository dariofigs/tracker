import type { EntryInput } from '../../../data/types'
import { compareGroups } from './compare'
import { buildFactors, type Factor } from './factors'
import { buildDays, pairWithMorningPain, type DayRecord, type Lag } from './pairing'
import { insightText } from './wording'

/** Fewest paired days before any insight appears (6.5). */
export const MIN_PAIRED_DAYS = 10
/** Fewest days in each group (with and without the factor). */
export const MIN_GROUP_DAYS = 4
/** Smallest difference worth showing, in pain points. */
export const MIN_DIFF = 0.75
/**
 * Smallest |t| to show. Every factor is tried at three lags, so the bar sits well above the usual 2
 * to keep chance findings out; the noise test in engine.test.ts holds this to account.
 */
export const MIN_T = 3.5

export const LAGS_TO_TEST = [0, 1, 2]

export type Insight = {
  factorId: string
  label: string
  lag: Lag
  /** Mean pain with the factor minus mean pain without, in points. */
  diff: number
  pctDiff: number | null
  /** Days with the factor / days without. */
  n1: number
  n2: number
  direction: 'higher' | 'lower'
  /** Welch's t, used only to rank insights. */
  strength: number
  text: string
}

export type InsightsResult =
  | { status: 'needs-more-days'; have: number; need: number }
  | { status: 'ready'; have: number; insights: Insight[] }

/** Insight for the factor at one lag, or null when the data does not support one. */
function testFactor(factor: Factor, days: DayRecord[], lagDays: number): Insight | null {
  const withFactor: number[] = []
  const without: number[] = []
  for (const { day, pain } of pairWithMorningPain(days, lagDays)) {
    const applies = factor.applies(day)
    if (applies === null) continue
    ;(applies ? withFactor : without).push(pain)
  }

  if (withFactor.length < MIN_GROUP_DAYS || without.length < MIN_GROUP_DAYS) return null
  const result = compareGroups(withFactor, without)
  if (!result || Math.abs(result.diff) < MIN_DIFF || Math.abs(result.t) < MIN_T)
    return null

  const lag: Lag = { value: lagDays, unit: 'days' }
  return {
    factorId: factor.id,
    label: factor.label,
    lag,
    diff: result.diff,
    pctDiff: result.pctDiff,
    n1: result.n1,
    n2: result.n2,
    direction: result.diff > 0 ? 'higher' : 'lower',
    strength: Math.abs(result.t),
    text: insightText(factor, lag, result.diff, result.n1, result.n2),
  }
}

/** Days that could take part in any comparison: a morning pain rating plus something to compare it with. */
function countPairedDays(days: DayRecord[]): number {
  const evening = pairWithMorningPain(days, 1).filter((p) => p.day.pm).length
  const sleep = pairWithMorningPain(days, 0).filter((p) => p.day.am).length
  return Math.max(evening, sleep)
}

/**
 * Finds the patterns in the entries. Each factor is tried at lags of 0, 1 and 2 days and keeps the
 * strongest lag that passes the checks, so the delay comes from the data rather than being assumed.
 */
export function findInsights(entries: EntryInput[]): InsightsResult {
  const days = buildDays(entries)
  const have = countPairedDays(days)
  if (have < MIN_PAIRED_DAYS)
    return { status: 'needs-more-days', have, need: MIN_PAIRED_DAYS }

  const insights: Insight[] = []
  for (const factor of buildFactors(days)) {
    const found = LAGS_TO_TEST.map((lag) => testFactor(factor, days, lag)).filter(
      (insight): insight is Insight => insight !== null,
    )
    if (found.length === 0) continue
    insights.push(
      found.reduce((best, next) => (next.strength > best.strength ? next : best)),
    )
  }

  insights.sort((a, b) => b.strength - a.strength)
  return { status: 'ready', have, insights }
}
