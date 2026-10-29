import { periodFor } from '../../lib/dates'
import { useTodayEntries } from '../../hooks/useTodayEntries'
import { useCheckin } from '../checkin/CheckinContext'
import BatteryCard from './BatteryCard'
import CadenceCard from './CadenceCard'
import { latestCapacity } from './latestCapacity'
import TodayHeader from './TodayHeader'

function TodayScreen() {
  const { morning, evening } = useTodayEntries()
  const { openCheckin } = useCheckin()

  return (
    <div className="flex flex-col gap-[2.4rem]">
      <TodayHeader />
      <CadenceCard
        morning={morning}
        evening={evening}
        currentPeriod={periodFor()}
        onOpen={openCheckin}
      />
      <BatteryCard reading={latestCapacity(morning, evening)} />
    </div>
  )
}

export default TodayScreen
