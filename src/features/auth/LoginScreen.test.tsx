import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const signInWithPassword = vi.fn()

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { auth: { signInWithPassword: (...args: unknown[]) => signInWithPassword(...args) } },
}))

import LoginScreen from './LoginScreen'

describe('LoginScreen', () => {
  beforeEach(() => {
    signInWithPassword.mockReset()
  })

  it('signs in with the entered email and password', async () => {
    signInWithPassword.mockResolvedValue({ error: null })
    render(<LoginScreen />)

    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret-pass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'me@example.com',
      password: 'secret-pass',
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an error when sign-in fails', async () => {
    signInWithPassword.mockResolvedValue({ error: new Error('Invalid login') })
    render(<LoginScreen />)

    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('did not match')
  })
})
