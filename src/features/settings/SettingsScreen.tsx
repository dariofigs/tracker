import { Card, SectionHeader } from '../../components/ui'
import { repository } from '../../data/repository'
import { preferences, usePreferences } from '../../lib/preferences'
import { isDemo } from '../../demo/mode'
import AccountCard from './AccountCard'
import BackupCard from './BackupCard'
import NameSetting from './NameSetting'
import OptionsManager from './OptionsManager'
import ThemeSetting from './ThemeSetting'
import TimeSetting from './TimeSetting'
import WeatherSetting from './WeatherSetting'
import { clearWeatherCache, requestLocation } from '../../lib/weather'

/** Dimmed and unclickable in the demo, where these need a real account or device. */
const demoOff = {
  className: `flex flex-col gap-[1.6rem] ${isDemo ? 'opacity-50' : ''}`,
  ...(isDemo && { inert: true }),
}

function SettingsScreen() {
  const { morningCutoff, theme, darkFrom, lightFrom, weatherIcon, name } = usePreferences()

  return (
    <section
      aria-labelledby="settings-title"
      className="flex flex-col gap-[2.4rem] pt-[2.4rem]"
    >
      <h1 id="settings-title" className="text-screen">
        Settings
      </h1>

      <Card as="section" aria-label="Profile" {...demoOff}>
        <SectionHeader title="Profile" />
        <NameSetting
          value={name}
          onChange={(value) => preferences.set({ name: value })}
          // Saved to the account so other devices pick it up; this device already has it.
          onCommit={(value) => repository.setDisplayName(value).catch(() => {})}
        />
      </Card>

      <Card as="section" aria-label="Check-in" className="flex flex-col gap-[1.6rem]">
        <SectionHeader title="Check-in" />
        <TimeSetting
          value={morningCutoff}
          onChange={(value) => {
            preferences.set({ morningCutoff: value })
            // Saved to the account so other devices pick it up; this device already has it.
            repository.setMorningCutoff(value).catch(() => {})
          }}
        />
      </Card>

      <Card as="section" aria-label="Appearance" className="flex flex-col gap-[1.6rem]">
        <SectionHeader title="Appearance" />
        <ThemeSetting
          theme={theme}
          darkFrom={darkFrom}
          lightFrom={lightFrom}
          onChange={(changes) => preferences.set(changes)}
        />
      </Card>

      <Card as="section" aria-label="Weather" {...demoOff}>
        <SectionHeader title="Weather" />
        {/* No location or weather lookups in the demo. */}
        <WeatherSetting
          enabled={weatherIcon}
          onChange={async (enabled) => {
            if (!enabled) {
              clearWeatherCache()
              preferences.set({ weatherIcon: false })
              return true
            }
            try {
              await requestLocation()
            } catch {
              return false
            }
            preferences.set({ weatherIcon: true })
            return true
          }}
        />
      </Card>

      <Card as="section" aria-label="Your options" className="flex flex-col gap-[1.6rem]">
        <SectionHeader title="Your options" />
        <OptionsManager />
      </Card>

      <Card as="section" aria-label="Backup" {...demoOff}>
        <SectionHeader title="Backup" />
        <BackupCard />
      </Card>

      <Card as="section" aria-label="Account" {...demoOff}>
        <SectionHeader title="Account" />
        <AccountCard />
      </Card>
    </section>
  )
}

export default SettingsScreen
