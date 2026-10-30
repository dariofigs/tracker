import type { CustomOption, Entry, TimedLog } from '../../../data/types'

export const BACKUP_VERSION = 1

/** Everything needed to rebuild the data in an empty database. */
export type BackupFile = {
  version: typeof BACKUP_VERSION
  exportedAt: string
  entries: Entry[]
  customOptions: CustomOption[]
  timedLogs: TimedLog[]
  preferences: { morningCutoff: string }
}

export function buildBackup(
  data: Pick<BackupFile, 'entries' | 'customOptions' | 'timedLogs'>,
  preferences: BackupFile['preferences'],
  now: Date = new Date(),
): BackupFile {
  return {
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    entries: data.entries,
    customOptions: data.customOptions,
    timedLogs: data.timedLogs,
    preferences,
  }
}

export function backupToJson(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2)
}

/** Local day of the export, for file names like tracker-backup-2026-10-30.json. */
export function backupFileName(
  kind: 'backup' | 'entries' | 'timed-logs',
  now: Date,
  ext: 'json' | 'csv',
) {
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return `tracker-${kind}-${day}.${ext}`
}
