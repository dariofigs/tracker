import { useRef, type KeyboardEvent, type PointerEvent } from 'react'

const PAIN_RANGE_LABELS = ['0 None', 'Mild (1-4)', 'Mod (5-7)', 'Flare (8-10)']

const MAX = 10
const STOPS = Array.from({ length: MAX + 1 }, (_, i) => i)

type PainGaugeProps = {
  value: number
  onChange: (value: number) => void
  /** Accessible name, e.g. "Waking pain" or "Stress". */
  label: string
  /** Anchors shown under the track; pass an empty array to hide them. */
  rangeLabels?: string[]
  /** Reads out the value for screen readers, e.g. (n) => `${n} out of 10`. */
  valueText?: (value: number) => string
  /** Nothing chosen yet: the handle shows a dash and the first tap or key press counts, even at 0. */
  unset?: boolean
}

function clamp(n: number) {
  return Math.min(MAX, Math.max(0, Math.round(n)))
}

/** Whole-integer 0-10 gauge (channel fill and beads). Used for pain and stress. */
function PainGauge({
  value,
  onChange,
  label,
  rangeLabels = PAIN_RANGE_LABELS,
  valueText,
  unset = false,
}: PainGaugeProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  function valueFromPointer(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect()
    if (rect.width === 0) return value
    return clamp(((clientX - rect.left) / rect.width) * MAX)
  }

  function update(next: number) {
    if (unset || next !== value) onChange(next)
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    dragging.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    handleRef.current?.focus()
    update(valueFromPointer(e.clientX))
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (dragging.current) update(valueFromPointer(e.clientX))
  }

  function endDrag(e: PointerEvent<HTMLDivElement>) {
    dragging.current = false
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = {
      ArrowRight: value + 1,
      ArrowUp: value + 1,
      ArrowLeft: value - 1,
      ArrowDown: value - 1,
      PageUp: value + 2,
      PageDown: value - 2,
      Home: 0,
      End: MAX,
    }
    if (!(e.key in steps)) return
    e.preventDefault()
    update(clamp(steps[e.key]))
  }

  const percent = unset ? 0 : (value / MAX) * 100

  return (
    <div>
      {/* The outer box is the 48px+ touch area; vertical page scroll still works from it. */}
      <div
        className="flex min-h-[5.6rem] touch-pan-y items-center px-[1.4rem] select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={trackRef} className="relative h-[1.2rem] w-full">
          {/* Backdrop overhangs the first and last dot so both sit inside it */}
          <div className="bg-surface-subtle absolute inset-y-0 -right-[0.9rem] -left-[0.9rem] rounded-full" />
          <div
            className="bg-sage-tint absolute inset-y-0 -left-[0.9rem] rounded-full"
            style={{ width: `calc(${percent}% + 0.9rem)` }}
          />
          {STOPS.map((stop) => (
            <span
              key={stop}
              aria-hidden="true"
              className={`absolute top-1/2 size-[0.6rem] -translate-x-1/2 -translate-y-1/2 rounded-full ${
                !unset && stop <= value ? 'bg-brand-sage' : 'bg-bead-stone'
              }`}
              style={{ left: `${(stop / MAX) * 100}%` }}
            />
          ))}
          <div
            ref={handleRef}
            role="slider"
            tabIndex={0}
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={MAX}
            aria-valuenow={unset ? undefined : value}
            aria-valuetext={unset ? 'Not set' : valueText?.(value)}
            onKeyDown={onKeyDown}
            className={`border-surface-card ${unset ? 'bg-bead-stone' : 'bg-brand-sage'} text-caption text-surface-card focus-visible:outline-brand-sage absolute top-1/2 flex size-[2.8rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-bold shadow-md focus-visible:outline-2 focus-visible:outline-offset-2`}
            style={{ left: `${percent}%` }}
          >
            {unset ? '–' : value}
          </div>
        </div>
      </div>
      {rangeLabels.length > 0 && (
        <div
          aria-hidden="true"
          className="text-micro text-text-muted flex justify-between px-[0.4rem]"
        >
          {rangeLabels.map((text) => (
            <span key={text}>{text}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default PainGauge
