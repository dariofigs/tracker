import { periodFor, todayString } from '../../lib/dates'
import { useRecentEntries } from '../../hooks/useRecentEntries'
import { useSaveStatus } from '../../hooks/useSaveStatus'
import { useTodayEntries } from '../../hooks/useTodayEntries'
import { useTopInsight } from '../../hooks/useTopInsight'
import { useCheckin } from '../checkin/CheckinContext'
import BatteryCard from './BatteryCard'
import CadenceCard from './CadenceCard'
import InsightBanner from './InsightBanner'
import LoadErrorCard from './LoadErrorCard'
import LoadingCards from './LoadingCards'
import RecentDaysCard from './RecentDaysCard'
import { latestCapacity } from './latestCapacity'
import SaveStatusLine from './SaveStatusLine'
import TodayHeader from './TodayHeader'

const RECENT_DAYS = 7

function TodayScreen() {
  const { morning, evening, loading, error, reload } = useTodayEntries()
  const { openCheckin } = useCheckin()
  const saveStatus = useSaveStatus()
  const insight = useTopInsight()
  const recent = useRecentEntries(RECENT_DAYS)

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
          <RecentDaysCard
            today={todayString()}
            days={RECENT_DAYS}
            entries={recent}
            onOpen={openCheckin}
          />
        </>
      )}
    </div>
  )
}

export default TodayScreen
