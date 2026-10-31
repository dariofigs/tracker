import type { Entry } from '../../data/types'
import { addDays } from '../../lib/dates'
import { entryPain } from './entrySummary'

/** Pain at or above this counts as a flare day. */
export const FLARE_PAIN = 7

export type MonthSummary = {
  daysLogged: number
  /** Mean of every logged pain rating, one decimal; null when none was rated. */
  averagePain: number | null
  flareDays: number
  /** The symptom on the most days, or null when none was logged. */
  topSymptom: { label: string; days: number } | null
}

export type NotableDay = { day: string; pain: number }

export type NotableDays = {
  highest: NotableDay | null
  /** Only set when it differs from the highest day. */
  lowest: NotableDay | null
  /** The longest run of two or more flare days in a row. */
  longestFlare: { start: string; days: number } | null
}

/** Each logged day's worst pain rating. */
function dailyPeaks(entries: Entry[]): Map<string, number> {
  const peaks = new Map<string, number>()
  for (const entry of entries) {
    const pain = entryPain(entry)
    if (pain == null) continue
    peaks.set(entry.entryDate, Math.max(peaks.get(entry.entryDate) ?? 0, pain))
  }
  return peaks
}

export function summarizeMonth(entries: Entry[]): MonthSummary {
  const ratings = entries.map(entryPain).filter((p): p is number => p != null)
  const symptomDays = new Map<string, Set<string>>()
  for (const entry of entries) {
    for (const label of entry.symptoms ?? []) {
      const days = symptomDays.get(label) ?? new Set<string>()
      days.add(entry.entryDate)
      symptomDays.set(label, days)
    }
  }
  let topSymptom: MonthSummary['topSymptom'] = null
  for (const [label, days] of symptomDays) {
    if (!topSymptom || days.size > topSymptom.days) topSymptom = { label, days: days.size }
  }
  return {
    daysLogged: new Set(entries.map((e) => e.entryDate)).size,
    averagePain: ratings.length
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null,
    flareDays: [...dailyPeaks(entries).values()].filter((p) => p >= FLARE_PAIN).length,
    topSymptom,
  }
}

export function notableDays(entries: Entry[]): NotableDays {
  const peaks = [...dailyPeaks(entries)].sort(([a], [b]) => a.localeCompare(b))
  let highest: NotableDay | null = null
  let lowest: NotableDay | null = null
  for (const [day, pain] of peaks) {
    if (!highest || pain > highest.pain) highest = { day, pain }
    if (!lowest || pain < lowest.pain) lowest = { day, pain }
  }

  let longestFlare: NotableDays['longestFlare'] = null
  let run: { start: string; days: number } | null = null
  let previous = ''
  for (const [day, pain] of peaks) {
    if (pain < FLARE_PAIN) {
      run = null
      continue
    }
    const continuing: boolean = run !== null && addDays(previous, 1) === day
    run = continuing && run ? { start: run.start, days: run.days + 1 } : { start: day, days: 1 }
    previous = day
    if (run.days >= 2 && (!longestFlare || run.days > longestFlare.days)) longestFlare = run
  }

  // A month with no pain above zero has no "highest" worth pointing at.
  if (highest && highest.pain === 0) return { highest: null, lowest: null, longestFlare: null }

  return {
    highest,
    lowest: lowest && highest && lowest.pain !== highest.pain ? lowest : null,
    longestFlare,
  }
}
