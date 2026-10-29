import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import DevPages from './dev/DevPages'
import InsightsScreen from './features/insights/InsightsScreen'
import LoginScreen from './features/auth/LoginScreen'
import SettingsScreen from './features/settings/SettingsScreen'
import TodayScreen from './features/today/TodayScreen'
import { useSession } from './hooks/useSession'
import { supabase } from './lib/supabase'

function App() {
  const { session, loading } = useSession()

  if (loading) return null
  if (!session) return <LoginScreen />

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<TodayScreen />} />
        <Route path="insights" element={<InsightsScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
      </Route>
      {import.meta.env.DEV && (
        <Route
          path="dev"
          element={
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
          }
        />
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
