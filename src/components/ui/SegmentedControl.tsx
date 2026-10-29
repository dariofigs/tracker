import { useRef, type KeyboardEvent } from 'react'

type Option<T extends string | number> = { value: T; label: string }

type SegmentedControlProps<T extends string | number> = {
  options: Option<T>[]
  value: T | null
  onChange: (value: T) => void
  /** Accessible name, e.g. "Sleep quality". */
  label: string
}

/** Single-choice row (radio group). Arrow keys move and select; Tab enters and leaves once. */
function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const selected = options.findIndex((o) => o.value === value)

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (move === undefined) return
    e.preventDefault()
    const next = (index + move + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="bg-surface-subtle flex rounded-full p-[0.4rem]"
    >
      {options.map((option, i) => {
        const active = i === selected
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active || (selected === -1 && i === 0) ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`min-touch text-body focus-visible:outline-brand-sage flex-1 rounded-full px-[0.8rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
              active
                ? 'bg-brand-sage text-surface-card font-bold shadow-sm'
                : 'text-text-muted font-medium'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl
