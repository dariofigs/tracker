import { useState } from 'react'
import { BottomSheet, Button } from '../../components/ui'
import { repository } from '../../data/repository'
import type { Entry, Period } from '../../data/types'
import { parseDayString } from '../../lib/dates'
import { entrySummary } from './entrySummary'

const PERIODS: { period: Period; label: string }[] = [
  { period: 'AM', label: 'Morning' },
  { period: 'PM', label: 'Evening' },
]

type DayDetailSheetProps = {
  day: string
  entries: Entry[]
  onClose: () => void
  /** Open the check-in sheet for this day and period. */
  onEdit: (period: Period) => void
  /** Called after an entry is deleted, so the caller can reload. */
  onDeleted: () => void
}

/** One day's entries with edit and delete. Delete asks first. */
function DayDetailSheet({
  day,
  entries,
  onClose,
  onEdit,
  onDeleted,
}: DayDetailSheetProps) {
  const [confirming, setConfirming] = useState<Entry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function remove(entry: Entry) {
    setBusy(true)
    setError(null)
    try {
      await repository.deleteEntry(entry.id)
      setConfirming(null)
      onDeleted()
    } catch {
      setError('Couldn’t delete that entry. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={parseDayString(day).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}
      footer={
        <Button variant="secondary" fullWidth onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-[2.4rem] pb-[0.8rem]">
        {PERIODS.map(({ period, label }) => {
          const entry = entries.find((e) => e.period === period)
          const lowerLabel = label.toLowerCase()
          const lines = entry ? entrySummary(entry) : []
          return (
            <section
              key={period}
              aria-label={label}
              className="flex flex-col gap-[0.8rem]"
            >
              <h3 className="text-title font-semibold">{label}</h3>
              {entry ? (
                <>
                  <ul className="text-body flex flex-col gap-[0.4rem]">
                    {(lines.length ? lines : ['Logged, no details']).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  {confirming?.id === entry.id ? (
                    <div
                      role="alertdialog"
                      aria-label={`Delete ${lowerLabel} entry`}
                      className="flex flex-col gap-[0.8rem]"
                    >
                      <p className="text-body font-semibold">
                        Delete this {lowerLabel} entry? This can’t be undone.
                      </p>
                      {error && (
                        <p role="alert" className="text-body-sm text-flare-plum">
                          {error}
                        </p>
                      )}
                      <div className="flex gap-[0.8rem]">
                        <Button
                          variant="secondary"
                          onClick={() => setConfirming(null)}
                          disabled={busy}
                        >
                          Keep it
                        </Button>
                        <Button
                          onClick={() => void remove(entry)}
                          disabled={busy}
                          className="enabled:bg-flare-plum"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-[0.8rem]">
                      <Button variant="secondary" onClick={() => onEdit(period)}>
                        Edit {lowerLabel}
                      </Button>
                      <Button
                        variant="secondary"
                        aria-label={`Delete ${lowerLabel} entry`}
                        onClick={() => {
                          setError(null)
                          setConfirming(entry)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between gap-[1.2rem]">
                  <p className="text-body text-text-muted">Not logged</p>
                  <Button variant="secondary" onClick={() => onEdit(period)}>
                    Log {lowerLabel}
                  </Button>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </BottomSheet>
  )
}

export default DayDetailSheet
