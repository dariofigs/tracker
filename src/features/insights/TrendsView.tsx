import { useEffect, useMemo, useRef, useState } from 'react'
import { SegmentedControl } from '../../components/ui'
import { useEntriesInRange } from '../../hooks/useEntriesInRange'
import { ENGINE_DAYS } from '../../hooks/useTopInsight'
import { addDays, todayString } from '../../lib/dates'
import LoadErrorCard from '../today/LoadErrorCard'
import LoadingCards from '../today/LoadingCards'
import { findInsights } from './engine/insights'
import FlareDistributionCard from './FlareDistributionCard'
import InsightCard from './InsightCard'
import LagCurveCard from './LagCurveCard'
import ScatterCard from './ScatterCard'
import {
  lagSeries,
  sleepPainPoints,
  stressPainPoints,
  weeklyDistribution,
} from './trends'

const RANGES = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

function TrendsView() {
  const today = todayString()
  const { entries, loading, error, reload } = useEntriesInRange(
    addDays(today, -ENGINE_DAYS),
    today,
  )
  const [range, setRange] = useState(7)
  const sentinel = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  const result = useMemo(() => findInsights(entries), [entries])

  const from = addDays(today, -(range - 1))
  const charts = useMemo(
    () => ({
      lag: lagSeries(entries, from, today),
      sleep: sleepPainPoints(entries, from, today),
      stress: stressPainPoints(entries, from, today),
      weeks: weeklyDistribution(entries, from, today),
    }),
    [entries, from, today],
  )

  // The sentinel sits just above the bar; once it scrolls out of view the bar is pinned.
  useEffect(() => {
    const el = sentinel.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [loading, error])

  if (loading) return <LoadingCards />
  if (error) return <LoadErrorCard what="insights" onRetry={reload} />

  return (
    <div className="flex flex-col gap-[2.4rem]">
      <div ref={sentinel} aria-hidden="true" className="-mb-[2.4rem] h-px" />
      <div className="sticky top-0 z-10 -mt-[0.8rem] pt-[calc(env(safe-area-inset-top)+0.8rem)] pb-[0.8rem]">
        <div
          className={`rounded-full transition-shadow ${stuck ? 'shadow-[0_4px_14px_rgba(30,34,32,0.08)]' : ''}`}
        >
          <SegmentedControl
            label="Chart range"
            options={RANGES}
            value={range}
            onChange={setRange}
          />
        </div>
      </div>
      <InsightCard result={result} />
      <LagCurveCard series={charts.lag} />
      <ScatterCard
        title="Sleep and morning pain"
        xLabel="hours slept"
        yLabel="waking pain"
        xDomain={[3, 10]}
        points={charts.sleep}
      />
      <ScatterCard
        title="Stress and next-morning pain"
        xLabel="evening stress"
        yLabel="next morning's pain"
        xDomain={[0, 10]}
        points={charts.stress}
      />
      <FlareDistributionCard weeks={charts.weeks} />
    </div>
  )
}

export default TrendsView
