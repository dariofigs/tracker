import { describe, expect, it } from 'vitest'
import { currentStreak, weekDays } from './streak'

describe('weekDays', () => {
  it('runs Sunday to Saturday around the given day', () => {
    // 2026-10-30 is a Friday.
    expect(weekDays('2026-10-30')).toEqual([
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
    ])
  })

  it('starts on the day itself when it is a Sunday', () => {
    expect(weekDays('2026-10-25')[0]).toBe('2026-10-25')
  })
})

describe('currentStreak', () => {
  it('is zero with nothing logged', () => {
    expect(currentStreak(new Set(), '2026-10-30')).toBe(0)
  })

  it('counts today when it is logged', () => {
    const days = new Set(['2026-10-28', '2026-10-29', '2026-10-30'])
    expect(currentStreak(days, '2026-10-30')).toBe(3)
  })

  it('keeps the streak alive while today is not logged yet', () => {
    const days = new Set(['2026-10-28', '2026-10-29'])
    expect(currentStreak(days, '2026-10-30')).toBe(2)
  })

  it('breaks after a missed day', () => {
    const days = new Set(['2026-10-26', '2026-10-29', '2026-10-30'])
    expect(currentStreak(days, '2026-10-30')).toBe(2)
    expect(currentStreak(new Set(['2026-10-28']), '2026-10-30')).toBe(0)
  })
})
