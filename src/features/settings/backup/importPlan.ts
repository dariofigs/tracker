import type { Repository } from '../../../data/repository'
import type {
  CustomOption,
  CustomOptionKind,
  Effort,
  Entry,
  EntryInput,
  Exercise,
  TimedKind,
  TimedLog,
  TimedLogInput,
} from '../../../data/types'
import { isValidCutoff } from '../../../lib/preferences'
import { BACKUP_VERSION, type BackupFile } from './backupFile'

export type ParseResult = { ok: true; backup: BackupFile } | { ok: false; error: string }

const DAY = /^\d{4}-\d{2}-\d{2}$/
const OPTION_KINDS: CustomOptionKind[] = [
  'symptom',
  'activity',
  'exercise_type',
  'pain_area',
]
const TIMED_KINDS: TimedKind[] = ['pain', 'symptom', 'activity', 'exercise']

class Invalid extends Error {}

type Obj = Record<string, unknown>

function isObj(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** An integer in range, or null when absent. Anything else rejects the file. */
function int(value: unknown, min: number, max: number, where: string): number | null {
  if (value === null || value === undefined) return null
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new Invalid(`${where} must be a whole number from ${min} to ${max}.`)
  }
  return value
}

function strings(value: unknown, where: string): string[] {
  if (value === null || value === undefined) return []
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
    throw new Invalid(`${where} must be a list of text.`)
  }
  return value as string[]
}

function text(value: unknown, where: string): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') throw new Invalid(`${where} must be text.`)
  return value
}

function realDay(value: unknown, where: string): string {
  if (typeof value !== 'string' || !DAY.test(value))
    throw new Invalid(`${where} must be a date like 2026-10-28.`)
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    throw new Invalid(`${where} is not a real date.`)
  }
  return value
}

function entryFrom(raw: unknown, i: number): Entry {
  const where = `Check-in ${i + 1}`
  if (!isObj(raw)) throw new Invalid(`${where} is not readable.`)
  if (raw.period !== 'AM' && raw.period !== 'PM')
    throw new Invalid(`${where}: period must be AM or PM.`)

  let exercise: Exercise | null = null
  if (raw.exercise !== null && raw.exercise !== undefined) {
    const x = raw.exercise
    if (!isObj(x) || typeof x.type !== 'string' || !x.type.trim()) {
      throw new Invalid(`${where}: exercise needs a type.`)
    }
    const minutes = int(x.minutes, 0, 1440, `${where}: exercise minutes`)
    const effort = int(x.effort, 1, 5, `${where}: exercise effort`)
    if (minutes === null || effort === null)
      throw new Invalid(`${where}: exercise needs minutes and effort.`)
    exercise = { type: x.type, minutes, effort: effort as Effort }
  }

  let sleepHours: number | null = null
  if (raw.sleepHours !== null && raw.sleepHours !== undefined) {
    if (typeof raw.sleepHours !== 'number' || raw.sleepHours < 0 || raw.sleepHours > 24) {
      throw new Invalid(`${where}: sleep hours must be from 0 to 24.`)
    }
    sleepHours = raw.sleepHours
  }

  return {
    id: typeof raw.id === 'string' ? raw.id : '',
    entryDate: realDay(raw.entryDate, `${where}: date`),
    period: raw.period,
    wakingPain: int(raw.wakingPain, 0, 10, `${where}: waking pain`),
    sleepHours,
    sleepQuality: int(
      raw.sleepQuality,
      1,
      5,
      `${where}: sleep quality`,
    ) as Entry['sleepQuality'],
    startingCapacity: int(raw.startingCapacity, 0, 100, `${where}: starting capacity`),
    endPain: int(raw.endPain, 0, 10, `${where}: end-of-day pain`),
    exercise,
    activities: strings(raw.activities, `${where}: activities`),
    symptoms: strings(raw.symptoms, `${where}: symptoms`),
    painAreas: strings(raw.painAreas, `${where}: body areas`),
    stress: int(raw.stress, 0, 10, `${where}: stress`),
    remainingCapacity: int(raw.remainingCapacity, 0, 100, `${where}: remaining capacity`),
    note: text(raw.note, `${where}: note`),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
  }
}

function optionFrom(raw: unknown, i: number): CustomOption {
  const where = `Option ${i + 1}`
  if (!isObj(raw)) throw new Invalid(`${where} is not readable.`)
  if (!OPTION_KINDS.includes(raw.kind as CustomOptionKind))
    throw new Invalid(`${where}: unknown kind.`)
  if (typeof raw.label !== 'string' || !raw.label.trim())
    throw new Invalid(`${where}: missing name.`)
  return {
    id: typeof raw.id === 'string' ? raw.id : '',
    kind: raw.kind as CustomOptionKind,
    label: raw.label.trim(),
    hidden: raw.hidden === true,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
  }
}

