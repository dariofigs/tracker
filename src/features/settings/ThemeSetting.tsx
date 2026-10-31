import { useRef, type KeyboardEvent } from 'react'
import { Icon, type IconName } from '../../components/ui'
import { formatClock } from '../../lib/dates'
import { isValidCutoff, type Preferences, type ThemeMode } from '../../lib/preferences'

type ThemeOption = {
  value: ThemeMode
  label: string
  hint: string
  icon: IconName
}

const OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light', hint: 'Always light', icon: 'sun' },
  { value: 'dark', label: 'Dark', hint: 'Always dark', icon: 'moon-stars' },
  {
    value: 'system',
    label: 'Same as device',
    hint: 'Follows your phone or computer',
    icon: 'stars',
  },
  {
    value: 'schedule',
    label: 'Day and night',
    hint: 'Light by day, dark after dusk, on your times',
    icon: 'clock',
  },
]

type TimeBoxProps = { label: string; value: string; onChange: (value: string) => void }

/** The time is drawn here; the real input sits invisibly on top so a tap opens the native picker. */
function TimeBox({ label, value, onChange }: TimeBoxProps) {
  return (
    <label className="bg-surface-subtle rounded-tile has-[:focus-visible]:outline-brand-sage relative flex flex-1 flex-col gap-[0.4rem] px-[1.2rem] py-[1rem] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2">
      <span className="text-micro text-text-muted font-medium">{label}</span>
      <span aria-hidden="true" className="text-body font-semibold tabular-nums">
        {formatClock(value)}
      </span>
      <input
        type="time"
        aria-label={label}
        value={value}
        onChange={(e) => {
          if (isValidCutoff(e.target.value)) onChange(e.target.value)
        }}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      />
    </label>
  )
}

type ThemeSettingProps = {
  theme: ThemeMode
  darkFrom: string
  lightFrom: string
  onChange: (
    changes: Partial<Pick<Preferences, 'theme' | 'darkFrom' | 'lightFrom'>>,
  ) => void
}

/** Light, dark, same as the device, or by time of day. The choice stays on this device. */
function ThemeSetting({ theme, darkFrom, lightFrom, onChange }: ThemeSettingProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const selected = OPTIONS.findIndex((o) => o.value === theme)

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (move === undefined) return
    e.preventDefault()
    const next = (index + move + OPTIONS.length) % OPTIONS.length
    onChange({ theme: OPTIONS[next].value })
    refs.current[next]?.focus()
  }

  return (
    <div className="flex flex-col gap-[1.2rem]">
      <div role="radiogroup" aria-label="Theme" className="flex flex-col gap-[0.8rem]">
        {OPTIONS.map((option, i) => {
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
              tabIndex={active ? 0 : -1}
              onClick={() => onChange({ theme: option.value })}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`rounded-tile focus-visible:outline-brand-sage flex min-h-[6.4rem] w-full items-center gap-[1.2rem] border px-[1.2rem] py-[0.8rem] text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                active ? 'border-brand-sage bg-sage-tint' : 'border-border-subtle'
              }`}
            >
              <span
                aria-hidden="true"
                className="rounded-tile bg-sage-tint text-brand-sage flex size-[4rem] shrink-0 items-center justify-center"
              >
                <Icon name={option.icon} bold size={22} />
              </span>
              <span className="flex flex-1 flex-col gap-[0.2rem]">
                <span className="text-body font-semibold">{option.label}</span>
                <span className="text-caption text-text-muted">{option.hint}</span>
              </span>
              <span
                aria-hidden="true"
                className={`flex size-[2.2rem] shrink-0 items-center justify-center rounded-full border-2 ${
                  active ? 'border-brand-sage' : 'border-text-muted'
                }`}
              >
                {active && <span className="bg-brand-sage size-[1rem] rounded-full" />}
              </span>
            </button>
          )
        })}
      </div>

      {theme === 'schedule' && (
        <div className="flex gap-[0.8rem]">
          <TimeBox
            label="Dark from"
            value={darkFrom}
            onChange={(value) => onChange({ darkFrom: value })}
          />
          <TimeBox
            label="Light from"
            value={lightFrom}
            onChange={(value) => onChange({ lightFrom: value })}
          />
        </div>
      )}
    </div>
  )
}

export default ThemeSetting
