import { periodFor } from '../../lib/dates'
import { useSaveStatus } from '../../hooks/useSaveStatus'
import { useTodayEntries } from '../../hooks/useTodayEntries'
import { useTopInsight } from '../../hooks/useTopInsight'
import { useCheckin } from '../checkin/CheckinContext'
import BatteryCard from './BatteryCard'
import CadenceCard from './CadenceCard'
import InsightBanner from './InsightBanner'
import LoadErrorCard from './LoadErrorCard'
import LoadingCards from './LoadingCards'
import { latestCapacity } from './latestCapacity'
import SaveStatusLine from './SaveStatusLine'
import TodayHeader from './TodayHeader'

function TodayScreen() {
  const { morning, evening, loading, error, reload } = useTodayEntries()
  const { openCheckin } = useCheckin()
  const saveStatus = useSaveStatus()
  const insight = useTopInsight()

  return (
    <div className="flex flex-col gap-[2.4rem]">
      <TodayHeader />
      <SaveStatusLine status={saveStatus} />
      <InsightBanner insight={insight} />
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
