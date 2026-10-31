import { Card, SectionHeader } from '../../components/ui'
import type { Entry } from '../../data/types'
import { parseDayString } from '../../lib/dates'
import { notableDays } from './monthStats'

type NotableDaysCardProps = {
  entries: Entry[]
  onSelect: (day: string) => void
  /** Heading context for the empty states, e.g. "October". */
  monthName?: string
}

function dayLabel(day: string) {
  return parseDayString(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** The days worth a second look this month. Tap one to open it. */
function NotableDaysCard({
  entries,
  onSelect,
  monthName = 'this month',
}: NotableDaysCardProps) {
  const { highest, lowest, longestFlare } = notableDays(entries)
  if (!highest) {
    return (
      <Card as="section" aria-label="Notable days" className="flex flex-col gap-[0.8rem]">
        <SectionHeader title="Notable days" />
        <p className="text-body text-text-muted">Nothing stood out in {monthName}.</p>
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
      <ul className="divide-border-subtle mt-[0.8rem] flex flex-col divide-y">
        {rows.map((row) => (
          <li key={row.title} className="py-[0.4rem]">
            <button
              type="button"
              onClick={() => onSelect(row.day)}
              className="min-touch text-body focus-visible:outline-brand-sage flex w-full items-center justify-between gap-[1.2rem] text-left focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="flex flex-col leading-[1.2]">
                <span className="font-semibold">{dayLabel(row.day)}</span>
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
