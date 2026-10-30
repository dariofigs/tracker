import { Card, Icon, SectionHeader } from '../../components/ui'
import type { Entry, Period } from '../../data/types'
import { addDays, parseDayString } from '../../lib/dates'

type RecentDaysCardProps = {
  /** Local day (YYYY-MM-DD) the list counts back from; the first row is the day before. */
  today: string
  days: number
  entries: Entry[]
  onOpen: (period: Period, date: string) => void
}

const PERIODS: { period: Period; label: string }[] = [
  { period: 'AM', label: 'Morning' },
  { period: 'PM', label: 'Evening' },
]

/** Past days with a button per check-in: tap to fill in a day that was missed or fix one that was logged. */
function RecentDaysCard({ today, days, entries, onOpen }: RecentDaysCardProps) {
  const dates = Array.from({ length: days }, (_, i) => addDays(today, -(i + 1)))

  return (
    <Card as="section" aria-label="Recent days">
      <SectionHeader title="Recent days" />
      <ul className="mt-[1.2rem] flex flex-col">
        {dates.map((date) => (
          <li
            key={date}
            className="border-border-subtle flex items-center justify-between gap-[1.2rem] border-b py-[0.4rem] last:border-b-0"
          >
            <span className="text-body text-text-primary font-semibold">
              {parseDayString(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="flex gap-[0.8rem]">
              {PERIODS.map(({ period, label }) => {
                const done = entries.some(
                  (e) => e.entryDate === date && e.period === period,
                )
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => onOpen(period, date)}
                    aria-label={`${period} ${label.toLowerCase()} check-in for ${date}, ${done ? 'logged, edit' : 'not logged, add'}`}
                    className={`min-touch text-caption focus-visible:outline-brand-sage inline-flex items-center gap-[0.6rem] rounded-full px-[1.6rem] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      done
                        ? 'bg-sage-tint text-brand-sage'
                        : 'bg-surface-subtle text-text-muted'
                    }`}
                  >
                    <Icon name={done ? 'check' : 'add'} bold={done} size={16} />
                    {period}
                  </button>
                )
              })}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default RecentDaysCard
