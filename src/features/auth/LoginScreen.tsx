import { useState, type FormEvent } from 'react'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (signInError) setError('That email and password did not match. Try again.')
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto min-h-dvh max-w-[43rem] bg-canvas-bg p-[1.6rem] text-text-primary">
        <h1 className="text-screen font-display">Setup needed</h1>
        <p className="text-body text-text-muted">
          Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the dev server.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[43rem] flex-col justify-center bg-canvas-bg p-[1.6rem] text-text-primary">
      <h1 className="text-screen font-display">Sign in</h1>
      <form onSubmit={handleSubmit} className="mt-[2.4rem] space-y-[1.6rem]">
        <label className="block space-y-[0.8rem]">
          <span className="text-body-sm text-text-muted">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-touch w-full rounded-tile border border-border-subtle bg-surface-card px-[1.6rem] text-body"
          />
        </label>
        <label className="block space-y-[0.8rem]">
          <span className="text-body-sm text-text-muted">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-touch w-full rounded-tile border border-border-subtle bg-surface-card px-[1.6rem] text-body"
          />
        </label>
        {error && (
          <p role="alert" className="text-body-sm text-flare-plum">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="min-touch w-full rounded-tile bg-brand-sage px-[1.6rem] text-title font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
