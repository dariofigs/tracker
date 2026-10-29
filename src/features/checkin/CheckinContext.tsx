import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { BottomSheet } from '../../components/ui'
import type { Period } from '../../data/types'
import { periodFor } from '../../lib/dates'

type CheckinContextValue = {
  /** Opens the check-in sheet; with no period it picks AM or PM from the time of day. */
  openCheckin: (period?: Period) => void
}

const CheckinContext = createContext<CheckinContextValue | null>(null)

const titles: Record<Period, string> = { AM: 'Morning check-in', PM: 'Evening check-in' }

/** Owns the check-in sheet so any screen can open it. The form itself arrives in Phase 5. */
export function CheckinProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period | null>(null)

  const openCheckin = useCallback((p?: Period) => setPeriod(p ?? periodFor()), [])
  const value = useMemo(() => ({ openCheckin }), [openCheckin])

  return (
    <CheckinContext.Provider value={value}>
      {children}
      <BottomSheet
        open={period !== null}
        onClose={() => setPeriod(null)}
        title={titles[period ?? 'AM']}
      >
        <p className="text-body text-text-muted pb-[1.6rem]">
          The check-in form is coming soon.
        </p>
      </BottomSheet>
    </CheckinContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCheckin(): CheckinContextValue {
  const ctx = useContext(CheckinContext)
  if (!ctx) throw new Error('useCheckin must be used inside CheckinProvider')
  return ctx
}
