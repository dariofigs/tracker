import { Card } from '../../components/ui'
import { periodFor } from '../../lib/dates'
import { useSaveStatus } from '../../hooks/useSaveStatus'
import { useTodayEntries } from '../../hooks/useTodayEntries'
import { useCheckin } from '../checkin/CheckinContext'
import BatteryCard from './BatteryCard'
import CadenceCard from './CadenceCard'
import LoadErrorCard from './LoadErrorCard'
import { latestCapacity } from './latestCapacity'
import SaveStatusLine from './SaveStatusLine'
import TodayHeader from './TodayHeader'

function LoadingCards() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading today"
      className="flex flex-col gap-[2.4rem]"
    >
      <Card className="bg-surface-subtle h-[14rem] border-transparent motion-safe:animate-pulse" />
      <Card className="bg-surface-subtle h-[14rem] border-transparent motion-safe:animate-pulse" />
    </div>
  )
}

function TodayScreen() {
  const { morning, evening, loading, error, reload } = useTodayEntries()
  const { openCheckin } = useCheckin()
  const saveStatus = useSaveStatus()

  return (
    <div className="flex flex-col gap-[2.4rem]">
      <TodayHeader />
      <SaveStatusLine status={saveStatus} />
      {loading ? (
        <LoadingCards />
      ) : error ? (
        <LoadErrorCard onRetry={reload} />
      ) : (
        <>
          <CadenceCard
            morning={morning}
            evening={evening}
            currentPeriod={periodFor()}
            onOpen={openCheckin}
          />
          <BatteryCard reading={latestCapacity(morning, evening)} />
        </>
      )}
    </div>
  )
}

export default TodayScreen
