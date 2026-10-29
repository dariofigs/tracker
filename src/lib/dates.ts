import type { Period } from '../data/types'

/** Local calendar day as YYYY-MM-DD. Avoids toISOString, which uses UTC and can name the wrong day. */
export function toDayString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayString(now: Date = new Date()): string {
  return toDayString(now)
}

/** Parses YYYY-MM-DD as a local date at midnight. */
export function parseDayString(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Shifts a day by whole calendar days. Works on local dates, so DST changes do not skip or repeat a day. */
export function addDays(day: string, count: number): string {
  const date = parseDayString(day)
  date.setDate(date.getDate() + count)
  return toDayString(date)
}

/** Half-open [start, end) range of a local day, for filtering by timestamp. */
export function dayBounds(day: string): { start: Date; end: Date } {
  const start = parseDayString(day)
  const end = parseDayString(addDays(day, 1))
  return { start, end }
}

/** Morning cutoff as "HH:mm" (24-hour). The default is noon. */
export const DEFAULT_MORNING_CUTOFF = '12:00'

/** AM before the cutoff, PM from the cutoff onward. */
export function periodFor(now: Date = new Date(), morningCutoff = DEFAULT_MORNING_CUTOFF): Period {
  const [hours, minutes] = morningCutoff.split(':').map(Number)
  const cutoffMinutes = hours * 60 + minutes
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return nowMinutes < cutoffMinutes ? 'AM' : 'PM'
}
