import { Card, Icon, SectionHeader } from '../../components/ui'
import type { Entry } from '../../data/types'
import { parseDayString } from '../../lib/dates'
import { notableDays } from './monthStats'

/** What to show when nothing is notable: nothing, a quiet note, or a positive note. */
export type NotableEmptyState = 'hide' | 'quiet' | 'positive'

type NotableDaysCardProps = {
  entries: Entry[]
  onSelect: (day: string) => void
  /** Heading context for the empty states, e.g. "October". */
  monthName?: string
  emptyState?: NotableEmptyState
}

function dayLabel(day: string) {
  return parseDayString(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** The days worth a second look this month. Tap one to open it. */
function NotableDaysCard({
  entries,
  onSelect,
  monthName = 'this month',
  emptyState = 'hide',
}: NotableDaysCardProps) {
  const { highest, lowest, longestFlare } = notableDays(entries)
  if (!highest) {
    if (emptyState === 'hide') return null
    return (
      <Card as="section" aria-label="Notable days" className="flex flex-col gap-[0.8rem]">
        <SectionHeader title="Notable days" />
        {emptyState === 'positive' ? (
          <p className="text-body text-brand-sage flex items-center gap-[0.8rem] font-semibold">
            <Icon name="check" bold size={20} />
            No pain logged above zero in {monthName}
          </p>
        ) : (
          <p className="text-body text-text-muted">Nothing stood out in {monthName}.</p>
        )}
      </Card>
    )
  }

  const rows = [
    { day: highest.day, title: 'Highest pain', detail: `${highest.pain} of 10` },
    ...(lowest
      ? [{ day: lowest.day, title: 'Lowest pain', detail: `${lowest.pain} of 10` }]
      : []),
    ...(longestFlare
      ? [
          {
            day: longestFlare.start,
            title: 'Longest flare',
            detail: `${longestFlare.days} days`,
          },
        ]
      : []),
  ]

  return (
    <Card as="section" aria-label="Notable days">
      <SectionHeader title="Notable days" />
      <ul className="mt-[0.8rem] flex flex-col">
        {rows.map((row) => (
          <li key={row.title} className="border-border-subtle border-b last:border-b-0">
            <button
              type="button"
              onClick={() => onSelect(row.day)}
              className="min-touch text-body focus-visible:outline-brand-sage flex w-full items-center justify-between gap-[1.2rem] text-left focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span>
                <span className="block font-semibold">{dayLabel(row.day)}</span>
                <span className="text-caption text-text-muted">{row.title}</span>
              </span>
              <span className="text-text-muted">{row.detail}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default NotableDaysCard
