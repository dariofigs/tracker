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
            <span className="text-caption text-brand-sage flex items-center gap-[0.4rem] font-semibold">
              <Icon name="fire" bold size={18} />
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
        className="text-micro text-text-muted mt-[0.8rem] grid grid-cols-7 gap-[0.4rem] text-center"
      >
        {INITIALS.map((initial, i) => (
          <span key={i}>{initial}</span>
        ))}
        {(['AM', 'PM'] as const).flatMap((period) =>
          days.map((day) => {
            const entry = entries.find((e) => e.entryDate === day && e.period === period)
            const pain = entryPain(entry)
            const fill =
              day > today
                ? 'border-bead-stone border border-dashed'
                : !entry
                  ? 'bg-surface-subtle'
                  : pain != null && pain >= FLARE_PAIN
                    ? 'bg-clay-tint'
                    : 'bg-sage-tint'
            return (
              <span
                key={`${period}-${day}`}
                className={`h-[2.2rem] rounded-[0.6rem] ${fill} ${
                  day === today ? 'outline-brand-sage outline-[1.5px]' : ''
                }`}
              />
            )
          }),
        )}
      </div>
    </Card>
  )
}

export default RecentDaysCard
