import { useCallback, useEffect, useState } from 'react'
import { repository } from '../data/repository'
import type { Entry } from '../data/types'
import { useSaveStatus } from './useSaveStatus'

export interface EntriesInRange {
  entries: Entry[]
  loading: boolean
  error: string | null
  reload: () => void
}

/** Entries between two local days, inclusive. Reloads when the save queue settles. */
export function useEntriesInRange(from: string, to: string): EntriesInRange {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const { state } = useSaveStatus()

  useEffect(() => {
    let active = true
    repository
      .getEntriesInRange(from, to)
      .then((rows) => {
        if (!active) return
        setEntries(rows)
        setError(null)
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'Could not load entries')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [from, to, version, state])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { entries, loading, error, reload }
}
