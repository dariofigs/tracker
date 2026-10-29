import { useCallback, useEffect, useState } from 'react'
import { repository } from '../data/repository'
import type { Entry } from '../data/types'
import { todayString } from '../lib/dates'
import { useSaveStatus } from './useSaveStatus'

export interface TodayEntries {
  morning: Entry | null
  evening: Entry | null
  loading: boolean
  error: string | null
  reload: () => void
}

/** Today's AM and PM entries. Reloads when the save queue settles, so a new check-in shows up at once. */
export function useTodayEntries(): TodayEntries {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const { state } = useSaveStatus()

  useEffect(() => {
    let active = true
    repository
      .getEntriesForDate(todayString())
      .then((rows) => {
        if (!active) return
        setEntries(rows)
        setError(null)
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'Could not load today')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [version, state])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return {
    morning: entries.find((e) => e.period === 'AM') ?? null,
    evening: entries.find((e) => e.period === 'PM') ?? null,
    loading,
    error,
    reload,
  }
}
