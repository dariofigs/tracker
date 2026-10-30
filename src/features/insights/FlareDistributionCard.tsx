import { Card, SectionHeader } from '../../components/ui'
import { parseDayString } from '../../lib/dates'
import { linear } from './charts/scale'
import type { WeekCount } from './trends'

const W = 320
const H = 140
const BASE = H - 20
const TOP = 8

/** Weekly mix of good days (sage), middling days (stone) and flare days (plum). */
function FlareDistributionCard({ weeks }: { weeks: WeekCount[] }) {
  const slot = W / Math.max(weeks.length, 1)
  const bar = Math.min(32, slot * 0.6)
  const y = linear(0, 7, BASE, TOP)

  return (
    <Card
      as="section"
      aria-label="Good days and flare days by week"
      className="flex flex-col gap-[1.2rem]"
    >
      <SectionHeader title="Good days and flare days" />
      {weeks.length === 0 ? (
        <p className="text-body text-text-muted">No pain ratings in this range yet.</p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={weeks
              .map(
                (w) =>
                  `Week of ${w.weekStart}: ${w.goodDays} good, ${w.otherDays} middling, ${w.flareDays} flare`,
              )
              .join('. ')}
            className="w-full"
          >
            <line x1="0" x2={W} y1={BASE} y2={BASE} className="stroke-border-subtle" />
            {weeks.map((w, i) => {
              const x = i * slot + (slot - bar) / 2
              let top = BASE
              const segments = [
                { count: w.goodDays, cls: 'fill-brand-sage' },
                { count: w.otherDays, cls: 'fill-bead-stone' },
                { count: w.flareDays, cls: 'fill-flare-plum' },
              ]
              return (
                <g key={w.weekStart}>
                  {segments.map(({ count, cls }) => {
                    if (count === 0) return null
                    const height = BASE - y(count)
                    top -= height
                    return (
                      <rect
                        key={cls}
                        x={x}
                        width={bar}
                        y={top}
                        height={height}
                        className={cls}
                      />
                    )
                  })}
                  <text
                    x={x + bar / 2}
                    y={H - 6}
                    textAnchor="middle"
                    className="fill-text-muted text-[10px]"
                  >
                    {parseDayString(w.weekStart).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </text>
                </g>
              )
            })}
          </svg>
          <p className="text-body-sm text-text-muted">
            Each bar is a week starting Monday. A flare day is a worst pain of 7 or more;
            a good day stays at 3 or under.
          </p>
        </>
      )}
    </Card>
  )
}

export default FlareDistributionCard
