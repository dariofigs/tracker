import DevPages from './dev/DevPages'
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
        className="min-touch rounded-tile bg-surface-card text-body-sm fixed top-[1.6rem] right-[1.6rem] px-[1.6rem]"
      >
        Sign out
      </button>
      <DevPages />
    </>
  )
}

export default App
