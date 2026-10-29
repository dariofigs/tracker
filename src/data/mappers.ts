import type { CustomOption, CustomOptionRow, Entry, EntryInput, EntryRow, Exercise } from './types'

/** Postgres numeric columns can come back as strings, so coerce them. */
function num(value: number | string | null): number | null {
  return value === null ? null : Number(value)
}

export function entryFromRow(row: EntryRow): Entry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    period: row.period,
    wakingPain: num(row.waking_pain),
    sleepHours: num(row.sleep_hours),
    sleepQuality: num(row.sleep_quality) as Entry['sleepQuality'],
    startingCapacity: num(row.starting_capacity),
    endPain: num(row.end_pain),
    exercise: row.exercise as Exercise | null,
    activities: row.activities,
    symptoms: row.symptoms,
    stress: num(row.stress),
    remainingCapacity: num(row.remaining_capacity),
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Columns that map one-to-one from the input. Keys left undefined are omitted from the row. */
const ENTRY_COLUMNS = [
  ['wakingPain', 'waking_pain'],
  ['sleepHours', 'sleep_hours'],
  ['sleepQuality', 'sleep_quality'],
  ['startingCapacity', 'starting_capacity'],
  ['endPain', 'end_pain'],
  ['exercise', 'exercise'],
  ['activities', 'activities'],
  ['symptoms', 'symptoms'],
  ['stress', 'stress'],
  ['remainingCapacity', 'remaining_capacity'],
  ['note', 'note'],
] as const

/**
 * Builds the row sent on upsert. Only fields the caller supplies are included, so a save
 * changes those columns and leaves the rest alone. Pass null to clear a field on purpose.
 */
export function entryToRow(input: EntryInput): Record<string, unknown> {
  const row: Record<string, unknown> = { entry_date: input.entryDate, period: input.period }
  for (const [key, column] of ENTRY_COLUMNS) {
    if (input[key] !== undefined) row[column] = input[key]
  }
  return row
}

export function customOptionFromRow(row: CustomOptionRow): CustomOption {
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    hidden: row.hidden,
    createdAt: row.created_at,
  }
}
