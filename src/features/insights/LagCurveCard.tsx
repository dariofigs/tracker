import { Card, SectionHeader } from '../../components/ui'
import { painBand } from '../../lib/painBand'
import { linear } from './charts/scale'
import type { LagPoint } from './trends'

const W = 320
const H = 140
const TOP = 8
const BASE = H - 8

const painFill = {
  sage: 'fill-accent-clay',
  clay: 'fill-accent-clay',
  plum: 'fill-flare-plum',
}

type LagCurveCardProps = { series: LagPoint[] }

/** Each day's exertion (sage) beside the next morning's pain (clay, plum from 7). */
function LagCurveCard({ series }: LagCurveCardProps) {
  const logged = series.filter((p) => p.exertion != null || p.pain != null)
  const maxExertion = Math.max(1, ...series.map((p) => p.exertion ?? 0))
  const exertionY = linear(0, maxExertion, BASE, TOP)
  const painY = linear(0, 10, BASE, TOP)
  const slot = W / series.length
  const bar = Math.max(1, Math.min(10, slot * 0.4))

  return (
    <Card
      as="section"
      aria-label="Exertion and next-morning pain"
      className="flex flex-col gap-[1.2rem]"
    >
      <SectionHeader title="Exertion and next-morning pain" />
      {logged.length === 0 ? (
        <p className="text-body text-text-muted">Nothing logged in this range yet.</p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Bars for ${series.length} days. Each day shows exercise load beside the next morning's waking pain.`}
            className="w-full"
          >
            <line x1="0" x2={W} y1={BASE} y2={BASE} className="stroke-border-subtle" />
            {series.map((p, i) => {
              const x = i * slot + slot / 2
              return (
                <g key={p.date}>
                  {p.exertion != null && p.exertion > 0 && (
                    <rect
                      x={x - bar}
                      width={bar}
                      y={exertionY(p.exertion)}
                      height={BASE - exertionY(p.exertion)}
                      className="fill-brand-sage"
                    />
                  )}
                  {p.pain != null && (
                    <rect
                      x={x}
                      width={bar}
                      y={painY(p.pain)}
                      height={Math.max(1, BASE - painY(p.pain))}
                      className={painFill[painBand(p.pain)]}
                    />
                  )}
                </g>
              )
            })}
          </svg>
          <p className="text-body-sm text-text-muted">
            <span className="text-brand-sage font-semibold">Sage</span>: exercise minutes
            × effort. <span className="text-clay-text font-semibold">Clay</span> and{' '}
            <span className="text-flare-plum font-semibold">plum</span>: waking pain the
            next morning.
          </p>
        </>
      )}
    </Card>
  )
}

export default LagCurveCard
