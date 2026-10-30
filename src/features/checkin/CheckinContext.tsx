import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Period } from '../../data/types'
import { periodFor, todayString } from '../../lib/dates'
import { useMorningCutoff } from '../../lib/preferences'
import CheckinSheet from './CheckinSheet'

type CheckinContextValue = {
  /**
   * Opens the check-in sheet. With no period it picks AM or PM from the time of day; with no date
   * it is today. Opening a day and period that already has an entry edits it.
   */
  openCheckin: (period?: Period, date?: string) => void
}

const CheckinContext = createContext<CheckinContextValue | null>(null)

type Target = { period: Period; date: string }

/** Owns the check-in sheet so any screen can open it. */
export function CheckinProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<Target | null>(null)

  const morningCutoff = useMorningCutoff()

  const openCheckin = useCallback(
    (period?: Period, date?: string) =>
      setTarget({ period: period ?? periodFor(new Date(), morningCutoff), date: date ?? todayString() }),
    [morningCutoff],
  )
  const value = useMemo(() => ({ openCheckin }), [openCheckin])

  return (
    <CheckinContext.Provider value={value}>
      {children}
      {target && (
        <CheckinSheet
          key={`${target.date}|${target.period}`}
          period={target.period}
          date={target.date}
          onClose={() => setTarget(null)}
        />
      )}
    </CheckinContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCheckin(): CheckinContextValue {
  const ctx = useContext(CheckinContext)
  if (!ctx) throw new Error('useCheckin must be used inside CheckinProvider')
  return ctx
}
