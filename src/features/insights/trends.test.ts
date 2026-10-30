import { describe, expect, it } from 'vitest'
import type { EntryInput } from '../../data/types'
import {
  lagSeries,
  mondayOf,
  sleepPainPoints,
  stressPainPoints,
  weeklyDistribution,
} from './trends'

const am = (entryDate: string, wakingPain: number, sleepHours?: number): EntryInput => ({
  entryDate,
  period: 'AM',
  wakingPain,
  sleepHours: sleepHours ?? null,
})
const pm = (entryDate: string, extra: Partial<EntryInput> = {}): EntryInput => ({
  entryDate,
  period: 'PM',
  ...extra,
})

describe('lagSeries', () => {
  it('puts a day’s exertion beside the next morning’s pain and keeps gaps as null', () => {
    const series = lagSeries(
      [
        pm('2026-10-01', { exercise: { type: 'Walk', minutes: 30, effort: 4 } }),
        am('2026-10-02', 6),
      ],
      '2026-10-01',
      '2026-10-03',
    )
    expect(series).toEqual([
      { date: '2026-10-01', exertion: 120, pain: 6 },
      { date: '2026-10-02', exertion: null, pain: null },
      { date: '2026-10-03', exertion: null, pain: null },
    ])
  })

  it('counts a logged evening with no exercise as zero exertion', () => {
    expect(
      lagSeries([pm('2026-10-01', { exercise: null })], '2026-10-01', '2026-10-01')[0]
        .exertion,
    ).toBe(0)
  })
})

describe('scatter points', () => {
  it('pairs sleep hours with the same morning and stress with the next morning', () => {
    const entries = [
      am('2026-10-01', 4, 7),
      pm('2026-10-01', { stress: 8 }),
      am('2026-10-02', 6, 5),
    ]
    expect(sleepPainPoints(entries, '2026-10-01', '2026-10-02')).toEqual([
      { x: 7, y: 4 },
      { x: 5, y: 6 },
    ])
    expect(stressPainPoints(entries, '2026-10-01', '2026-10-02')).toEqual([
      { x: 8, y: 6 },
    ])
    expect(sleepPainPoints(entries, '2026-10-02', '2026-10-02')).toEqual([{ x: 5, y: 6 }])
  })
})

describe('weeklyDistribution', () => {
  it('finds Monday and counts flare and good days by their worst pain', () => {
    expect(mondayOf('2026-10-29')).toBe('2026-10-26')
    expect(mondayOf('2026-11-01')).toBe('2026-10-26')
    const weeks = weeklyDistribution(
      [
        am('2026-10-26', 2),
        am('2026-10-27', 3),
        pm('2026-10-27', { endPain: 8 }),
        am('2026-10-28', 5),
      ],
      '2026-10-26',
      '2026-10-28',
    )
    expect(weeks).toEqual([
      { weekStart: '2026-10-26', goodDays: 1, flareDays: 1, otherDays: 1 },
    ])
  })
})
