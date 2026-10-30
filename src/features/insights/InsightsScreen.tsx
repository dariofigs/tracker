import { useSearchParams } from 'react-router-dom'
import { SegmentedControl } from '../../components/ui'
import CalendarView from './CalendarView'
import TrendsView from './TrendsView'

type View = 'trends' | 'calendar'

const VIEWS: { value: View; label: string }[] = [
  { value: 'trends', label: 'Trends' },
  { value: 'calendar', label: 'Calendar' },
]

function InsightsScreen() {
  const [params, setParams] = useSearchParams()
  const view: View = params.get('view') === 'calendar' ? 'calendar' : 'trends'

  return (
    <section
      aria-labelledby="insights-title"
      className="flex flex-col gap-[2.4rem] pt-[2.4rem]"
    >
      <h1 id="insights-title" className="text-screen">
        Insights
      </h1>
      <SegmentedControl
        label="Insights view"
        options={VIEWS}
        value={view}
        onChange={(next) =>
          setParams(next === 'trends' ? {} : { view: next }, { replace: true })
        }
      />
      {view === 'trends' ? <TrendsView /> : <CalendarView />}
    </section>
  )
}

export default InsightsScreen
