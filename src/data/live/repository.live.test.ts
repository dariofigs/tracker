import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { supabase } from '../../lib/supabase'
import { newId } from '../../lib/ids'
import { createRepository } from '../repository'

// Runs against the Supabase test project from .env.test. Never point this at the real project.
const repo = createRepository(supabase)

// A date far from any real history. Rows created here are deleted in afterAll.
const TEST_DATE = '1999-01-01'

const entryIds: string[] = []
const optionIds: string[] = []

describe('live: signed out', () => {
  beforeAll(async () => {
    await supabase.auth.signOut()
  })

  it('returns no entries', async () => {
    const { data, error } = await supabase.from('entries').select()
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('refuses to save an entry', async () => {
    await expect(repo.upsertEntry({ entryDate: TEST_DATE, period: 'AM' })).rejects.toThrow()
  })
})

describe('live: signed in', () => {
  beforeAll(async () => {
    const email = import.meta.env.TEST_EMAIL
    const password = import.meta.env.TEST_PASSWORD
    if (!email || !password) throw new Error('TEST_EMAIL and TEST_PASSWORD must be set in .env.test')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  })

  afterAll(async () => {
    if (entryIds.length) await supabase.from('entries').delete().in('id', entryIds)
    if (optionIds.length) await supabase.from('custom_options').delete().in('id', optionIds)
    await supabase.auth.signOut()
  })

  it('saves a morning entry and reads it back', async () => {
    const saved = await repo.upsertEntry({
      entryDate: TEST_DATE,
      period: 'AM',
      wakingPain: 4,
      sleepHours: 7.5,
    })
    entryIds.push(saved.id)

    const [entry] = await repo.getEntriesForDate(TEST_DATE)
    expect(entry).toMatchObject({ period: 'AM', wakingPain: 4, sleepHours: 7.5 })
  })

  it('keeps existing fields when a save only supplies some fields', async () => {
    const saved = await repo.upsertEntry({
      entryDate: TEST_DATE,
      period: 'AM',
      startingCapacity: 50,
    })

    expect(saved.id).toBe(entryIds[0])
    expect(saved).toMatchObject({ wakingPain: 4, sleepHours: 7.5, startingCapacity: 50 })
  })

  it('clears a field when it is saved as null', async () => {
    const saved = await repo.upsertEntry({ entryDate: TEST_DATE, period: 'AM', sleepHours: null })

    expect(saved.sleepHours).toBeNull()
    expect(saved.wakingPain).toBe(4)
  })

  it('saves rows with different columns one at a time without clearing either', async () => {
    const [am, pm] = await repo.upsertEntries([
      { entryDate: TEST_DATE, period: 'AM', wakingPain: 2 },
      { entryDate: TEST_DATE, period: 'PM', endPain: 6 },
    ])
    // The AM row is the same one saved earlier, so only the PM row is new.
    expect(am.id).toBe(entryIds[0])
    entryIds.push(pm.id)

    const [savedAm, savedPm] = await repo.getEntriesForDate(TEST_DATE)
    expect(savedAm).toMatchObject({ period: 'AM', wakingPain: 2, activities: [] })
    expect(savedPm).toMatchObject({ period: 'PM', endPain: 6, symptoms: [] })
  })

  it('finds the entry in a date range', async () => {
    const entries = await repo.getEntriesInRange('1999-01-01', '1999-01-02')
    expect(entries.map((e) => e.id)).toEqual(entryIds)
  })

  it('saves the same timed log id twice as one row', async () => {
    const id = newId()
    const log = { occurredAt: new Date(1999, 2, 2, 9).toISOString(), kind: 'pain' as const, pain: 3 }

    try {
      await repo.upsertTimedLog(id, log)
      await repo.upsertTimedLog(id, { ...log, pain: 4 })

      const rows = await repo.listTimedLogs(new Date(1999, 2, 2), new Date(1999, 2, 3))
      const matches = rows.filter((r) => r.id === id)
      expect(matches).toHaveLength(1)
      expect(matches[0].pain).toBe(4)
    } finally {
      await repo.deleteTimedLog(id)
    }
  })

  it('adds, lists, updates and deletes a timed log', async () => {
    const day = new Date(1999, 2, 1, 10, 0)
    const added = await repo.addTimedLog({
      occurredAt: day.toISOString(),
      kind: 'pain',
      pain: 6,
    })

    try {
      const listed = await repo.listTimedLogs(new Date(1999, 2, 1), new Date(1999, 2, 2))
      expect(listed.map((l) => l.id)).toContain(added.id)

      const updated = await repo.updateTimedLog(added.id, { pain: 7 })
      expect(updated).toMatchObject({ kind: 'pain', pain: 7, occurredAt: added.occurredAt })
    } finally {
      await repo.deleteTimedLog(added.id)
    }

    const after = await repo.listTimedLogs(new Date(1999, 2, 1), new Date(1999, 2, 2))
    expect(after.map((l) => l.id)).not.toContain(added.id)
  })

  it('adds a custom option, then hides it without deleting it', async () => {
    const option = await repo.addCustomOption('symptom', 'live test option')
    optionIds.push(option.id)

    const hidden = await repo.updateCustomOption(option.id, { hidden: true })
    expect(hidden).toMatchObject({ label: 'live test option', hidden: true })

    const options = await repo.listCustomOptions('symptom')
    expect(options.find((o) => o.id === option.id)?.hidden).toBe(true)
  })
})
