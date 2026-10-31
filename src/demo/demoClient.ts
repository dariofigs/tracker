import type { Session, SupabaseClient } from '@supabase/supabase-js'

const DEMO_SESSION = {
  access_token: 'demo',
  refresh_token: 'demo',
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'demo-user', email: 'demo@example.com' },
} as unknown as Session

/**
 * Stands in for the Supabase client on /demo. Only the auth calls the app makes outside the
 * repository exist, and they always succeed. Nothing here touches the network.
 */
export const demoClient = {
  auth: {
    getSession: async () => ({ data: { session: DEMO_SESSION }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    updateUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
} as unknown as SupabaseClient
