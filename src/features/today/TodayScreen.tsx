import { periodFor, todayString } from '../../lib/dates'
import { currentStreak } from '../../lib/streak'
import { useMorningCutoff } from '../../lib/preferences'
import { useRecentEntries } from '../../hooks/useRecentEntries'
import { useSaveStatus } from '../../hooks/useSaveStatus'
import { useTodayEntries } from '../../hooks/useTodayEntries'
import { useBackupReminder } from '../../hooks/useBackupReminder'
import { useCheckin } from '../checkin/CheckinContext'
import BackupReminder from './BackupReminder'
import BatteryCard from './BatteryCard'
import CadenceCard from './CadenceCard'
import LoadErrorCard from './LoadErrorCard'
import LoadingCards from './LoadingCards'
import RecentDaysCard from './RecentDaysCard'
import { latestCapacity } from './latestCapacity'
import SaveStatusLine from './SaveStatusLine'
import TodayHeader from './TodayHeader'

/** How far back to look; also the longest streak the card can show. */
const RECENT_DAYS = 120

function TodayScreen() {
  const { morning, evening, loading, error, reload } = useTodayEntries()
  const { openCheckin } = useCheckin()
  const saveStatus = useSaveStatus()
  const recent = useRecentEntries(RECENT_DAYS)
  const morningCutoff = useMorningCutoff()
  const backup = useBackupReminder()
  const weekEntries = [...recent, ...[morning, evening].filter((e) => e !== null)]
  const loggedDays = new Set(weekEntries.map((e) => e.entryDate))

  return (
    <div className="flex flex-col gap-[2.4rem]">
      <TodayHeader />
      <SaveStatusLine status={saveStatus} />
      {backup.days !== null && (
        <BackupReminder
          days={backup.days}
          neverBackedUp={backup.neverBackedUp}
          onSnooze={backup.snooze}
        />
      )}
      {loading ? (
        <LoadingCards />
      ) : error ? (
        <LoadErrorCard onRetry={reload} />
      ) : (
        <>
          <CadenceCard
            morning={morning}
            evening={evening}
            currentPeriod={periodFor(new Date(), morningCutoff)}
            onOpen={openCheckin}
          />
          <BatteryCard reading={latestCapacity(morning, evening)} />
          <RecentDaysCard
            today={todayString()}
            streak={currentStreak(loggedDays, todayString())}
            entries={weekEntries}
          />
        </>
      )}
    </div>
  )
}

export default TodayScreen
