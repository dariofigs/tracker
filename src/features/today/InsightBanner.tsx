import { Link } from 'react-router-dom'

export type BannerInsight = {
  /** One plain-language sentence, worded as a pattern seen in the data. */
  text: string
}

type InsightBannerProps = {
  insight: BannerInsight | null
}

/** Top insight for Today. Renders nothing until the engine (Phase 6) supplies one. */
function InsightBanner({ insight }: InsightBannerProps) {
  if (!insight) return null

  return (
    <aside
      aria-label="Insight"
      className="rounded-card border-sage-tint bg-surface-card flex gap-[1.2rem] border-2 p-[1.6rem]"
    >
      <span
        aria-hidden="true"
        className="bg-brand-sage mt-[0.6rem] size-[1rem] shrink-0 rounded-full"
      />
      <div className="flex flex-col gap-[0.8rem]">
        <p className="text-body">{insight.text}</p>
        <Link
          to="/insights"
          className="min-touch text-caption text-brand-sage focus-visible:outline-brand-sage -my-[1.4rem] inline-flex items-center self-start font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          View trend chart
        </Link>
      </div>
    </aside>
  )
}

export default InsightBanner
