type StepperProps = {
  value: number
  onChange: (value: number) => void
  /** Accessible name, e.g. "Sleep hours". */
  label: string
  step?: number
  min?: number
  max?: number
  /** Unit shown after the value, e.g. "h". */
  unit?: string
}

/** Round to the step's precision so 6.5 + 0.5 never becomes 6.999999. */
function snap(n: number, step: number) {
  return Math.round(n / step) * step
}

function Stepper({
  value,
  onChange,
  label,
  step = 1,
  min = 0,
  max = 24,
  unit,
}: StepperProps) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, snap(next, step))))
  const buttonClass =
    'min-touch flex items-center justify-center rounded-full bg-surface-subtle text-title font-bold text-brand-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage enabled:active:bg-sage-tint disabled:text-text-muted disabled:opacity-60'

  return (
    <div role="group" aria-label={label} className="flex items-center gap-[1.2rem]">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => set(value - step)}
        className={buttonClass}
      >
        −
      </button>
      <output
        aria-live="polite"
        className="text-title text-text-primary min-w-[6.4rem] text-center font-bold"
      >
        {value}
        {unit && (
          <span className="text-body-sm text-text-muted ml-[0.4rem] font-medium">
            {unit}
          </span>
        )}
      </output>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => set(value + step)}
        className={buttonClass}
      >
        +
      </button>
    </div>
  )
}

export default Stepper
