import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** False when .env is missing the Supabase URL or anon key. */
export const isSupabaseConfigured = Boolean(url && anonKey)

// The anon key is public by design. Row Level Security is what protects the data.
export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'missing-anon-key')
