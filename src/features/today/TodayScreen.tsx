import { periodFor } from '../../lib/dates'
import { useTodayEntries } from '../../hooks/useTodayEntries'
import { useCheckin } from '../checkin/CheckinContext'
import CadenceCard from './CadenceCard'
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
    </div>
  )
}

export default TodayScreen
