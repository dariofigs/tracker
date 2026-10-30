import { BatteryBar, Card, SectionHeader, StatusChip } from '../../components/ui'
import type { CapacityReading } from './latestCapacity'

const LOW_THRESHOLD = 30

type BatteryCardProps = {
  reading: CapacityReading | null
}

/** Today's energy at a glance, from the latest logged capacity. */
function BatteryCard({ reading }: BatteryCardProps) {
  const low = reading !== null && reading.value <= LOW_THRESHOLD

  return (
    <Card as="section" aria-label="Energy battery">
      <SectionHeader
        title="Energy"
        trailing={reading && <StatusChip status={low ? 'low-battery' : 'balanced'} />}
      />
      <p
        className={`text-metric mt-[1.2rem] font-semibold tabular-nums ${reading ? '' : 'text-bead-stone'}`}
        aria-hidden={reading ? undefined : true}
      >
        {reading ? `${reading.value}%` : '–%'}
      </p>
      <p className="text-body text-text-muted mt-[0.4rem] mb-[0.8rem]">
        {!reading
          ? 'Nothing logged today. Your level will show here after a check-in.'
          : reading.source === 'evening'
            ? 'Left at the end of the day'
            : 'Starting the day'}
      </p>
      {reading ? (
        <BatteryBar value={reading.value} label="Capacity" lowThreshold={LOW_THRESHOLD} />
      ) : (
        <div
          aria-hidden="true"
          className="bg-surface-subtle h-[0.8rem] w-full rounded-full"
        />
      )}
    </Card>
  )
}

export default BatteryCard
