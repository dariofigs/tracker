import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { supabase } from '../../lib/supabase'
import { entryToRow } from '../mappers'

// Experiment for option C: a bulk upsert with defaultToNull: false. Uses its own date so it
// doesn't overlap the other live tests.
const DAY = '1999-02-01'
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
    await supabase.auth.signOut()
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
