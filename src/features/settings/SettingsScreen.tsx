import { Card, SectionHeader } from '../../components/ui'
import { repository } from '../../data/repository'
import { preferences, usePreferences } from '../../lib/preferences'
import AccountCard from './AccountCard'
import BackupCard from './BackupCard'
import OptionsManager from './OptionsManager'
import TimeSetting from './TimeSetting'

function SettingsScreen() {
  const { morningCutoff } = usePreferences()

  return (
    <section
      aria-labelledby="settings-title"
      className="flex flex-col gap-[2.4rem] pt-[2.4rem]"
    >
      <h1 id="settings-title" className="text-screen">
        Settings
      </h1>

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

      <Card as="section" aria-label="Your options" className="flex flex-col gap-[1.6rem]">
        <SectionHeader title="Your options" />
        <OptionsManager />
      </Card>

      <Card as="section" aria-label="Backup" className="flex flex-col gap-[1.6rem]">
        <SectionHeader title="Backup" />
        <BackupCard />
      </Card>

      <Card as="section" aria-label="Account" className="flex flex-col gap-[1.6rem]">
        <SectionHeader title="Account" />
        <AccountCard />
      </Card>
    </section>
  )
}

export default SettingsScreen
