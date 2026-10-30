import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ErrorBoundary from './components/ErrorBoundary'
import StartupScreen from './components/StartupScreen'
import DevPages from './dev/DevPages'
import LoginScreen from './features/auth/LoginScreen'
import TodayScreen from './features/today/TodayScreen'
import { useSession } from './hooks/useSession'
import { isSupabaseConfigured, supabase } from './lib/supabase'

// Insights (charts) and Settings (backup tools) load on first visit, keeping the first screen small.
const InsightsScreen = lazy(() => import('./features/insights/InsightsScreen'))
const SettingsScreen = lazy(() => import('./features/settings/SettingsScreen'))

function App() {
  const { session, loading, failed, retry } = useSession()

  if (!isSupabaseConfigured) {
    return (
      <StartupScreen
        state="error"
        title="App isn’t configured"
        message="The Supabase URL or key is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild."
      />
    )
  }
  if (loading) return <StartupScreen state="loading" />
  if (failed) {
    return (
      <StartupScreen
        state="error"
        title="Couldn’t reach your data"
        message="Check your connection. If you haven’t used the app for a week, the free database may be paused: restart it from the Supabase dashboard."
        onRetry={retry}
      />
    )
  }
  if (!session) return <LoginScreen />

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App