function timedLogFrom(raw: unknown, i: number): TimedLog {
  const where = `Timed log ${i + 1}`
  if (!isObj(raw)) throw new Invalid(`${where} is not readable.`)
  if (typeof raw.id !== 'string' || !raw.id) throw new Invalid(`${where}: missing id.`)
  if (!TIMED_KINDS.includes(raw.kind as TimedKind))
    throw new Invalid(`${where}: unknown kind.`)
  if (typeof raw.occurredAt !== 'string' || Number.isNaN(Date.parse(raw.occurredAt))) {
    throw new Invalid(`${where}: time is not valid.`)
  }
  const log: TimedLog = {
    id: raw.id,
    occurredAt: raw.occurredAt,
    kind: raw.kind as TimedKind,
    pain: int(raw.pain, 0, 10, `${where}: pain`),
    label: text(raw.label, `${where}: label`),
    minutes: int(raw.minutes, 0, 1440, `${where}: minutes`),
    effort: int(raw.effort, 1, 5, `${where}: effort`) as Effort | null,
    note: text(raw.note, `${where}: note`),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
  }
  const shapeOk =
    (log.kind === 'pain' && log.pain !== null) ||
    ((log.kind === 'symptom' || log.kind === 'activity') && !!log.label) ||
    (log.kind === 'exercise' && !!log.label && log.minutes !== null)
  if (!shapeOk)
    throw new Invalid(`${where}: missing the details a ${log.kind} log needs.`)
  return log
}

function list(value: unknown, name: string): unknown[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new Invalid(`The file’s ${name} are not a list.`)
  return value
}

/** Reads and checks a backup file. Nothing is trusted: one bad row rejects the whole file. */
export function parseBackup(raw: string): ParseResult {
  try {
    let data: unknown
    try {
      data = JSON.parse(raw)
    } catch {
      throw new Invalid(
        'That file isn’t a Tracker backup. Choose the .json file from Export.',
      )
    }
    if (!isObj(data) || !Array.isArray(data.entries)) {
      throw new Invalid(
        'That file isn’t a Tracker backup. Choose the .json file from Export.',
      )
    }
    if (data.version !== BACKUP_VERSION) {
      throw new Invalid(
        'This backup comes from a different version of Tracker and can’t be read.',
      )
    }

    const entries = data.entries.map(entryFrom)
    const seen = new Set<string>()
    for (const e of entries) {
      const key = `${e.entryDate}|${e.period}`
      if (seen.has(key))
        throw new Invalid(`The file has two ${e.period} check-ins for ${e.entryDate}.`)
      seen.add(key)
    }

    const preferences = isObj(data.preferences) ? data.preferences : {}
    return {
      ok: true,
      backup: {
        version: BACKUP_VERSION,
        exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : '',
        entries,
        customOptions: list(data.customOptions, 'options').map(optionFrom),
        timedLogs: list(data.timedLogs, 'timed logs').map(timedLogFrom),
        preferences: {
          morningCutoff: isValidCutoff(preferences.morningCutoff)
            ? preferences.morningCutoff
            : '',
        },
      },
    }
  } catch (error) {
    if (error instanceof Invalid) return { ok: false, error: error.message }
    throw error
  }
}

// ---- Comparing a file with what is already saved ----

/** The parts of a check-in that matter for "same or different". Ids and timestamps are not. */
function entryKey(e: Entry): string {
  return JSON.stringify([
    e.wakingPain ?? null,
    e.sleepHours ?? null,
    e.sleepQuality ?? null,
    e.startingCapacity ?? null,
    e.endPain ?? null,
    e.exercise ?? null,
    e.activities ?? [],
    e.symptoms ?? [],
    e.painAreas ?? [],
    e.stress ?? null,
    e.remainingCapacity ?? null,
    e.note ?? null,
  ])
}

function timedKey(l: TimedLog): string {
  return JSON.stringify([
    l.occurredAt && Date.parse(l.occurredAt),
    l.kind,
    l.pain,
    l.label,
    l.minutes,
    l.effort,
    l.note,
  ])
}

export type Change<T> = { incoming: T; existing: T }

export type ImportPlan = {
  entries: { added: Entry[]; unchanged: Entry[]; changed: Change<Entry>[] }
  timedLogs: { added: TimedLog[]; unchanged: TimedLog[]; changed: Change<TimedLog>[] }
  options: {
    added: CustomOption[]
    hiddenChanged: { id: string; hidden: boolean; label: string }[]
  }
  morningCutoff: string
}

