import { Card, Icon, SectionHeader } from '../../components/ui'
import type { Entry } from '../../data/types'
import { parseDayString } from '../../lib/dates'
import { weekDays } from '../../lib/streak'
import { entryPain } from '../insights/entrySummary'
import { FLARE_PAIN } from '../insights/monthStats'

type RecentDaysCardProps = {
  /** Local day (YYYY-MM-DD); the card shows the Sunday-to-Saturday week around it. */
  today: string
  /** Consecutive days with a check-in, ending today (or yesterday while today is empty). */
  streak: number
  entries: Entry[]
}

/** Cell radius is --cell-r; the ring around today is --cell-r + its 0.3rem padding + 0.2rem border, so the corners stay concentric.
 * Fill colors per cell state. Tints keep an outline so they stay visible on the canvas. */
const CELL = {
  logged: 'bg-sage-tint border border-brand-sage/40',
  flare: 'bg-clay-tint border border-accent-clay/50',
  missed: 'bg-surface-subtle',
}

const INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function spoken(day: string, am: Entry | undefined, pm: Entry | undefined) {
  const name = parseDayString(day).toLocaleDateString('en-US', { weekday: 'long' })
  const logged = [am && 'morning', pm && 'evening'].filter(Boolean).join(' and ')
  return `${name}: ${logged ? `${logged} logged` : 'nothing logged'}`
}

/** This calendar week at a glance, with the running streak. Display only. */
function RecentDaysCard({ today, streak, entries }: RecentDaysCardProps) {
  const days = weekDays(today)
  return (
    <Card as="section" aria-label="This week">
      <SectionHeader
        title="This week"
        trailing={
          streak > 0 && (
            <span className="text-caption text-text-muted flex items-center gap-[0.4rem] font-semibold">
              <Icon name="fire" bold size={18} className="text-amber-pacing" />
              {streak} {streak === 1 ? 'day' : 'days'}
            </span>
          )
        }
      />
      <ul className="sr-only">
        {days
          .filter((day) => day <= today)
          .map((day) => (
            <li key={day}>
              {spoken(
                day,
                entries.find((e) => e.entryDate === day && e.period === 'AM'),
                entries.find((e) => e.entryDate === day && e.period === 'PM'),
              )}
            </li>
          ))}
      </ul>
      <div
        aria-hidden="true"
        className="mt-[0.8rem] grid grid-cols-7 gap-[0.4rem] [--cell-r:0.8rem] supports-[corner-shape:squircle]:[--cell-r:1.2rem]"
      >
        {days.map((day, i) => {
          const future = day > today
          return (
            <div key={day} className="flex flex-col items-center gap-[0.4rem]">
              <span className="text-micro text-text-muted">{INITIALS[i]}</span>
              <div
                className={`flex w-full flex-col gap-[0.4rem] rounded-[calc(var(--cell-r)+0.5rem)] border-2 p-[0.3rem] supports-[corner-shape:squircle]:[corner-shape:squircle] ${
                  day === today ? 'border-brand-sage' : 'border-transparent'
                }`}
              >
                {(['AM', 'PM'] as const).map((period) => {
                  const entry = entries.find(
                    (e) => e.entryDate === day && e.period === period,
                  )
                  const pain = entryPain(entry)
                  const fill = future
                    ? 'border-bead-stone border border-dashed'
                    : !entry
                      ? CELL.missed
                      : pain != null && pain >= FLARE_PAIN
                        ? CELL.flare
                        : CELL.logged
                  return (
                    <span
                      key={period}
                      className={`h-[3rem] rounded-[var(--cell-r)] supports-[corner-shape:squircle]:[corner-shape:squircle] ${fill}`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default RecentDaysCard
