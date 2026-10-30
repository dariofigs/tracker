import { useState } from 'react'
import { Button, Card } from '../../components/ui'
import type { Period } from '../../data/types'
import { useEntriesInRange } from '../../hooks/useEntriesInRange'
import {
  addMonths,
  endOfMonth,
  parseDayString,
  startOfMonth,
  todayString,
} from '../../lib/dates'
import { useCheckin } from '../checkin/CheckinContext'
import LoadErrorCard from '../today/LoadErrorCard'
import LoadingCards from '../today/LoadingCards'
import DayDetailSheet from './DayDetailSheet'
import HistoryList from './HistoryList'
import MonthGrid from './MonthGrid'

function CalendarView() {
  const today = todayString()
  const thisMonth = startOfMonth(today)
  const [monthStart, setMonthStart] = useState(thisMonth)
  const [selected, setSelected] = useState<string | null>(null)
  const { entries, loading, error, reload } = useEntriesInRange(
    monthStart,
    endOfMonth(monthStart),
  )
  const { openCheckin } = useCheckin()

  const monthName = parseDayString(monthStart).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function edit(period: Period) {
    if (!selected) return
    const day = selected
    setSelected(null)
    openCheckin(period, day)
  }

  return (
    <div className="flex flex-col gap-[2.4rem]">
      <div className="flex items-center justify-between gap-[1.2rem]">
        <Button
          variant="secondary"
          aria-label="Previous month"
          onClick={() => setMonthStart(addMonths(monthStart, -1))}
        >
          ‹
        </Button>
        <h2 className="text-section" aria-live="polite">
          {monthName}
        </h2>
        <Button
          variant="secondary"
          aria-label="Next month"
          disabled={monthStart >= thisMonth}
          onClick={() => setMonthStart(addMonths(monthStart, 1))}
        >
          ›
        </Button>
      </div>

      {loading ? (
        <LoadingCards />
      ) : error ? (
        <LoadErrorCard what="the calendar" onRetry={reload} />
      ) : (
        <>
          <Card>
            <MonthGrid
              monthStart={monthStart}
              entries={entries}
              today={today}
              onSelect={setSelected}
            />
            <p className="text-caption text-text-muted mt-[1.2rem]">
              Left dot morning, right dot evening. Sage 0–3, clay 4–6, plum 7–10; an empty
              ring means not logged.
            </p>
          </Card>
          {entries.length === 0 ? (
            <Card
              as="section"
              aria-label="History"
              className="flex flex-col gap-[0.8rem]"
            >
              <p className="text-title font-semibold">Nothing logged in {monthName}</p>
              <p className="text-body text-text-muted">
                Tap any day above to add a check-in for it.
              </p>
            </Card>
          ) : (
            <HistoryList entries={entries} onSelect={setSelected} />
          )}
        </>
      )}

      {selected && (
        <DayDetailSheet
          day={selected}
          entries={entries.filter((e) => e.entryDate === selected)}
          onClose={() => setSelected(null)}
          onEdit={edit}
          onDeleted={reload}
        />
      )}
    </div>
  )
}

export default CalendarView
