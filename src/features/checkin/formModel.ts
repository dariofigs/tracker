import { parseDayString, todayString } from '../../lib/dates'
import type { Entry, EntryInput, Exercise, Period, SleepQuality } from '../../data/types'

/** Everything either check-in can hold. A null means "not answered", which is saved as nothing. */
export interface CheckinForm {
  wakingPain: number | null
  sleepHours: number | null
  sleepQuality: SleepQuality | null
  startingCapacity: number | null
  endPain: number | null
  exercise: Exercise | null
  activities: string[]
  symptoms: string[]
  painAreas: string[]
  stress: number | null
  remainingCapacity: number | null
  note: string
}

export const DEFAULT_SLEEP_HOURS = 7
export const DEFAULT_EXERCISE_MINUTES = 30

export function emptyForm(): CheckinForm {
  return {
    wakingPain: null,
    sleepHours: null,
    sleepQuality: null,
    startingCapacity: null,
    endPain: null,
    exercise: null,
    activities: [],
    symptoms: [],
    painAreas: [],
    stress: null,
    remainingCapacity: null,
    note: '',
  }
}

/** Editing: the form starts as the saved entry. */
export function formFromEntry(entry: Entry): CheckinForm {
  return {
    wakingPain: entry.wakingPain ?? null,
    sleepHours: entry.sleepHours ?? null,
    sleepQuality: entry.sleepQuality ?? null,
    startingCapacity: entry.startingCapacity ?? null,
    endPain: entry.endPain ?? null,
    exercise: entry.exercise ?? null,
    activities: entry.activities ?? [],
    symptoms: entry.symptoms ?? [],
    painAreas: entry.painAreas ?? [],
    stress: entry.stress ?? null,
    remainingCapacity: entry.remainingCapacity ?? null,
    note: entry.note ?? '',
  }
}

/**
 * A new check-in: carries over only what changes slowly (last night's sleep). Pain, stress and
 * capacity always start blank so a tap on them is a real answer, not an echo of yesterday.
 */
export function defaultsFrom(previous: Entry | null | undefined, period: Period): CheckinForm {
  const form = emptyForm()
  if (period === 'AM') {
    form.sleepHours = previous?.sleepHours ?? DEFAULT_SLEEP_HOURS
    form.sleepQuality = previous?.sleepQuality ?? null
  }
  return form
}

/** Only the fields that belong to this period and have an answer. Unanswered fields stay unchanged. */
export function toEntryInput(entryDate: string, period: Period, form: CheckinForm): EntryInput {
  const input: EntryInput = { entryDate, period }
  const put = <K extends keyof EntryInput>(key: K, value: EntryInput[K] | null) => {
    if (value !== null && value !== undefined) input[key] = value
  }

  if (period === 'AM') {
    put('wakingPain', form.wakingPain)
    put('sleepHours', form.sleepHours)
    put('sleepQuality', form.sleepQuality)
    put('startingCapacity', form.startingCapacity)
  } else {
    put('endPain', form.endPain)
    put('exercise', form.exercise)
    put('stress', form.stress)
    put('remainingCapacity', form.remainingCapacity)
    input.activities = form.activities
    input.symptoms = form.symptoms
    // Areas only mean something when there was pain; lowering pain to 0 clears them.
    input.painAreas = (form.endPain ?? 0) > 0 ? form.painAreas : []
  }

  const note = form.note.trim()
  input.note = note === '' ? null : note
  return input
}

const names: Record<Period, string> = { AM: 'Morning', PM: 'Evening' }

export function sheetTitle(period: Period, date: string, editing: boolean): string {
  const base = `${names[period]} check-in`
  const day =
    date === todayString()
      ? ''
      : ` · ${parseDayString(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
  return `${editing ? 'Edit ' + base.toLowerCase() : base}${day}`
}
