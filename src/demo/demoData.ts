// Sample data for the /demo route. Entirely invented: no real person, place, medication or date.
// Dates are relative to "today", so the calendar and Today screen always look current.

import { addDays, parseDayString, periodFor, todayString } from '../lib/dates'
import { createRng } from '../dev/seedData'
import type { CustomOptionKind, Effort, EntryInput, Exercise, SleepQuality } from '../data/types'

export const DEMO_DAYS = 120

/** Days back from yesterday where a flare starts, and how many days it lasts. */
const FLARES = [
  { back: 100, length: 5 },
  { back: 58, length: 6 },
  { back: 21, length: 4 },
]

/** Options added in Settings, so the options manager has something to show. */
export const DEMO_CUSTOM_OPTIONS: { kind: CustomOptionKind; label: string; hidden: boolean }[] = [
  { kind: 'exercise_type', label: 'Swim', hidden: false },
  { kind: 'activity', label: 'Gardening', hidden: false },
  { kind: 'symptom', label: 'Joint stiffness', hidden: false },
  { kind: 'symptom', label: 'Nausea', hidden: true },
  { kind: 'pain_area', label: 'Wrists', hidden: false },
]

const CALM_NOTES = [
  'Slow start but it loosened up by lunch.',
  'Good day. Paced myself and it paid off.',
  'Short walk after dinner helped.',
  'Tired but not sore.',
  'Took the stairs without thinking about it.',
  'Quiet day at home. Felt steady.',
  'Stretched before bed, slept better.',
  'Managed a full morning of errands.',
]

const FLARE_NOTES = [
  'Woke up stiff and it stayed that way.',
  'Had to cancel plans. Rested most of the day.',
  'Heavy day after yesterday’s long session.',
  'Hard to focus. Kept everything small.',
  'Heat pack and an early night.',
  'Slightly better than yesterday.',
]

const STRESS_NOTES = ['Busy day at work. Shoulders tight by evening.', 'Deadline stress, skipped my stretch.']

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]
}

function pickSome<T>(items: readonly T[], count: number, rng: () => number): T[] {
  const pool = [...items]
  const chosen: T[] = []
  while (chosen.length < count && pool.length > 0) {
    chosen.push(pool.splice(Math.floor(rng() * pool.length), 1)[0])
  }
  return chosen
}

const ACTIVITIES = ['Walk', 'Strength', 'Stretch', 'Chores', 'Rest', 'Work', 'Gardening']
const SYMPTOMS = ['Fatigue', 'Brain fog', 'Headache', 'Joint stiffness']
const COMMON_AREAS = ['Lower back', 'Neck', 'Shoulders', 'Hips', 'Knees', 'Upper back']
const FLARE_AREAS = ['Lower back', 'Hips', 'Legs', 'Neck', 'Shoulders', 'Hands', 'Wrists']

/**
 * About `days` days of AM and PM check-ins ending yesterday, plus this morning when the clock has
 * passed the check-in switch time, so Today shows a half-finished day with the evening still to log.
 *
 * Planted patterns, so Trends has real findings:
 * - A demanding evening (30+ min at effort 3+) raises the next morning's pain by about 2.5.
 * - Stress of 7+ adds about 1 to the next morning, and poor sleep adds to the same morning.
 * - Three flares lift pain for several days and cut capacity.
 */
export function generateDemoEntries(now: Date = new Date(), days = DEMO_DAYS): EntryInput[] {
  const rng = createRng(2024)
  const today = todayString(now)
  const yesterday = addDays(today, -1)
  const entries: EntryInput[] = []

  let previous: { exercise: Exercise | null; stress: number } | null = null
  let flareNext = 0

  for (let i = 0; i < days; i++) {
    const back = days - 1 - i
    const entryDate = addDays(yesterday, -back)
    const flare = FLARES.find((f) => back <= f.back && back > f.back - f.length)
    const flareStep = flare ? flare.back - back : -1
    const flareBoost = flare ? clamp(3.5 - flareStep * 0.5, 1, 3.5) : flareNext > 0 ? 1 : 0
    flareNext = flare ? 1 : 0

    const weekday = parseDayString(entryDate).getDay()
    const weekend = weekday === 0 || weekday === 6

    const sleepHours = Math.round(clamp(6.8 + (rng() - 0.5) * 3 - flareBoost * 0.3, 4, 9.5) * 10) / 10
    const sleepQuality = clamp(
      Math.round(3.4 + (rng() - 0.5) * 3 - flareBoost * 0.4),
      1,
      5,
    ) as SleepQuality
    const sleepEffect = (sleepQuality <= 2 ? 1.5 : 0) + (sleepHours < 6 ? 1 : 0)
    const lagEffect =
      previous?.exercise && previous.exercise.minutes >= 30 && previous.exercise.effort >= 3 ? 2.5 : 0
    const stressLag = previous && previous.stress >= 7 ? 1 : 0

    const wakingPain = clamp(
      Math.round(1.5 + rng() * 2 + lagEffect + stressLag + sleepEffect + flareBoost),
      0,
      10,
    )
    const startingCapacity = clamp(
      Math.round(78 - wakingPain * 5 - flareBoost * 4 + rng() * 14),
      5,
      100,
    )

    const calm = wakingPain <= 4
    entries.push({
      entryDate,
      period: 'AM',
      wakingPain,
      sleepHours,
      sleepQuality,
      startingCapacity,
      note: rng() < 0.18 ? pick(calm ? CALM_NOTES : FLARE_NOTES, rng) : null,
    })

    const stress = clamp(Math.round(3 + rng() * 4 + (weekend ? -2 : 1.5) + flareBoost * 0.4), 0, 10)
    const exerciseChance = flare ? 0.35 : weekend ? 0.8 : 0.6
    const exercise: Exercise | null =
      rng() < exerciseChance
        ? {
            type: pick(['Walk', 'Walk', 'Stretch', 'Strength', 'Swim'], rng),
            minutes: Math.round(10 + rng() * (weekend ? 55 : 40)),
            effort: clamp(Math.ceil(rng() * 5), flare ? 1 : 1, flare ? 2 : 5) as Effort,
          }
        : null
    const endPain = clamp(
      Math.round(wakingPain * 0.6 + 1.5 + rng() * 2 + (stress / 10) * 1.5),
      0,
      10,
    )
    const activities = pickSome(ACTIVITIES, 1 + Math.floor(rng() * 3), rng)
    const symptoms = pickSome(SYMPTOMS, flare ? 2 : rng() < 0.4 ? 1 : 0, rng)
    const painAreas =
      endPain > 0 ? pickSome(flare ? FLARE_AREAS : COMMON_AREAS, flare ? 3 : 1 + Math.floor(rng() * 2), rng) : []

    entries.push({
      entryDate,
      period: 'PM',
      endPain,
      exercise,
      activities,
      symptoms,
      painAreas,
      stress,
      remainingCapacity: clamp(Math.round(startingCapacity * 0.5 + rng() * 25 - flareBoost * 3), 0, 100),
      note: rng() < 0.12 && stress >= 7 ? pick(STRESS_NOTES, rng) : null,
    })

    previous = { exercise, stress }
  }

  if (periodFor(now) === 'PM') {
    const wakingPain = clamp(
      Math.round(3 + rng() * 1.5 + (previous && previous.stress >= 7 ? 1 : 0)),
      0,
      10,
    )
    entries.push({
      entryDate: today,
      period: 'AM',
      wakingPain,
      sleepHours: 7.2,
      sleepQuality: 4,
      startingCapacity: clamp(Math.round(74 - wakingPain * 4), 0, 100),
      note: null,
    })
  }

  return entries
}
