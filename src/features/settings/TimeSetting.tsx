import { DEFAULT_MORNING_CUTOFF, formatClock } from '../../lib/dates'
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
        {/* The pill is drawn here; the real time input sits invisibly on top so a tap opens the
            native picker. Styling the input itself top-aligns its text in iOS Safari. */}
        <span className="bg-surface-subtle text-body has-[:focus-visible]:outline-brand-sage relative flex h-[4.8rem] w-[14rem] shrink-0 items-center justify-between rounded-full px-[1.6rem] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2">
          <span aria-hidden="true" className="tabular-nums">
            {formatClock(value)}
          </span>
          <Icon name="clock" size={20} className="text-text-muted" />
          <input
            type="time"
            value={value}
            onChange={(e) => {
              if (isValidCutoff(e.target.value)) onChange(e.target.value)
            }}
            className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
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
          className="min-touch text-caption text-brand-sage -mb-[1.4rem] self-start font-semibold underline underline-offset-2"
        >
          Reset to 12:00
        </button>
      )}
    </div>
  )
}

export default TimeSetting
