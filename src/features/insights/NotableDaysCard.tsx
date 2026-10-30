import { Card, SectionHeader } from '../../components/ui'
import type { Entry } from '../../data/types'
import { parseDayString } from '../../lib/dates'
import { notableDays } from './monthStats'

type NotableDaysCardProps = {
  entries: Entry[]
  onSelect: (day: string) => void
}

function dayLabel(day: string) {
  return parseDayString(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** The days worth a second look this month. Tap one to open it. Hidden when no pain was rated. */
function NotableDaysCard({ entries, onSelect }: NotableDaysCardProps) {
  const { highest, lowest, longestFlare } = notableDays(entries)
  if (!highest) return null

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
