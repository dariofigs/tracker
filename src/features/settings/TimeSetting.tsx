import { DEFAULT_MORNING_CUTOFF } from '../../lib/dates'
import { Icon } from '../../components/ui'
import { isValidCutoff } from '../../lib/preferences'

type TimeSettingProps = {
  value: string
  onChange: (value: string) => void
}

/** The time the Rapid Check-in button switches from the morning to the evening check-in. */
function TimeSetting({ value, onChange }: TimeSettingProps) {
  return (
    <div className="flex flex-col gap-[0.8rem]">
      <label className="flex items-center justify-between gap-[1.6rem]">
        <span className="text-body text-balance">Evening check-in starts at</span>
        <span className="relative shrink-0">
          <input
            type="time"
            value={value}
            onChange={(e) => {
              if (isValidCutoff(e.target.value)) onChange(e.target.value)
            }}
            className="min-touch bg-surface-subtle text-body w-[14rem] rounded-full pr-[4rem] pl-[1.6rem] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:opacity-0"
          />
          <Icon
            name="clock"
            size={20}
            className="text-text-muted pointer-events-none absolute top-1/2 right-[1.4rem] -translate-y-1/2"
          />
        </span>
      </label>
      <p className="text-caption text-text-muted">
        Before this time the button opens the morning check-in.
      </p>
      {value !== DEFAULT_MORNING_CUTOFF && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_MORNING_CUTOFF)}
          className="min-touch text-caption text-brand-sage self-start font-semibold underline underline-offset-2"
        >
          Reset to 12:00
        </button>
      )}
    </div>
  )
}

export default TimeSetting
