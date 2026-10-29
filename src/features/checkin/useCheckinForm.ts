import { useCallback, useEffect, useState } from 'react'
import { repository } from '../../data/repository'
import type { Period } from '../../data/types'
import { addDays } from '../../lib/dates'
import { defaultsFrom, emptyForm, formFromEntry, type CheckinForm } from './formModel'

/** How far back to look for the last entry to carry sleep defaults from. */
const HISTORY_DAYS = 14

export interface CheckinFormState {
  form: CheckinForm
  patch: (changes: Partial<CheckinForm>) => void
  /** True when the day and period already have an entry, so Save updates it. */
  editing: boolean
  /** False until the saved entry (or the defaults) has loaded. */
  ready: boolean
}

/**
 * Form state for one day and period. Starts from the saved entry when there is one, otherwise from
 * the last entry of the same period. If the lookup fails (offline), a blank form is still usable.
 */
export function useCheckinForm(period: Period, date: string): CheckinFormState {
  const [form, setForm] = useState<CheckinForm>(emptyForm)
  const [editing, setEditing] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    repository
      .getEntriesInRange(addDays(date, -HISTORY_DAYS), date)
      .then((entries) => {
        if (!active) return
        const sameSlot = entries.filter((e) => e.period === period)
        const existing = sameSlot.find((e) => e.entryDate === date)
        const previous = sameSlot.filter((e) => e.entryDate < date).at(-1)
        setEditing(Boolean(existing))
        setForm(existing ? formFromEntry(existing) : defaultsFrom(previous, period))
      })
      .catch(() => {
        if (active) setForm(defaultsFrom(null, period))
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [period, date])

  const patch = useCallback(
    (changes: Partial<CheckinForm>) => setForm((f) => ({ ...f, ...changes })),
    [],
  )

  return { form, patch, editing, ready }
}
