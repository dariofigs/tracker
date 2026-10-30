import { repository } from '../../../data/repository'
import { preferences } from '../../../lib/preferences'
import { backupFileName, backupToJson, buildBackup } from './backupFile'
import { saveTextFile } from './download'
import { entriesToCsv, timedLogsToCsv } from './exportCsv'
import type { SavedData } from './importPlan'

/** Everything saved for the signed-in user. */
export async function loadAllData(): Promise<SavedData> {
  const [entries, customOptions, timedLogs] = await Promise.all([
    repository.getAllEntries(),
    repository.listAllCustomOptions(),
    repository.listAllTimedLogs(),
  ])
  return { entries, customOptions, timedLogs }
}

/** Saves the JSON backup and, if it was delivered, records the date for the monthly reminder. */
export async function exportJson(
  now: Date = new Date(),
): Promise<{ saved: boolean; entries: number }> {
  const data = await loadAllData()
  const backup = buildBackup(
    data,
    { morningCutoff: preferences.get().morningCutoff },
    now,
  )
  const saved = await saveTextFile(
    backupFileName('backup', now, 'json'),
    backupToJson(backup),
    'application/json',
  )
  if (saved)
    preferences.set({ lastExportAt: now.toISOString(), backupReminderSnoozedUntil: null })
  return { saved, entries: data.entries.length }
}

/** Saves a spreadsheet of check-ins, plus one of timed logs when there are any. */
export async function exportCsv(
  now: Date = new Date(),
): Promise<{ saved: boolean; entries: number }> {
  const data = await loadAllData()
  const saved = await saveTextFile(
    backupFileName('entries', now, 'csv'),
    entriesToCsv(data.entries),
    'text/csv',
  )
  if (saved && data.timedLogs.length > 0) {
    await saveTextFile(
      backupFileName('timed-logs', now, 'csv'),
      timedLogsToCsv(data.timedLogs),
      'text/csv',
    )
  }
  return { saved, entries: data.entries.length }
}
