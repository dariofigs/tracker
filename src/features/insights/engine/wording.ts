import type { Factor } from './factors'
import type { Lag } from './pairing'

const DAY_WORDS = ['', 'a day', 'two days']

function subject(factor: Factor): string {
  if (factor.period === 'AM') return `nights of ${factor.label}`
  if (/^(activity|symptom):/.test(factor.id)) return `days you logged ${factor.label}`
  return `days with ${factor.label}`
}

function mornings(factor: Factor, lag: Lag): string {
  const what = subject(factor)
  if (lag.value === 0)
    return factor.period === 'AM' ? `Mornings after ${what}` : `Mornings of ${what}`
  return `Mornings ${DAY_WORDS[lag.value] ?? `${lag.value} days`} after ${what}`
}

/** One sentence, worded as a pattern seen in the data. Never claims a cause. */
export function insightText(
  factor: Factor,
  lag: Lag,
  diff: number,
  n1: number,
  n2: number,
): string {
  const points = Math.abs(diff).toFixed(1)
  const direction = diff > 0 ? 'higher' : 'lower'
  return `${mornings(factor, lag)} had waking pain ${points} points ${direction} in your data (${n1} days vs ${n2}).`
}

export function needsMoreDaysText(have: number, need: number): string {
  if (have === 0)
    return `Insights need at least ${need} days with a morning pain rating. Log a few check-ins and they will start to appear.`
  const left = need - have
  return `${have} of ${need} days so far. Log ${left} more ${left === 1 ? 'day' : 'days'} and patterns can start to appear.`
}
