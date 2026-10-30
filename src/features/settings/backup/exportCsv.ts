import type { Entry, TimedLog } from '../../../data/types'

type Cell = string | number | null | undefined

/**
 * One CSV field. Quotes when needed (RFC 4180) and prefixes a quote to text a spreadsheet would
 * run as a formula, so a note like "=1+1" stays text.
 */
export function csvCell(value: Cell): string {
  if (value === null || value === undefined) return ''
  let text = String(value)
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function toCsv(header: string[], rows: Cell[][]): string {
  // The BOM makes Excel read the file as UTF-8, so accents and symbols survive.
  return (
    '﻿' + [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
  )
}

const ENTRY_HEADER = [
  'date',
  'period',
  'waking_pain',
  'sleep_hours',
  'sleep_quality',
  'starting_capacity',
  'end_pain',
  'exercise_type',
  'exercise_minutes',
  'exercise_effort',
  'activities',
  'symptoms',
  'pain_areas',
  'stress',
  'remaining_capacity',
  'note',
]

/** One row per check-in. Lists are joined with "; ". */
export function entriesToCsv(entries: Entry[]): string {
  return toCsv(
    ENTRY_HEADER,
    entries.map((e) => [
      e.entryDate,
      e.period,
      e.wakingPain,
      e.sleepHours,
      e.sleepQuality,
      e.startingCapacity,
      e.endPain,
      e.exercise?.type,
      e.exercise?.minutes,
      e.exercise?.effort,
      (e.activities ?? []).join('; '),
      (e.symptoms ?? []).join('; '),
      (e.painAreas ?? []).join('; '),
      e.stress,
      e.remainingCapacity,
      e.note,
    ]),
  )
}

const TIMED_HEADER = ['occurred_at', 'kind', 'pain', 'label', 'minutes', 'effort', 'note']

export function timedLogsToCsv(logs: TimedLog[]): string {
  return toCsv(
    TIMED_HEADER,
    logs.map((l) => [l.occurredAt, l.kind, l.pain, l.label, l.minutes, l.effort, l.note]),
  )
}
