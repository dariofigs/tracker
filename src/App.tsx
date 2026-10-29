import SwatchPage from './dev/SwatchPage'
import LoginScreen from './features/auth/LoginScreen'
import { useSession } from './hooks/useSession'
import { supabase } from './lib/supabase'

function App() {
  const { session, loading } = useSession()

  if (loading) return null
  if (!session) return <LoginScreen />

  return (
    <>
      <button
        type="button"
        onClick={() => supabase.auth.signOut()}
        className="min-touch fixed top-[1.6rem] right-[1.6rem] rounded-tile bg-surface-card px-[1.6rem] text-body-sm"
      >
        Sign out
      </button>
      <SwatchPage />
    </>
  )
}

export default App
