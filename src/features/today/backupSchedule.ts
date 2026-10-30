const DAY_MS = 24 * 60 * 60 * 1000

/** Days after the last backup (or the first entry, if never backed up) before the reminder appears. */
export const REMIND_AFTER_DAYS = 30

/** Days the reminder stays hidden after "Remind me later". */
export const SNOOZE_DAYS = 7

type ReminderInput = {
  now: Date
  /** ISO timestamp of the last JSON export, or null if never. */
  lastExportAt: string | null
  /** YYYY-MM-DD of the oldest entry, or null when nothing is logged yet. */
  firstEntryDate: string | null
  /** ISO timestamp until which the reminder is hidden, or null. */
  snoozedUntil: string | null
}

/**
 * Whole days since the last backup, or since the first entry if there never was one.
 * Null when there is nothing to back up, or it is too soon to ask, or the reminder is snoozed.
 */
export function daysSinceBackup({
  now,
  lastExportAt,
  firstEntryDate,
  snoozedUntil,
}: ReminderInput): number | null {
  if (snoozedUntil && now.getTime() < Date.parse(snoozedUntil)) return null

  const reference = lastExportAt ?? (firstEntryDate ? `${firstEntryDate}T00:00:00` : null)
  if (!reference) return null

  const days = Math.floor((now.getTime() - new Date(reference).getTime()) / DAY_MS)
  return days >= REMIND_AFTER_DAYS ? days : null
}

export function snoozeUntil(now: Date): string {
  return new Date(now.getTime() + SNOOZE_DAYS * DAY_MS).toISOString()
}
