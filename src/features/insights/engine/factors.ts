import type { DayRecord } from './pairing'

export const HARD_EXERCISE_MINUTES = 30
export const HARD_EXERCISE_EFFORT = 3
export const HIGH_STRESS = 7
export const POOR_SLEEP_QUALITY = 2
export const POOR_SLEEP_HOURS = 6

export type Factor = {
  id: string
  label: string
  /** Which check-in the factor is logged in. A morning factor describes the night before it. */
  period: 'AM' | 'PM'
  /** True or false for a day, or null when that day has no data for this factor. */
  applies: (day: DayRecord) => boolean | null
}

const hardExercise: Factor = {
  id: 'hard-exercise',
  period: 'PM',
  label: 'hard exercise',
  applies: ({ pm }) =>
    pm
      ? !!pm.exercise &&
        pm.exercise.minutes >= HARD_EXERCISE_MINUTES &&
        pm.exercise.effort >= HARD_EXERCISE_EFFORT
      : null,
}

const anyExercise: Factor = {
  id: 'any-exercise',
  period: 'PM',
  label: 'any exercise',
  applies: ({ pm }) => (pm ? !!pm.exercise : null),
}

const highStress: Factor = {
  id: 'high-stress',
  period: 'PM',
  label: 'high stress',
  applies: ({ pm }) => (pm?.stress != null ? pm.stress >= HIGH_STRESS : null),
}

const poorSleep: Factor = {
  id: 'poor-sleep',
  period: 'AM',
  label: 'poor sleep',
  applies: ({ am }) => {
    if (am?.sleepQuality == null && am?.sleepHours == null) return null
    return (
      (am.sleepQuality != null && am.sleepQuality <= POOR_SLEEP_QUALITY) ||
      (am.sleepHours != null && am.sleepHours < POOR_SLEEP_HOURS)
    )
  },
}

/** Fixed, explainable factors plus one per activity and symptom label that appears in the data. */
export function buildFactors(days: DayRecord[]): Factor[] {
  const activities = new Set<string>()
  const symptoms = new Set<string>()
  for (const { pm } of days) {
    pm?.activities?.forEach((a) => activities.add(a))
    pm?.symptoms?.forEach((s) => symptoms.add(s))
  }

  return [
    hardExercise,
    anyExercise,
    highStress,
    poorSleep,
    ...[...activities].sort().map<Factor>((label) => ({
      id: `activity:${label}`,
      label,
      period: 'PM',
      applies: ({ pm }) => (pm ? !!pm.activities?.includes(label) : null),
    })),
    ...[...symptoms].sort().map<Factor>((label) => ({
      id: `symptom:${label}`,
      label,
      period: 'PM',
      applies: ({ pm }) => (pm ? !!pm.symptoms?.includes(label) : null),
    })),
  ]
}
