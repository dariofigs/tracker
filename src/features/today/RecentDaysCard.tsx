import { Card, Icon, SectionHeader } from '../../components/ui'
import type { Entry } from '../../data/types'
import { parseDayString } from '../../lib/dates'
import { weekDays } from '../../lib/streak'
import { entryPain } from '../insights/entrySummary'
import { Dot } from '../insights/MonthGrid'

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
      <div aria-hidden="true" className="mt-[1.2rem] grid grid-cols-7 gap-[0.6rem]">
        {days.map((day, i) => {
          const am = entries.find((e) => e.entryDate === day && e.period === 'AM')
          const pm = entries.find((e) => e.entryDate === day && e.period === 'PM')
          const future = day > today
          return (
            <div
              key={day}
              className={`rounded-tile flex flex-col items-center gap-[0.4rem] border py-[0.8rem] ${
                future
                  ? 'border-bead-stone text-text-muted border-dashed'
                  : day === today
                    ? 'bg-sage-tint border-brand-sage'
                    : 'bg-surface-subtle border-transparent'
              }`}
            >
              <span className="text-micro text-text-muted">{INITIALS[i]}</span>
              <span className="text-body font-semibold">{Number(day.slice(8))}</span>
              <span className="flex gap-[0.4rem]">
                <Dot pain={entryPain(am)} logged={!!am} />
                <Dot pain={entryPain(pm)} logged={!!pm} />
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default RecentDaysCard
