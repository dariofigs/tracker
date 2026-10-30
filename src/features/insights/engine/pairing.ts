import type { EntryInput } from '../../../data/types'
import { addDays } from '../../../lib/dates'

/** A lag is a distance in time. Days now; hours when timed logs get their own engine. */
export type Lag = { value: number; unit: 'days' | 'hours' }

/** One local day with whatever was logged for it. */
export type DayRecord = {
  date: string
  am?: EntryInput
  pm?: EntryInput
}

/** A day whose factor data is paired with the waking pain of a morning `lag` days later. */
export type Pair = {
  day: DayRecord
  /** Waking pain on the morning of `day.date + lag`. */
  pain: number
}

/** Groups entries by local day, oldest first. If a day and period repeat, the last one wins. */
export function buildDays(entries: EntryInput[]): DayRecord[] {
  const byDate = new Map<string, DayRecord>()
  for (const entry of entries) {
    const day = byDate.get(entry.entryDate) ?? { date: entry.entryDate }
    if (entry.period === 'AM') day.am = entry
    else day.pm = entry
    byDate.set(entry.entryDate, day)
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Pairs each day with the waking pain logged `lagDays` mornings later. Days where that morning is
 * missing or has no pain are dropped; nothing is filled in.
 */
export function pairWithMorningPain(days: DayRecord[], lagDays: number): Pair[] {
  const byDate = new Map(days.map((day) => [day.date, day]))
  const pairs: Pair[] = []
  for (const day of days) {
    const pain = byDate.get(addDays(day.date, lagDays))?.am?.wakingPain
    if (pain != null) pairs.push({ day, pain })
  }
  return pairs
}

/** 6.1: each evening with the next morning's pain. */
export const pairEveningToMorning = (days: DayRecord[]): Pair[] =>
  pairWithMorningPain(days, 1).filter((pair) => pair.day.pm)

/** 6.2: each night's sleep with the same morning's pain. */
export const pairSleepToMorning = (days: DayRecord[]): Pair[] =>
  pairWithMorningPain(days, 0).filter((pair) => pair.day.am)
