import type { ReactNode } from 'react'
import { Card, SectionHeader, StatusChip } from '../../components/ui'
import type { Entry, Period } from '../../data/types'

type CadenceCardProps = {
  morning: Entry | null
  evening: Entry | null
  /** Which check-in the time of day calls for. The evening node is DUE only from PM on. */
  currentPeriod: Period
  onOpen: (period: Period) => void
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function summary(
  pain: number | null | undefined,
  capacity: number | null | undefined,
): string {
  const parts = []
  if (pain != null) parts.push(`Pain ${pain}/10`)
  if (capacity != null) parts.push(`Capacity ${capacity}%`)
  return parts.join(' · ') || 'Logged'
}

type NodeProps = {
  done: boolean
  title: string
  detail: ReactNode
  time?: string
  tag?: ReactNode
  onClick?: () => void
}

function Node({ done, title, detail, time, tag, onClick }: NodeProps) {
  const body = (
    <>
      <span
        aria-hidden="true"
        className={`absolute top-[0.2rem] left-0 flex size-[2.8rem] -translate-x-1/2 items-center justify-center rounded-full border-2 text-[1.4rem] font-bold ${
          done
            ? 'border-brand-sage bg-brand-sage text-surface-card'
            : 'border-bead-stone bg-surface-card'
        }`}
      >
        {done ? '✓' : ''}
      </span>
      <span className="flex flex-wrap items-center gap-[0.8rem]">
        <span className="text-title font-semibold">{title}</span>
        {time && <span className="text-body-sm text-text-muted">{time}</span>}
        {tag}
      </span>
      <span className="text-body text-text-muted block">{detail}</span>
    </>
  )

  const className = 'relative block w-full pl-[2.4rem] text-left'
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`${className} min-touch focus-visible:outline-brand-sage rounded-tile focus-visible:outline-2 focus-visible:outline-offset-2`}
    >
      {body}
    </button>
  ) : (
    <div className={className}>{body}</div>
  )
}

/** Connected timeline from the morning baseline to the evening reflection. */
function CadenceCard({ morning, evening, currentPeriod, onOpen }: CadenceCardProps) {
  const eveningDue = !evening && currentPeriod === 'PM'

  return (
    <Card as="section" aria-label="Check-ins">
      <SectionHeader title="Check-ins" />
      <ol className="mt-[1.6rem] ml-[1.4rem] flex flex-col gap-[2.4rem]">
        <li className="relative">
          <span
            aria-hidden="true"
            className="bg-border-subtle absolute top-[3rem] -bottom-[2.6rem] left-0 w-[2px] -translate-x-1/2"
          />
          {morning ? (
            <Node
              done
              title="Morning"
              time={formatTime(morning.updatedAt)}
              detail={summary(morning.wakingPain, morning.startingCapacity)}
              onClick={() => onOpen('AM')}
            />
          ) : (
            <Node
              done={false}
              title="Morning"
              detail="Not logged yet"
              onClick={() => onOpen('AM')}
            />
          )}
        </li>
        <li>
          {evening ? (
            <Node
              done
              title="Evening"
              time={formatTime(evening.updatedAt)}
              detail={summary(evening.endPain, evening.remainingCapacity)}
              onClick={() => onOpen('PM')}
            />
          ) : (
            <Node
              done={false}
              title="Evening"
              detail={eveningDue ? 'Tap to reflect on your day' : 'Later today'}
              tag={eveningDue ? <StatusChip status="due" /> : undefined}
              onClick={eveningDue ? () => onOpen('PM') : undefined}
            />
          )}
        </li>
      </ol>
    </Card>
  )
}

export default CadenceCard
