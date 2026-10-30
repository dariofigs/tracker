import { Card, Icon, SectionHeader } from '../../components/ui'
import type { Entry, Period } from '../../data/types'
import { parseDayString } from '../../lib/dates'
import { weekDays } from '../../lib/streak'

type RecentDaysCardProps = {
  /** Local day (YYYY-MM-DD); the card shows the Sunday-to-Saturday week around it. */
  today: string
  /** Consecutive days with a check-in, ending today (or yesterday while today is empty). */
  streak: number
  entries: Entry[]
  onOpen: (period: Period, date: string) => void
}

const PERIODS: { period: Period; label: string }[] = [
  { period: 'AM', label: 'Morning' },
  { period: 'PM', label: 'Evening' },
]

/** This calendar week with a button per past check-in, and the running streak. */
function RecentDaysCard({ today, streak, entries, onOpen }: RecentDaysCardProps) {
  return (
    <Card as="section" aria-label="This week">
      <SectionHeader
        title="This week"
        trailing={
          streak > 0 && (
            <span className="text-caption text-brand-sage flex items-center gap-[0.4rem] font-semibold">
              <Icon name="fire" bold size={18} />
              {streak} {streak === 1 ? 'day' : 'days'}
            </span>
          )
        }
      />
      <ul className="mt-[1.2rem] flex flex-col">
        {weekDays(today).map((date) => {
          const isToday = date === today
          const isFuture = date > today
          return (
            <li
              key={date}
              className="border-border-subtle flex items-center justify-between gap-[1.2rem] border-b py-[0.8rem] last:border-b-0 last:pb-0"
            >
              <span
                className={`text-body font-semibold ${isFuture ? 'text-text-muted' : 'text-text-primary'}`}
              >
                {isToday
                  ? 'Today'
                  : parseDayString(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
              </span>
              {isToday || isFuture ? (
                <span className="text-caption text-text-muted">
                  {isToday ? 'Use the check-ins above' : 'Coming up'}
                </span>
              ) : (
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
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export default RecentDaysCard
