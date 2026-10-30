import { Card, SectionHeader } from '../../components/ui'
import { linear } from './charts/scale'
import type { XY } from './trends'

const W = 320
const H = 180
const LEFT = 28
const RIGHT = 8
const TOP = 8
const BOTTOM = 28

type ScatterCardProps = {
  title: string
  xLabel: string
  yLabel: string
  xDomain: [number, number]
  points: XY[]
}

/** Dots of one measure against morning pain (0–10). Overlapping dots darken, so clusters show. */
function ScatterCard({ title, xLabel, yLabel, xDomain, points }: ScatterCardProps) {
  const x = linear(xDomain[0], xDomain[1], LEFT, W - RIGHT)
  const y = linear(0, 10, H - BOTTOM, TOP)
  const xTicks = [xDomain[0], (xDomain[0] + xDomain[1]) / 2, xDomain[1]]

  return (
    <Card as="section" aria-label={title} className="flex flex-col gap-[1.2rem]">
      <SectionHeader title={title} />
      {points.length === 0 ? (
        <p className="text-body text-text-muted">Nothing to compare in this range yet.</p>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${points.length} days: ${xLabel} against ${yLabel}.`}
          className="w-full"
        >
          {[0, 5, 10].map((tick) => (
            <g key={tick}>
              <line
                x1={LEFT}
                x2={W - RIGHT}
                y1={y(tick)}
                y2={y(tick)}
                className="stroke-border-subtle"
              />
              <text
                x={LEFT - 6}
                y={y(tick) + 4}
                textAnchor="end"
                className="fill-text-muted text-micro"
              >
                {tick}
              </text>
            </g>
          ))}
          {xTicks.map((tick) => (
            <text
              key={tick}
              x={x(tick)}
              y={H - 12}
              textAnchor="middle"
              className="fill-text-muted text-micro"
            >
              {tick}
            </text>
          ))}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={x(p.x)}
              cy={y(p.y)}
              r="4"
              className="fill-brand-sage opacity-40"
            />
          ))}
        </svg>
      )}
      <p className="text-caption text-text-muted">
        {xLabel} across, {yLabel} up.
      </p>
    </Card>
  )
}

export default ScatterCard
