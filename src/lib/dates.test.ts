import { describe, expect, it } from 'vitest'
import {
  addDays,
  dayBounds,
  parseDayString,
  periodFor,
  toDayString,
  todayString,
} from './dates'

describe('toDayString', () => {
  it('uses the local calendar day, not the UTC day', () => {
    // 00:30 local on 1 March, which is still 28 February in UTC for zones east of UTC.
    expect(toDayString(new Date(2026, 2, 1, 0, 30))).toBe('2026-03-01')
  })

  it('zero-pads month and day', () => {
    expect(toDayString(new Date(2026, 0, 5, 9))).toBe('2026-01-05')
  })
})

describe('todayString', () => {
  it('returns the day of the given time', () => {
    expect(todayString(new Date(2026, 9, 28, 23, 59))).toBe('2026-10-28')
  })
})

describe('addDays', () => {
  it('moves across month and year boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('handles leap days', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01')
  })

  it('keeps the calendar day across the spring DST change', () => {
    // 29 March 2026 is when many European zones move clocks forward.
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29')
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30')
  })
})

describe('dayBounds', () => {
  it('covers exactly one local day', () => {
    const { start, end } = dayBounds('2026-10-28')
    expect(start).toEqual(parseDayString('2026-10-28'))
    expect(end).toEqual(parseDayString('2026-10-29'))
  })

  it('includes a late-evening timestamp and excludes midnight of the next day', () => {
    const { start, end } = dayBounds('2026-10-28')
    const lateEvening = new Date(2026, 9, 28, 23, 45)
    const nextMidnight = new Date(2026, 9, 29, 0, 0)
    expect(lateEvening >= start && lateEvening < end).toBe(true)
    expect(nextMidnight >= start && nextMidnight < end).toBe(false)
  })
})

describe('periodFor', () => {
  it('is AM before noon and PM from noon onward by default', () => {
    expect(periodFor(new Date(2026, 9, 28, 8, 0))).toBe('AM')
    expect(periodFor(new Date(2026, 9, 28, 11, 59))).toBe('AM')
    expect(periodFor(new Date(2026, 9, 28, 12, 0))).toBe('PM')
    expect(periodFor(new Date(2026, 9, 28, 22, 0))).toBe('PM')
  })

  it('follows a custom morning cutoff', () => {
    expect(periodFor(new Date(2026, 9, 28, 13, 0), '14:00')).toBe('AM')
    expect(periodFor(new Date(2026, 9, 28, 14, 0), '14:00')).toBe('PM')
    expect(periodFor(new Date(2026, 9, 28, 4, 30), '04:30')).toBe('PM')
  })
})
