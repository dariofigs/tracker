import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { supabase } from '../../lib/supabase'
import { entryToRow } from '../mappers'
import { generateSeed } from '../../dev/seedData'

// Option C: a bulk upsert with defaultToNull: false. Each test uses its own dates so the
// tests don't overlap the other live tests.
const DAY = '1999-02-01'
const BATCH_START = '1999-03-01'
const BATCH_END = '1999-04-29'
const BATCH_DAYS = 60
const ON_CONFLICT = 'user_id,entry_date,period'

describe('live: bulk upsert with defaultToNull: false', () => {
  beforeAll(async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: import.meta.env.TEST_EMAIL,
      password: import.meta.env.TEST_PASSWORD,
    })
    if (error) throw error
  })

  afterAll(async () => {
    await supabase.from('entries').delete().eq('entry_date', DAY)
    await supabase.from('entries').delete().gte('entry_date', BATCH_START).lte('entry_date', BATCH_END)
    await supabase.auth.signOut()
  })

  it('saves a 60-day batch with mixed columns, and saving it again changes nothing', async () => {
    // Morning rows have no evening columns and evening rows have no morning columns, so the
    // batch has the mixed keys that broke the first bulk attempt.
    const rows = generateSeed(BATCH_END, BATCH_DAYS).map(entryToRow)

    const first = await supabase.from('entries').upsert(rows, { onConflict: ON_CONFLICT, defaultToNull: false })
    expect(first.error).toBeNull()

    const read = () =>
      supabase
        .from('entries')
        .select('entry_date, period, waking_pain, end_pain, activities, symptoms')
        .gte('entry_date', BATCH_START)
        .lte('entry_date', BATCH_END)
        .order('entry_date')
        .order('period')
    const once = await read()
    expect(once.error).toBeNull()
    expect(once.data).toHaveLength(BATCH_DAYS * 2)
    expect(once.data?.every((r) => r.period === 'AM' ? r.end_pain === null : r.waking_pain === null)).toBe(true)

    const second = await supabase.from('entries').upsert(rows, { onConflict: ON_CONFLICT, defaultToNull: false })
    expect(second.error).toBeNull()

    const twice = await read()
    expect(twice.data).toEqual(once.data)
  })

  it('keeps existing columns and fills missing ones in a mixed-column bulk upsert', async () => {
    const seed = await supabase
      .from('entries')
      .upsert(entryToRow({ entryDate: DAY, period: 'AM', wakingPain: 1, symptoms: ['keep me'] }), {
        onConflict: ON_CONFLICT,
      })
    expect(seed.error).toBeNull()

    const bulk = await supabase.from('entries').upsert(
      [
        { entry_date: DAY, period: 'AM', waking_pain: 5 },
        { entry_date: DAY, period: 'PM', end_pain: 3 },
      ],
      { onConflict: ON_CONFLICT, defaultToNull: false },
    )
    console.log('bulk error:', JSON.stringify(bulk.error))

    const { data, error } = await supabase
      .from('entries')
      .select('period, waking_pain, end_pain, symptoms, activities')
      .eq('entry_date', DAY)
      .order('period')
    console.log('rows:', JSON.stringify(data))
    expect(error).toBeNull()

    expect(bulk.error).toBeNull()
    const am = data?.find((r) => r.period === 'AM')
    expect(am).toMatchObject({ waking_pain: 5, symptoms: ['keep me'] })
  })
})
