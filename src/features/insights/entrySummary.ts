import type { Entry } from '../../data/types'

/** The facts of one check-in as short lines, skipping anything not logged. */
export function entrySummary(entry: Entry): string[] {
  const lines: string[] = []
  if (entry.period === 'AM') {
    if (entry.wakingPain != null) lines.push(`Waking pain ${entry.wakingPain} of 10`)
    if (entry.sleepHours != null || entry.sleepQuality != null) {
      const hours = entry.sleepHours != null ? `${entry.sleepHours} hours` : null
      const quality =
        entry.sleepQuality != null ? `quality ${entry.sleepQuality} of 5` : null
      lines.push(`Slept ${[hours, quality].filter(Boolean).join(', ')}`)
    }
    if (entry.startingCapacity != null)
      lines.push(`Starting capacity ${entry.startingCapacity}%`)
  } else {
    if (entry.endPain != null) lines.push(`End-of-day pain ${entry.endPain} of 10`)
    if (entry.exercise) {
      const { type, minutes, effort } = entry.exercise
      lines.push(`${type}, ${minutes} min, effort ${effort} of 5`)
    }
    if (entry.activities?.length) lines.push(`Activities: ${entry.activities.join(', ')}`)
    if (entry.symptoms?.length) lines.push(`Symptoms: ${entry.symptoms.join(', ')}`)
    if (entry.painAreas?.length) lines.push(`Pain areas: ${entry.painAreas.join(', ')}`)
    if (entry.stress != null) lines.push(`Stress ${entry.stress} of 10`)
    if (entry.remainingCapacity != null)
      lines.push(`Remaining capacity ${entry.remainingCapacity}%`)
  }
  if (entry.note) lines.push(`Note: ${entry.note}`)
  return lines
}

/** The pain rating shown for a check-in on the calendar. */
export function entryPain(entry: Entry | undefined): number | null {
  if (!entry) return null
  return (entry.period === 'AM' ? entry.wakingPain : entry.endPain) ?? null
}
