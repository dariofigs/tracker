import type { Entry } from '../../data/types'
import { monthGrid, parseDayString } from '../../lib/dates'
import { painBand, type PainBand } from '../../lib/painBand'
import { entryPain } from './entrySummary'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const dotClass: Record<PainBand, string> = {
  sage: 'bg-brand-sage',
  clay: 'bg-accent-clay',
  plum: 'bg-flare-plum',
}

export function Dot({ pain, logged }: { pain: number | null; logged: boolean }) {
  const filled = pain != null ? dotClass[painBand(pain)] : logged ? 'bg-bead-stone' : ''
  return (
    <span
      aria-hidden="true"
      className={`size-[0.8rem] rounded-full ${filled || 'border-bead-stone border'}`}
    />
  )
}

type MonthGridProps = {
  /** First day of the month, YYYY-MM-01. */
  monthStart: string
  entries: Entry[]
  /** Local today. Later days are not selectable. */
  today: string
  onSelect: (day: string) => void
}

const describePeriod = (label: string, entry: Entry | undefined) => {
  if (!entry) return `${label} not logged`
  const pain = entryPain(entry)
  return pain != null ? `${label} pain ${pain}` : `${label} logged`
}

/** Month at a glance: an AM dot and a PM dot per day, coloured by that check-in's pain band. */
function MonthGrid({ monthStart, entries, today, onSelect }: MonthGridProps) {
  return (
    <div
      role="grid"
      aria-label="Month calendar"
      className="grid grid-cols-7 gap-y-[0.4rem]"
    >
      <div role="row" className="contents">
        {WEEKDAYS.map((name) => (
          <span
            key={name}
            role="columnheader"
            className="text-micro text-text-muted text-center"
          >
            {name}
          </span>
        ))}
      </div>
      {monthGrid(monthStart).map((week, w) => (
        <div key={w} role="row" className="contents">
          {week.map((day, i) => {
            if (!day) return <span key={`pad-${i}`} role="gridcell" aria-hidden="true" />
            const am = entries.find((e) => e.entryDate === day && e.period === 'AM')
            const pm = entries.find((e) => e.entryDate === day && e.period === 'PM')
            const full = parseDayString(day).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
            })
            return (
              <button
                key={day}
                type="button"
                role="gridcell"
                disabled={day > today}
                onClick={() => onSelect(day)}
                aria-label={`${full}: ${describePeriod('morning', am)}, ${describePeriod('evening', pm)}`}
                aria-current={day === today ? 'date' : undefined}
                className={`min-touch text-body focus-visible:outline-brand-sage rounded-tile flex flex-col items-center justify-center gap-[0.4rem] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 ${
                  day === today ? 'bg-sage-tint font-semibold' : ''
                }`}
              >
                <span>{Number(day.slice(8))}</span>
                <span className="flex gap-[0.4rem]">
                  <Dot pain={entryPain(am)} logged={!!am} />
                  <Dot pain={entryPain(pm)} logged={!!pm} />
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default MonthGrid
