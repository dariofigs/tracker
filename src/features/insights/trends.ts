import type { EntryInput } from '../../data/types'
import { addDays, parseDayString, toDayString } from '../../lib/dates'
import { FLARE_PAIN } from '../../lib/painBand'
import { buildDays, pairEveningToMorning, pairSleepToMorning } from './engine/pairing'

export type LagPoint = {
  date: string
  /** Minutes times effort of the evening's exercise. Null when the evening was not logged. */
  exertion: number | null
  /** Waking pain the next morning. Null when that morning was not logged. */
  pain: number | null
}

/** One point per calendar day from `from` to `to`: that day's exertion beside the next morning's pain. */
export function lagSeries(entries: EntryInput[], from: string, to: string): LagPoint[] {
  const days = new Map(buildDays(entries).map((d) => [d.date, d]))
  const points: LagPoint[] = []
  for (let date = from; date <= to; date = addDays(date, 1)) {
    const pm = days.get(date)?.pm
    points.push({
      date,
      exertion: pm ? (pm.exercise ? pm.exercise.minutes * pm.exercise.effort : 0) : null,
      pain: days.get(addDays(date, 1))?.am?.wakingPain ?? null,
    })
  }
  return points
}

export type XY = { x: number; y: number }

/** Each night's sleep hours against the same morning's pain, within the range. */
export function sleepPainPoints(entries: EntryInput[], from: string, to: string): XY[] {
  return pairSleepToMorning(buildDays(entries))
    .filter((p) => p.day.date >= from && p.day.date <= to && p.day.am?.sleepHours != null)
    .map((p) => ({ x: p.day.am!.sleepHours!, y: p.pain }))
}

/** Each evening's stress against the next morning's pain, within the range. */
export function stressPainPoints(entries: EntryInput[], from: string, to: string): XY[] {
  return pairEveningToMorning(buildDays(entries))
    .filter((p) => p.day.date >= from && p.day.date <= to && p.day.pm?.stress != null)
    .map((p) => ({ x: p.day.pm!.stress!, y: p.pain }))
}

export type WeekCount = {
  /** Monday of the week, YYYY-MM-DD. */
  weekStart: string
  flareDays: number
  goodDays: number
  otherDays: number
}

export function mondayOf(day: string): string {
  const date = parseDayString(day)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return toDayString(date)
}

/** A day's worst logged pain. A flare day reached FLARE_PAIN or more; a good day stayed in the sage band. */
export function weeklyDistribution(
  entries: EntryInput[],
  from: string,
  to: string,
): WeekCount[] {
  const weeks = new Map<string, WeekCount>()
  for (const day of buildDays(entries)) {
    if (day.date < from || day.date > to) continue
    const readings = [day.am?.wakingPain, day.pm?.endPain].filter(
      (p): p is number => p != null,
    )
    if (readings.length === 0) continue
    const worst = Math.max(...readings)
    const weekStart = mondayOf(day.date)
    const week = weeks.get(weekStart) ?? {
      weekStart,
      flareDays: 0,
      goodDays: 0,
      otherDays: 0,
    }
    if (worst >= FLARE_PAIN) week.flareDays++
    else if (worst <= 3) week.goodDays++
    else week.otherDays++
    weeks.set(weekStart, week)
  }
  return [...weeks.values()].sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}
