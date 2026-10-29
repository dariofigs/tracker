type BatteryBarProps = {
  /** Remaining capacity, 0-100. */
  value: number
  /** Accessible name, e.g. "Remaining capacity". */
  label: string
  /** At or below this the fill turns clay, matching the Low Battery chip. */
  lowThreshold?: number
}

/** 8px pill track; sage fill, clay when capacity is low. */
function BatteryBar({ value, label, lowThreshold = 30 }: BatteryBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-valuetext={`${clamped}%`}
      className="bg-surface-subtle h-[0.8rem] w-full overflow-hidden rounded-full"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none ${
          clamped <= lowThreshold ? 'bg-accent-clay' : 'bg-brand-sage'
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export default BatteryBar
