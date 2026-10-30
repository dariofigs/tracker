import { Card, SectionHeader } from '../../components/ui'
import { needsMoreDaysText } from './engine/wording'
import type { InsightsResult } from './engine/insights'

const SHOWN = 3

/** Patterns found in the data, in plain language. Says plainly when there is not enough data yet. */
function InsightCard({ result }: { result: InsightsResult }) {
  return (
    <Card
      as="section"
      aria-label="Patterns in your data"
      className="flex flex-col gap-[1.2rem]"
    >
      <SectionHeader title="Patterns" />
      {result.status === 'needs-more-days' ? (
        <>
          <p className="text-body">{needsMoreDaysText(result.have, result.need)}</p>
          <div
            role="progressbar"
            aria-label="Days logged toward the first insights"
            aria-valuemin={0}
            aria-valuemax={result.need}
            aria-valuenow={result.have}
            className="bg-surface-subtle h-[0.8rem] overflow-hidden rounded-full"
          >
            <div
              className="bg-brand-sage h-full rounded-full"
              style={{ width: `${(result.have / result.need) * 100}%` }}
            />
          </div>
        </>
      ) : result.insights.length === 0 ? (
        <p className="text-body">
          Nothing stands out yet across {result.have} days. That is a real result: no
          clear pattern in what you have logged so far.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-[1.2rem]">
            {result.insights.slice(0, SHOWN).map((insight) => (
              <li key={insight.factorId} className="flex gap-[1.2rem]">
                <span
                  aria-hidden="true"
                  className="bg-brand-sage mt-[0.6rem] size-[1rem] shrink-0 rounded-full"
                />
                <p className="text-body">{insight.text}</p>
              </li>
            ))}
          </ul>
          <p className="text-body-sm text-text-muted">
            These are patterns in your own logs, not causes or medical advice.
          </p>
        </>
      )}
    </Card>
  )
}

export default InsightCard
