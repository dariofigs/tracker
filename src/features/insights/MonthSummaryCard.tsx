import { Card, SectionHeader } from '../../components/ui'
import type { Entry } from '../../data/types'
import { summarizeMonth } from './monthStats'

type MonthSummaryCardProps = {
  /** Heading context, e.g. "October". */
  monthName: string
  entries: Entry[]
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-tile bg-surface-subtle flex flex-col p-[1.2rem]">
      <span className="text-title font-semibold">{value}</span>
      <span className="text-caption text-text-muted">{label}</span>
    </div>
  )
}

/** The month in three numbers and its most common symptom. */
function MonthSummaryCard({ monthName, entries }: MonthSummaryCardProps) {
  const s = summarizeMonth(entries)
  return (
    <Card as="section" aria-label="Month summary" className="flex flex-col gap-[1.2rem]">
      <SectionHeader title={`${monthName} at a glance`} />
      <div className="grid grid-cols-3 gap-[0.8rem]">
        <Stat value={s.averagePain == null ? '–' : String(s.averagePain)} label="Avg pain" />
        <Stat value={String(s.daysLogged)} label="Days logged" />
        <Stat value={String(s.flareDays)} label="Flare days" />
      </div>
      {s.topSymptom && (
        <p className="text-body flex justify-between gap-[1.2rem]">
          <span className="text-text-muted">Top symptom</span>
          <span className="font-semibold">
            {s.topSymptom.label} · {s.topSymptom.days}{' '}
            {s.topSymptom.days === 1 ? 'day' : 'days'}
          </span>
        </p>
      )}
    </Card>
  )
}

export default MonthSummaryCard