function split<T>(
  incoming: T[],
  find: (item: T) => T | undefined,
  key: (item: T) => string,
): { added: T[]; unchanged: T[]; changed: Change<T>[] } {
  const out = { added: [] as T[], unchanged: [] as T[], changed: [] as Change<T>[] }
  for (const item of incoming) {
    const existing = find(item)
    if (!existing) out.added.push(item)
    else if (key(existing) === key(item)) out.unchanged.push(item)
    else out.changed.push({ incoming: item, existing })
  }
  return out
}

export type SavedData = {
  entries: Entry[]
  timedLogs: TimedLog[]
  customOptions: CustomOption[]
}

/** Sorts everything in the file into new, unchanged and different, without saving anything. */
export function planImport(backup: BackupFile, saved: SavedData): ImportPlan {
  const entryAt = new Map(saved.entries.map((e) => [`${e.entryDate}|${e.period}`, e]))
  const logAt = new Map(saved.timedLogs.map((l) => [l.id, l]))
  const optionAt = new Map(saved.customOptions.map((o) => [`${o.kind}|${o.label}`, o]))

  const options: ImportPlan['options'] = { added: [], hiddenChanged: [] }
  for (const option of backup.customOptions) {
    const existing = optionAt.get(`${option.kind}|${option.label}`)
    if (!existing) options.added.push(option)
    else if (existing.hidden !== option.hidden) {
      options.hiddenChanged.push({
        id: existing.id,
        hidden: option.hidden,
        label: option.label,
      })
    }
  }

  return {
    entries: split(
      backup.entries,
      (e) => entryAt.get(`${e.entryDate}|${e.period}`),
      entryKey,
    ),
    timedLogs: split(backup.timedLogs, (l) => logAt.get(l.id), timedKey),
    options,
    morningCutoff: backup.preferences.morningCutoff,
  }
}

export function planIsEmpty(plan: ImportPlan): boolean {
  return (
    plan.entries.added.length + plan.entries.changed.length === 0 &&
    plan.timedLogs.added.length + plan.timedLogs.changed.length === 0 &&
    plan.options.added.length + plan.options.hiddenChanged.length === 0
  )
}

// ---- Saving ----

/** Every field explicit, so null clears a value and the result matches the file exactly. */
export function entryToFullInput(e: Entry): EntryInput {
  return {
    entryDate: e.entryDate,
    period: e.period,
    wakingPain: e.wakingPain ?? null,
    sleepHours: e.sleepHours ?? null,
    sleepQuality: e.sleepQuality ?? null,
    startingCapacity: e.startingCapacity ?? null,
    endPain: e.endPain ?? null,
    exercise: e.exercise ?? null,
    activities: e.activities ?? [],
    symptoms: e.symptoms ?? [],
    painAreas: e.painAreas ?? [],
    stress: e.stress ?? null,
    remainingCapacity: e.remainingCapacity ?? null,
    note: e.note ?? null,
  }
}

function timedToInput(l: TimedLog): TimedLogInput {
  return {
    occurredAt: l.occurredAt,
    kind: l.kind,
    pain: l.pain,
    label: l.label,
    minutes: l.minutes,
    effort: l.effort,
    note: l.note,
  }
}

type ImportRepo = Pick<
  Repository,
  'upsertEntries' | 'upsertTimedLog' | 'addCustomOption' | 'updateCustomOption'
>

/** How many saves a plan makes, for the progress line. */
export function importSize(plan: ImportPlan, overwrite: boolean): number {
  const changed = overwrite
    ? plan.entries.changed.length + plan.timedLogs.changed.length
    : 0
  return (
    plan.entries.added.length +
    plan.timedLogs.added.length +
    plan.options.added.length +
    plan.options.hiddenChanged.length +
    changed
  )
}

/**
 * Saves the plan one row per request. Different rows are only replaced when `overwrite` is true.
 * Safe to run again after an interruption: saved rows then count as unchanged.
 */
export async function applyImport(
  repo: ImportRepo,
  plan: ImportPlan,
  overwrite: boolean,
  onProgress?: (done: number, total: number) => void,
) {
  const total = importSize(plan, overwrite)
  let done = 0
  const step = () => onProgress?.(++done, total)
  onProgress?.(0, total)

  for (const option of plan.options.added) {
    await repo.addCustomOption(option.kind, option.label, option.hidden)
    step()
  }
  for (const change of plan.options.hiddenChanged) {
    await repo.updateCustomOption(change.id, { hidden: change.hidden })
    step()
  }

  const entries = [
    ...plan.entries.added,
    ...(overwrite ? plan.entries.changed.map((c) => c.incoming) : []),
  ]
  for (const entry of entries) {
    await repo.upsertEntries([entryToFullInput(entry)])
    step()
  }

  const logs = [
    ...plan.timedLogs.added,
    ...(overwrite ? plan.timedLogs.changed.map((c) => c.incoming) : []),
  ]
  for (const log of logs) {
    await repo.upsertTimedLog(log.id, timedToInput(log))
    step()
  }
}
