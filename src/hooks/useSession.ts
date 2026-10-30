import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface SessionState {
  session: Session | null
  loading: boolean
  /** True when the first session lookup failed, for example the database is unreachable or paused. */
  failed: boolean
  retry: () => void
}

/** Tracks the signed-in session and keeps it in sync across sign-in, sign-out and token refresh. */
export function useSession(): SessionState {
  const [state, setState] = useState<Omit<SessionState, 'retry'>>({
    session: null,
    loading: true,
    failed: false,
  })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => {
    setState({ session: null, loading: true, failed: false })
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return
        setState({
          session: data.session,
          loading: false,
          failed: Boolean(error) && !data.session,
        })
      })
      .catch(() => {
        if (active) setState({ session: null, loading: false, failed: true })
      })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ session, loading: false, failed: false })
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [attempt])

  return { ...state, retry }
}
