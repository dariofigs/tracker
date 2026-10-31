import { useState } from 'react'
import { Icon } from '../../components/ui'

type WeatherSettingProps = {
  enabled: boolean
  /** Asks for location access when turning on; resolves false if it was refused. */
  onChange: (enabled: boolean) => Promise<boolean> | boolean
}

/** Shows today's weather as the Today tab icon. The position is rounded and kept on this device. */
function WeatherSetting({ enabled, onChange }: WeatherSettingProps) {
  const [denied, setDenied] = useState(false)

  async function toggle() {
    setDenied(false)
    const ok = await onChange(!enabled)
    if (!ok) setDenied(true)
  }

  return (
    <div className="flex flex-col gap-[0.8rem]">
      <div className="flex items-center gap-[1.2rem]">
        <span
          aria-hidden="true"
          className="rounded-tile bg-sage-tint text-brand-sage flex size-[4rem] shrink-0 items-center justify-center"
        >
          <Icon name="cloud-sun" bold size={22} />
        </span>
        <span id="weather-label" className="text-body flex-1 text-balance">
          Weather on the Today tab
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby="weather-label"
          onClick={toggle}
          className="min-touch focus-visible:outline-brand-sage flex shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span
            aria-hidden="true"
            className={`relative h-[3.2rem] w-[5.2rem] rounded-full border transition-colors ${
              enabled ? 'bg-brand-sage border-brand-sage' : 'bg-surface-subtle border-text-muted'
            }`}
          >
            <span
              className={`absolute top-1/2 size-[2.2rem] -translate-y-1/2 rounded-full shadow transition-[left] ${
                enabled ? 'left-[2.6rem] bg-white' : 'bg-text-muted left-[0.4rem]'
              }`}
            />
          </span>
        </button>
      </div>
      <p className="text-caption text-text-muted">
        {denied
          ? 'Location is blocked. Allow it for this site in your browser settings to turn this on.'
          : 'The icon follows the sky where you are. Your location is never saved to your account. Only an approximate spot, rounded to within about a mile, is kept on this device and sent to a weather service to get the forecast.'}
      </p>
    </div>
  )
}

export default WeatherSetting
