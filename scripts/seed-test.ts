// Fills the Supabase TEST project with about 60 days of seed data (checklist 2.6).
// Run with: npm run seed:test
// Fails closed: it runs only when .env.test names its own project ref in SEED_ALLOWED_PROJECT_REF,
// that ref matches the URL it is about to write to, and the URL differs from the real project in .env.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import {
  SEED_NOTE,
  SEED_OPTIONS,
  generateSeed,
  generateTimedSeed,
} from '../src/dev/seedData'
import { entryToRow, timedLogToRow } from '../src/data/mappers'
import { todayString } from '../src/lib/dates'

const DAYS = 60

function readEnvFile(path: string): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync(path, 'utf8')
        .split(/\r?\n/)
        .filter((line) => line.includes('=') && !line.startsWith('#'))
        .map((line) => {
          const index = line.indexOf('=')
          return [line.slice(0, index).trim(), line.slice(index + 1).trim()]
        }),
    )
  } catch {
    return {}
  }
}

const testUrl = process.env.VITE_SUPABASE_URL
const testKey = process.env.VITE_SUPABASE_ANON_KEY
const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD

if (!testUrl || !testKey || !email || !password) {
  throw new Error(
    'Run with --env-file=.env.test and set the URL, key, TEST_EMAIL and TEST_PASSWORD.',
  )
}

const allowedRef = process.env.SEED_ALLOWED_PROJECT_REF
const testRef = new URL(testUrl).hostname.split('.')[0]
if (!allowedRef || allowedRef !== testRef) {
  throw new Error(
    `Set SEED_ALLOWED_PROJECT_REF=${testRef} in .env.test to confirm this is the test project.`,
  )
}

const realUrl = readEnvFile('.env').VITE_SUPABASE_URL
if (!realUrl) {
  throw new Error(
    '.env has no VITE_SUPABASE_URL, so the real project cannot be ruled out.',
  )
}
if (new URL(realUrl).hostname === new URL(testUrl).hostname) {
  throw new Error(
    '.env.test points at the real project. Seed data is only written to the test project.',
  )
}

const client = createClient(testUrl, testKey)
const { error: signInError } = await client.auth.signInWithPassword({ email, password })
if (signInError) throw signInError

// The repository module reads Vite's import.meta.env, so this script talks to the client directly.
const { data: existing, error: listError } = await client
  .from('custom_options')
  .select('kind, label')
if (listError) throw listError

const missing = Object.entries(SEED_OPTIONS).flatMap(([kind, labels]) =>
  labels
    .filter((label) => !existing?.some((row) => row.kind === kind && row.label === label))
    .map((label) => ({ kind, label })),
)
if (missing.length) {
  const { error: insertError } = await client.from('custom_options').insert(missing)
  if (insertError) throw insertError
}

// One row per request. A bulk upsert with rows that have different columns fills the gaps with null.
const entries = generateSeed(todayString(), DAYS)
for (const entry of entries) {
  const { error } = await client
    .from('entries')
    .upsert(entryToRow(entry), { onConflict: 'user_id,entry_date,period' })
  if (error) throw error
}

// Timed logs have no unique key, so clear the previous seed logs first to keep reruns from doubling them.
const { error: clearError } = await client
  .from('timed_logs')
  .delete()
  .eq('note', SEED_NOTE)
if (clearError) throw clearError

const timed = generateTimedSeed(todayString(), DAYS)
for (const log of timed) {
  const { error: logError } = await client.from('timed_logs').insert(timedLogToRow(log))
  if (logError) throw logError
}

await client.auth.signOut()
console.log(
  `Seeded ${entries.length} entries and ${timed.length} timed logs (${DAYS} days) into the test project.`,
)
