import { describe, expect, it } from 'vitest'
import { daysSinceBackup, snoozeUntil } from './backupSchedule'

const now = new Date('2026-10-30T12:00:00')
const base = { now, lastExportAt: null, firstEntryDate: null, snoozedUntil: null }

describe('daysSinceBackup', () => {
  it('stays quiet when nothing is logged', () => {
    expect(daysSinceBackup(base)).toBeNull()
  })

  it('does not nag a new user in the first month', () => {
    expect(daysSinceBackup({ ...base, firstEntryDate: '2026-10-10' })).toBeNull()
  })

  it('asks once the first entry is 30 days old and nothing was exported', () => {
    expect(daysSinceBackup({ ...base, firstEntryDate: '2026-09-20' })).toBe(40)
  })

  it('counts from the last export when there is one', () => {
    const recent = new Date('2026-10-15T12:00:00').toISOString()
    expect(
      daysSinceBackup({ ...base, firstEntryDate: '2026-01-01', lastExportAt: recent }),
    ).toBeNull()

    const old = new Date('2026-09-15T12:00:00').toISOString()
    expect(
      daysSinceBackup({ ...base, firstEntryDate: '2026-01-01', lastExportAt: old }),
    ).toBe(45)
  })

  it('appears on day 30 after the last export, not before', () => {
    const exportedAt = new Date('2026-09-30T12:00:00').toISOString()
    const input = { ...base, lastExportAt: exportedAt }
    expect(daysSinceBackup({ ...input, now: new Date('2026-10-29T12:00:00') })).toBeNull()
    expect(daysSinceBackup({ ...input, now: new Date('2026-10-30T12:00:00') })).toBe(30)
  })

  it('stays hidden while snoozed, then returns', () => {
    const input = { ...base, firstEntryDate: '2026-01-01' }
    expect(daysSinceBackup({ ...input, snoozedUntil: snoozeUntil(now) })).toBeNull()
    expect(
      daysSinceBackup({
        ...input,
        now: new Date('2026-11-08T12:00:00'),
        snoozedUntil: snoozeUntil(now),
      }),
    ).not.toBeNull()
  })
})
