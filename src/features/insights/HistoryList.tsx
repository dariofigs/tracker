import { Card, SectionHeader } from '../../components/ui'
import type { Entry } from '../../data/types'
import { parseDayString } from '../../lib/dates'
import { entryPain } from './entrySummary'

type HistoryListProps = {
  entries: Entry[]
  onSelect: (day: string) => void
}

/** The month's logged days, newest first. Tap a day to open it. */
function HistoryList({ entries, onSelect }: HistoryListProps) {
  const days = [...new Set(entries.map((e) => e.entryDate))].sort().reverse()

  return (
    <Card as="section" aria-label="History">
      <SectionHeader title="History" />
      <ul className="mt-[1.2rem] flex flex-col">
        {days.map((day) => {
          const am = entryPain(
            entries.find((e) => e.entryDate === day && e.period === 'AM'),
          )
          const pm = entryPain(
            entries.find((e) => e.entryDate === day && e.period === 'PM'),
          )
          return (
            <li key={day} className="border-border-subtle border-b last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect(day)}
                className="min-touch text-body focus-visible:outline-brand-sage flex w-full items-center justify-between gap-[1.2rem] text-left focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="font-semibold">
                  {parseDayString(day).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-text-muted">
                  AM {am ?? '–'} · PM {pm ?? '–'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export default HistoryList
