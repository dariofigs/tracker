import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { supabase } from '../../lib/supabase'
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

  it('finds the entry in a date range', async () => {
    const entries = await repo.getEntriesInRange('1999-01-01', '1999-01-02')
    expect(entries.map((e) => e.id)).toEqual(entryIds)
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
