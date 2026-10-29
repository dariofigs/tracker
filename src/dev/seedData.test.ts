import { describe, expect, it } from 'vitest'
import { generateSeed, SEED_NOTE } from './seedData'

const END = '2026-10-28'
const DAYS = 60

const average = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length

describe('generateSeed', () => {
  const entries = generateSeed(END, DAYS)
  const am = entries.filter((e) => e.period === 'AM')
  const pm = entries.filter((e) => e.period === 'PM')

  it('creates one AM and one PM entry per day, all flagged as seed data', () => {
    expect(am).toHaveLength(DAYS)
    expect(pm).toHaveLength(DAYS)
    expect(entries.every((e) => e.note === SEED_NOTE)).toBe(true)
  })

  it('keeps every value inside its allowed range', () => {
    for (const e of am) {
      expect(e.wakingPain).toBeGreaterThanOrEqual(0)
      expect(e.wakingPain).toBeLessThanOrEqual(10)
      expect(e.sleepHours).toBeGreaterThanOrEqual(0)
      expect(e.sleepHours).toBeLessThanOrEqual(24)
      expect(e.sleepQuality).toBeGreaterThanOrEqual(1)
      expect(e.sleepQuality).toBeLessThanOrEqual(5)
      expect(e.startingCapacity).toBeGreaterThanOrEqual(0)
      expect(e.startingCapacity).toBeLessThanOrEqual(100)
    }
    for (const e of pm) {
      expect(e.endPain).toBeGreaterThanOrEqual(0)
      expect(e.endPain).toBeLessThanOrEqual(10)
      expect(e.stress).toBeGreaterThanOrEqual(0)
      expect(e.stress).toBeLessThanOrEqual(10)
    }
  })

  it('plants a next-morning pain rise after demanding evenings', () => {
    // Pair each evening with the following morning, the same pairing the engine uses (6.1).
    const nextMorningPain = (predicate: (e: (typeof pm)[number]) => boolean) =>
      pm
        .map((evening, i) => ({ evening, morning: am[i + 1] }))
        .filter(({ evening, morning }) => morning && predicate(evening))
        .map(({ morning }) => morning.wakingPain as number)

    const afterHard = nextMorningPain(
      (e) => (e.exercise?.minutes ?? 0) >= 30 && (e.exercise?.effort ?? 0) >= 3,
    )
    const afterOther = nextMorningPain(
      (e) => !((e.exercise?.minutes ?? 0) >= 30 && (e.exercise?.effort ?? 0) >= 3),
    )

    expect(average(afterHard) - average(afterOther)).toBeGreaterThan(1.5)
  })
})
