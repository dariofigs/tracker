import { DEFAULT_MORNING_CUTOFF } from '../../lib/dates'
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
        <span className="text-body">Evening check-in starts at</span>
        <input
          type="time"
          value={value}
          onChange={(e) => {
            if (isValidCutoff(e.target.value)) onChange(e.target.value)
          }}
          className="min-touch bg-surface-subtle text-body rounded-full px-[1.6rem]"
        />
      </label>
      <p className="text-body-sm text-text-muted">
        Before this time the button opens the morning check-in.
      </p>
      {value !== DEFAULT_MORNING_CUTOFF && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_MORNING_CUTOFF)}
          className="min-touch text-body-sm text-brand-sage self-start font-semibold underline"
        >
          Reset to 12:00
        </button>
      )}
    </div>
  )
}

export default TimeSetting
