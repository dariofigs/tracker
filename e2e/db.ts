import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Direct access to the test project, for seeding rows and checking what the app saved.
// Every row the specs create uses 1998 dates or an "e2e " label so cleanup never touches other data.

export const SEED_DAYS = ['1998-07-01', '1998-07-02', '1998-08-01']

let client: SupabaseClient | null = null

export async function db(): Promise<SupabaseClient> {
  if (client) return client
  const next = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
  )
  const { error } = await next.auth.signInWithPassword({
    email: process.env.TEST_EMAIL!,
    password: process.env.TEST_PASSWORD!,
  })
  if (error) throw error
  client = next
  return next
}

export async function cleanUp() {
  const supabase = await db()
  await supabase.from('entries').delete().in('entry_date', SEED_DAYS)
  await supabase.from('custom_options').delete().like('label', 'e2e %')
}

/** One insert per row: a bulk insert would send null for columns only some rows have. */
export async function seedEntries(rows: Record<string, unknown>[]) {
  const supabase = await db()
  for (const row of rows) {
    const { error } = await supabase.from('entries').insert(row)
    if (error) throw error
  }
}

export async function entriesOn(day: string) {
  const { data, error } = await (
    await db()
  )
    .from('entries')
    .select()
    .eq('entry_date', day)
    .order('period')
  if (error) throw error
  return data ?? []
}
