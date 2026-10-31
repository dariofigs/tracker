import { createClient } from '@supabase/supabase-js'
import { demoClient } from '../demo/demoClient'
import { isDemo } from '../demo/mode'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** False when .env is missing the Supabase URL or anon key. The demo needs neither. */
export const isSupabaseConfigured = isDemo || Boolean(url && anonKey)

// The anon key is public by design. Row Level Security is what protects the data.
// On /demo the client is a stub, so the page can't reach the real database.
export const supabase = isDemo
  ? demoClient
  : createClient(url ?? 'http://localhost', anonKey ?? 'missing-anon-key')
