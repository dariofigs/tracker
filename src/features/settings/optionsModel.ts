import type {
  CustomOption,
  CustomOptionKind,
  Entry,
  EntryInput,
  TimedKind,
  TimedLog,
} from '../../data/types'
import { DEFAULT_OPTIONS } from '../checkin/options'

export type OptionRow = {
  label: string
  source: 'default' | 'custom'
  hidden: boolean
  /** The custom_options row behind this choice. A hidden built-in is switched off by such a row too. */
  id: string | null
}

/** Display name for each kind, singular. */
export const KIND_NOUN: Record<CustomOptionKind, string> = {
  symptom: 'symptom',
  activity: 'activity',
  exercise_type: 'exercise type',
  pain_area: 'body area',
}

const sameLabel = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase()

/** Every choice of one kind for the manager: built-ins first, then custom, with hidden ones marked. */
export function buildOptionRows(
  kind: CustomOptionKind,
  custom: CustomOption[],
): OptionRow[] {
  const ofKind = custom.filter((o) => o.kind === kind)
  const rows: OptionRow[] = DEFAULT_OPTIONS[kind].map((label) => {
    const switchedOff = ofKind.find((o) => o.hidden && o.label === label)
    return {
      label,
      source: 'default',
      hidden: Boolean(switchedOff),
      id: switchedOff?.id ?? null,
    }
  })
  for (const option of ofKind) {
    if (DEFAULT_OPTIONS[kind].includes(option.label)) continue
    if (rows.some((r) => r.label === option.label)) continue
    rows.push({
      label: option.label,
      source: 'custom',
      hidden: option.hidden,
      id: option.id,
    })
  }
  return rows
}

/** A plain-language reason the label cannot be used, or null when it is fine. */
export function validateLabel(
  kind: CustomOptionKind,
  label: string,
  rows: OptionRow[],
  current?: string,
): string | null {
  const trimmed = label.trim()
  if (!trimmed) return `Type a name for the ${KIND_NOUN[kind]}.`
  if (trimmed.length > 40) return 'Keep it to 40 characters or fewer.'
  if (rows.some((r) => r.label !== current && sameLabel(r.label, trimmed))) {
    return `You already have a ${KIND_NOUN[kind]} called "${trimmed}".`
  }
  return null
}

/** The entry field a rename changes. Exercise type lives inside the exercise object. */
function swap(list: string[] | undefined, from: string, to: string): string[] | null {
  if (!list?.includes(from)) return null
  return [...new Set(list.map((item) => (item === from ? to : item)))]
}

/** The save that replaces `from` with `to` on one entry, or null when the entry does not use it. */
export function renameInEntry(
  entry: Entry,
  kind: CustomOptionKind,
  from: string,
  to: string,
): EntryInput | null {
  const base = { entryDate: entry.entryDate, period: entry.period }
  if (kind === 'exercise_type') {
    if (entry.exercise?.type !== from) return null
    return { ...base, exercise: { ...entry.exercise, type: to } }
  }
  const field = { symptom: 'symptoms', activity: 'activities', pain_area: 'painAreas' }[
    kind
  ] as 'symptoms' | 'activities' | 'painAreas'
  const next = swap(entry[field], from, to)
  return next ? { ...base, [field]: next } : null
}

const TIMED_KIND: Partial<Record<CustomOptionKind, TimedKind>> = {
  symptom: 'symptom',
  activity: 'activity',
  exercise_type: 'exercise',
}

/** Timed logs that carry `label` for this kind of option. */
export function timedLogsUsing(
  logs: TimedLog[],
  kind: CustomOptionKind,
  label: string,
): TimedLog[] {
  const timedKind = TIMED_KIND[kind]
  return timedKind ? logs.filter((l) => l.kind === timedKind && l.label === label) : []
}
