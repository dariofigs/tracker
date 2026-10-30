import { addDays, parseDayString } from './dates'

/** The seven days of the calendar week containing `today`, Sunday first. */
export function weekDays(today: string): string[] {
  const sunday = addDays(today, -parseDayString(today).getDay())
  return Array.from({ length: 7 }, (_, i) => addDays(sunday, i))
}

/**
 * Days in a row with at least one check-in, ending today. A day that hasn't been logged yet
 * doesn't break the streak, so it counts back from yesterday until today is logged.
 */
export function currentStreak(loggedDays: ReadonlySet<string>, today: string): number {
  let day = loggedDays.has(today) ? today : addDays(today, -1)
  let count = 0
  while (loggedDays.has(day)) {
    count++
    day = addDays(day, -1)
  }
  return count
}
