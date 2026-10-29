// Dev-only seed data (checklist 2.6). Written to the test project by scripts/seed-test.ts, never the real one.
// Every row carries SEED_NOTE so it can be found and removed later (8.5).

import { addDays, parseDayString } from '../lib/dates'
import type { EntryInput, Exercise, Effort, TimedLogInput } from '../data/types'

export const SEED_NOTE = 'SEED DATA'

export const SEED_OPTIONS = {
  symptom: ['Fatigue', 'Brain fog', 'Stiffness'],
  activity: ['Walk', 'Stretch', 'Chores', 'Rest'],
  exercise_type: ['Walk', 'Swim', 'Cycling', 'Stretch'],
} as const

/** Small deterministic PRNG so the same seed always produces the same data. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 2 ** 32
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const round1 = (value: number) => Math.round(value * 10) / 10
const pick = <T>(items: readonly T[], rng: () => number): T =>
  items[Math.floor(rng() * items.length)]
const subset = <T>(items: readonly T[], rng: () => number): T[] =>
  items.filter(() => rng() < 0.35)

/**
 * Builds `days` days of AM and PM entries ending on `endDay`.
 *
 * Planted effects, so the engine has something real to find:
 * - Lag: a demanding evening (30+ min at effort 3+) raises the next morning's waking pain by about 2.5.
 *   This is the 18–24h pattern, which the day-based schema records as the next morning's entry.
 * - Stress: stress 7+ in the evening raises the next morning's waking pain by about 1.
 * - Sleep: poor sleep (quality 1–2 or under 6 hours) raises the same morning's waking pain.
 */
export function generateSeed(endDay: string, days: number, rng = createRng(42)): EntryInput[] {
  const entries: EntryInput[] = []
  let previous: { exercise: Exercise | null; stress: number } | null = null

  for (let i = 0; i < days; i++) {
    const entryDate = addDays(endDay, i - (days - 1))

    const sleepHours = round1(clamp(5 + rng() * 4, 3, 10))
    const sleepQuality = Math.ceil(rng() * 5) as 1 | 2 | 3 | 4 | 5
    const sleepEffect = (sleepQuality <= 2 ? 1.5 : 0) + (sleepHours < 6 ? 1 : 0)

    const lagEffect =
      previous?.exercise && previous.exercise.minutes >= 30 && previous.exercise.effort >= 3
        ? 2.5
        : 0
    const stressLagEffect = previous && previous.stress >= 7 ? 1 : 0

    const wakingPain = clamp(
      Math.round(2 + rng() * 2 + lagEffect + stressLagEffect + sleepEffect),
      0,
      10,
    )
    const startingCapacity = clamp(Math.round(70 - wakingPain * 4 + rng() * 15), 0, 100)

    entries.push({
      entryDate,
      period: 'AM',
      wakingPain,
      sleepHours,
      sleepQuality,
      startingCapacity,
      note: SEED_NOTE,
    })

    const stress = Math.round(rng() * 10)
    const hasExercise = rng() < 0.7
    const exercise: Exercise | null = hasExercise
      ? {
          type: pick(SEED_OPTIONS.exercise_type, rng),
          minutes: Math.round(10 + rng() * 60),
          effort: (Math.ceil(rng() * 5) as Effort),
        }
      : null
    const endPain = clamp(Math.round(3 + rng() * 2 + (stress / 10) * 2), 0, 10)

    entries.push({
      entryDate,
      period: 'PM',
      endPain,
      exercise,
      activities: subset(SEED_OPTIONS.activity, rng),
      symptoms: subset(SEED_OPTIONS.symptom, rng),
      stress,
      remainingCapacity: clamp(Math.round(40 + rng() * 50), 0, 100),
      note: SEED_NOTE,
    })

    previous = { exercise, stress }
  }

  return entries
}

const at = (day: string, hour: number, minute: number) => {
  const date = parseDayString(day)
  date.setHours(hour, minute, 0, 0)
  return date
}

/**
 * Timed logs for the same days. Each exercise gets a pain reading 18–24 hours later, which is the
 * planted lag at its real granularity. A hard session (30+ min at effort 3+) adds about 3 points.
 * Readings after `latest` are skipped so nothing is dated in the future.
 */
export function generateTimedSeed(
  endDay: string,
  days: number,
  rng = createRng(7),
  latest: Date = new Date(),
): TimedLogInput[] {
  const logs: TimedLogInput[] = []

  for (let i = 0; i < days; i++) {
    const day = addDays(endDay, i - (days - 1))
    const hard = rng() < 0.4
    const exerciseAt = at(day, 10 + Math.floor(rng() * 8), Math.floor(rng() * 60))

    logs.push({
      occurredAt: exerciseAt.toISOString(),
      kind: 'exercise',
      label: pick(SEED_OPTIONS.exercise_type, rng),
      minutes: hard ? 30 + Math.round(rng() * 30) : 5 + Math.round(rng() * 20),
      effort: (hard ? 3 + Math.floor(rng() * 3) : 1 + Math.floor(rng() * 2)) as Effort,
      note: SEED_NOTE,
    })

    const readingAt = new Date(exerciseAt.getTime() + (18 + rng() * 6) * 3_600_000)
    if (readingAt <= latest) {
      logs.push({
        occurredAt: readingAt.toISOString(),
        kind: 'pain',
        pain: clamp(Math.round(2 + rng() * 2 + (hard ? 3 : 0)), 0, 10),
        note: SEED_NOTE,
      })
    }

    if (rng() < 0.3) {
      logs.push({
        occurredAt: at(day, 20, 0).toISOString(),
        kind: 'symptom',
        label: pick(SEED_OPTIONS.symptom, rng),
        note: SEED_NOTE,
      })
    }
  }

  return logs
}
