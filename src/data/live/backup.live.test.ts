import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  applyImport,
  parseBackup,
  planImport,
} from '../../features/settings/backup/importPlan'
import { backupToJson, buildBackup } from '../../features/settings/backup/backupFile'
import { supabase } from '../../lib/supabase'
import { createRepository } from '../repository'

// Runs against the Supabase test project from .env.test. Never point this at the real project.
const repo = createRepository(supabase)

// Dates no other live test uses, since the live files run in parallel against one account.
// Only rows created here are deleted and restored.
const DAYS = ['1998-06-01', '1998-06-02']

async function snapshot() {
  const [entries, customOptions, timedLogs] = await Promise.all([
    repo.getAllEntries(),
    repo.listAllCustomOptions(),
    repo.listAllTimedLogs(),
  ])
  return { entries, customOptions, timedLogs }
}

/** The part of a check-in that must survive a restore. Ids and timestamps are made fresh. */
function comparable(entries: Awaited<ReturnType<typeof snapshot>>['entries']) {
  return entries
    .filter((e) => DAYS.includes(e.entryDate))
    .map((e) => {
      const copy: Partial<typeof e> = { ...e }
      delete copy.id
      delete copy.createdAt
      delete copy.updatedAt
      return copy
    })
}

describe('live: export, delete, import', () => {
  const optionLabel = `backup live ${Date.now()}`

  beforeAll(async () => {
    const email = import.meta.env.TEST_EMAIL
    const password = import.meta.env.TEST_PASSWORD
    if (!email || !password)
      throw new Error('TEST_EMAIL and TEST_PASSWORD must be set in .env.test')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  })

  afterAll(async () => {
    await supabase.from('entries').delete().in('entry_date', DAYS)
    await supabase.from('custom_options').delete().eq('label', optionLabel)
    await supabase.auth.signOut()
  })

  it('restores the same data after the rows are deleted', async () => {
    await repo.upsertEntries([
      {
        entryDate: DAYS[0],
        period: 'AM',
        wakingPain: 5,
        sleepHours: 6.5,
        sleepQuality: 3,
        startingCapacity: 60,
        note: 'a "quoted", note',
      },
      {
        entryDate: DAYS[0],
        period: 'PM',
        endPain: 7,
        exercise: { type: 'Walk', minutes: 25, effort: 2 },
        activities: ['Walk'],
        symptoms: ['Fatigue'],
        painAreas: ['Neck'],
        stress: 4,
        remainingCapacity: 20,
      },
      { entryDate: DAYS[1], period: 'AM', wakingPain: 0 },
    ])
    await repo.addCustomOption('activity', optionLabel)

    // Back up only this test's rows: other live files write to the same account at the same time.
    const all = await snapshot()
    const before = {
      entries: all.entries.filter((e) => DAYS.includes(e.entryDate)),
      customOptions: all.customOptions.filter((o) => o.label === optionLabel),
      timedLogs: [],
    }
    const file = backupToJson(buildBackup(before, { morningCutoff: '12:00' }))

    await supabase.from('entries').delete().in('entry_date', DAYS)
    await supabase.from('custom_options').delete().eq('label', optionLabel)
    expect(comparable((await snapshot()).entries)).toEqual([])

    const parsed = parseBackup(file)
    if (!parsed.ok) throw new Error(parsed.error)
    const plan = planImport(parsed.backup, await snapshot())
    expect(plan.entries.added).toHaveLength(3)
    await applyImport(repo, plan, false)

    const after = await snapshot()
    expect(comparable(after.entries)).toEqual(comparable(before.entries))
    expect(after.customOptions.filter((o) => o.label === optionLabel)).toHaveLength(1)

    // Importing the same file again finds nothing left to do.
    const again = planImport(parsed.backup, after)
    expect(again.entries.added).toHaveLength(0)
    expect(again.entries.changed).toHaveLength(0)
    expect(again.options.added).toHaveLength(0)
  })
})
