import { useEffect, useState } from 'react'
import { repository } from '../data/repository'
import type { Entry } from '../data/types'
import { addDays, todayString } from '../lib/dates'
import { useSaveStatus } from './useSaveStatus'

/** Entries from the last `days` days before today. Reloads when the save queue settles. */
export function useRecentEntries(days: number): Entry[] {
  const [entries, setEntries] = useState<Entry[]>([])
  const { state } = useSaveStatus()

  useEffect(() => {
    let active = true
    const today = todayString()
    repository
      .getEntriesInRange(addDays(today, -days), addDays(today, -1))
      .then((rows) => {
        if (active) setEntries(rows)
      })
      .catch(() => {
        // The list is a convenience; Today itself reports load problems.
      })
    return () => {
      active = false
    }
  }, [days, state])

  return entries
}
