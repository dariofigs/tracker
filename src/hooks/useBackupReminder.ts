import { useEffect, useState } from 'react'
import { repository } from '../data/repository'
import { isDemo } from '../demo/mode'
import { daysSinceBackup, snoozeUntil } from '../features/today/backupSchedule'
import { preferences, usePreferences } from '../lib/preferences'

/** Days since the last backup when the Today reminder should show, else null. */
export function useBackupReminder(): {
  days: number | null
  neverBackedUp: boolean
  snooze: () => void
} {
  const { lastExportAt, backupReminderSnoozedUntil } = usePreferences()
  const [firstEntryDate, setFirstEntryDate] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    repository
      .getEarliestEntryDate()
      .then((day) => {
        if (active) setFirstEntryDate(day)
      })
      .catch(() => {
        // Offline: no reminder this time.
      })
    return () => {
      active = false
    }
  }, [])

  return {
    // The demo has nothing to back up.
    days: isDemo
      ? null
      : daysSinceBackup({
          now: new Date(),
          lastExportAt,
          firstEntryDate,
          snoozedUntil: backupReminderSnoozedUntil,
        }),
    neverBackedUp: lastExportAt === null,
    snooze: () =>
      preferences.set({ backupReminderSnoozedUntil: snoozeUntil(new Date()) }),
  }
}
