import { describe, expect, it } from 'vitest'
import { createRng, generateSeed } from '../../../dev/seedData'
import type { EntryInput } from '../../../data/types'
import { compareGroups } from './compare'
import { buildFactors } from './factors'
import {
  findInsights,
  MIN_PAIRED_DAYS,
  type Insight,
  type InsightsResult,
} from './insights'
import {
  buildDays,
  pairEveningToMorning,
  pairSleepToMorning,
  pairWithMorningPain,
} from './pairing'
import { needsMoreDaysText } from './wording'

const END = '2026-10-28'

const am = (
  entryDate: string,
  wakingPain: number | null,
  extra: Partial<EntryInput> = {},
): EntryInput => ({
  entryDate,
  period: 'AM',
  wakingPain,
  ...extra,
})
const pm = (entryDate: string, extra: Partial<EntryInput> = {}): EntryInput => ({
  entryDate,
  period: 'PM',
  ...extra,
})

function insightsOf(result: InsightsResult): Insight[] {
  if (result.status !== 'ready') throw new Error('expected a ready result')
  return result.insights
}

describe('pairing', () => {
  const days = buildDays([
    pm('2026-10-01', { stress: 8 }),
    am('2026-10-02', 5, { sleepHours: 5 }),
    pm('2026-10-02', { stress: 2 }),
    am('2026-10-03', null),
    am('2026-10-04', 3),
  ])

  it('groups entries by day, oldest first', () => {
    expect(days.map((d) => d.date)).toEqual([
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ])
    expect(days[1].am?.wakingPain).toBe(5)
    expect(days[1].pm?.stress).toBe(2)
  })

  it('pairs each evening with the next morning (6.1) and drops mornings with no pain', () => {
    const pairs = pairEveningToMorning(days)
    expect(pairs.map((p) => [p.day.date, p.pain])).toEqual([['2026-10-01', 5]])
  })

  it('pairs each night with the same morning (6.2)', () => {
    const pairs = pairSleepToMorning(days)
    expect(pairs.map((p) => [p.day.date, p.pain])).toEqual([
      ['2026-10-02', 5],
      ['2026-10-04', 3],
    ])
  })

  it('pairs at a lag of two days and skips gaps in the log', () => {
    const pairs = pairWithMorningPain(days, 2)
    expect(pairs.map((p) => [p.day.date, p.pain])).toEqual([['2026-10-02', 3]])
  })
})

describe('compareGroups', () => {
  it('reports the difference, the percent and the days behind it (6.3)', () => {
    const result = compareGroups([6, 8, 7], [4, 5, 3, 4])
    expect(result).toMatchObject({ n1: 3, n2: 4, mean1: 7, mean2: 4, diff: 3 })
    expect(result?.pctDiff).toBeCloseTo(75)
    expect(result?.t).toBeGreaterThan(3)
  })

  it('returns null when a group is empty', () => {
    expect(compareGroups([], [1, 2])).toBeNull()
    expect(compareGroups([1, 2], [])).toBeNull()
  })

  it('gives no percent when the baseline is zero and no t when there is no spread', () => {
    const result = compareGroups([2, 2], [0, 0])
    expect(result?.pctDiff).toBeNull()
    expect(result?.t).toBe(0)
  })
})

describe('buildFactors', () => {
  it('adds a factor for each activity and symptom in the data', () => {
    const factors = buildFactors(
      buildDays([pm('2026-10-01', { activities: ['Walk'], symptoms: ['Fatigue'] })]),
    )
    expect(factors.map((f) => f.id)).toEqual(
      expect.arrayContaining([
        'hard-exercise',
        'poor-sleep',
        'activity:Walk',
        'symptom:Fatigue',
      ]),
    )
  })

  it('treats a day with no data for a factor as unknown rather than absent', () => {
    const [day] = buildDays([am('2026-10-01', 3)])
    const factors = buildFactors([day])
    expect(factors.find((f) => f.id === 'hard-exercise')?.applies(day)).toBeNull()
    expect(factors.find((f) => f.id === 'poor-sleep')?.applies(day)).toBeNull()
  })
})

describe('findInsights', () => {
  it('asks for more days below the minimum (6.5)', () => {
    const entries = generateSeed(END, MIN_PAIRED_DAYS - 3)
    expect(findInsights(entries)).toEqual({
      status: 'needs-more-days',
      have: MIN_PAIRED_DAYS - 3,
      need: MIN_PAIRED_DAYS,
    })
  })

  it('says how many more days are needed', () => {
    expect(needsMoreDaysText(0, 10)).toMatch(/at least 10 days/)
    expect(needsMoreDaysText(9, 10)).toBe(
      '9 of 10 days so far. Log 1 more day and patterns can start to appear.',
    )
  })

  describe('with the planted seed data (6.6)', () => {
    const insights = insightsOf(findInsights(generateSeed(END, 90)))
    const byId = (id: string) => insights.find((i) => i.factorId === id)

    it('finds the lag from hard exercise to the next morning', () => {
      const found = byId('hard-exercise')
      expect(found?.lag).toEqual({ value: 1, unit: 'days' })
      expect(found?.direction).toBe('higher')
      expect(found?.diff).toBeGreaterThan(1.5)
    })

    it('finds the sleep effect on the same morning', () => {
      const found = byId('poor-sleep')
      expect(found?.lag).toEqual({ value: 0, unit: 'days' })
      expect(found?.direction).toBe('higher')
    })

    it('holds back the small stress effect until there is enough data to trust it', () => {
      expect(byId('high-stress')).toBeUndefined()
      const year = insightsOf(findInsights(generateSeed(END, 365)))
      expect(year.find((i) => i.factorId === 'high-stress')?.lag).toEqual({
        value: 1,
        unit: 'days',
      })
    })

    it('reports nothing for activities and symptoms, which have no planted effect', () => {
      expect(insights.filter((i) => /^(activity|symptom):/.test(i.factorId))).toEqual([])
    })

    it('ranks the strongest pattern first and words it as an observation', () => {
      expect(insights[0].factorId).toBe('hard-exercise')
      expect(insights[0].text).toMatch(/in your data/)
    })
  })

  it('finds nothing in pure noise across many seeds', () => {
    const runs = 200
    let withInsight = 0
    for (let seed = 1; seed <= runs; seed++) {
      const rng = createRng(seed)
      const entries: EntryInput[] = []
      for (let i = 0; i < 60; i++) {
        const date = `2026-${i < 30 ? '09' : '10'}-${String((i % 30) + 1).padStart(2, '0')}`
        entries.push(
          am(date, Math.round(rng() * 10), {
            sleepHours: 4 + rng() * 5,
            sleepQuality: (1 + Math.floor(rng() * 5)) as 1 | 2 | 3 | 4 | 5,
          }),
          pm(date, {
            stress: Math.round(rng() * 10),
            exercise:
              rng() < 0.6
                ? {
                    type: 'Walk',
                    minutes: 10 + Math.round(rng() * 60),
                    effort: (1 + Math.floor(rng() * 5)) as 1 | 2 | 3 | 4 | 5,
                  }
                : null,
            activities: ['Walk', 'Rest', 'Chores'].filter(() => rng() < 0.4),
            symptoms: ['Fatigue', 'Brain fog'].filter(() => rng() < 0.4),
          }),
        )
      }
      const result = findInsights(entries)
      if (result.status === 'ready' && result.insights.length > 0) withInsight++
    }
    expect(withInsight / runs).toBeLessThanOrEqual(0.03)
  })
})
