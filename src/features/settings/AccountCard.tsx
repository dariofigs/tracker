import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import AccountSection from './AccountSection'
import type { CredentialStatus } from './CredentialForm'

/** Sign out and change the login. */
function AccountCard() {
  const [emailStatus, setEmailStatus] = useState<CredentialStatus>({ state: 'idle' })
  const [passwordStatus, setPasswordStatus] = useState<CredentialStatus>({
    state: 'idle',
  })

  async function changeEmail(email: string) {
    setEmailStatus({ state: 'saving' })
    const { error } = await supabase.auth.updateUser({ email })
    setEmailStatus(
      error
        ? {
            state: 'error',
            message: 'Couldn’t change the email. Check it and try again.',
          }
        : {
            state: 'done',
            message: 'Check both inboxes and open the confirmation links to finish.',
          },
    )
  }

  async function changePassword(password: string) {
    setPasswordStatus({ state: 'saving' })
    const { error } = await supabase.auth.updateUser({ password })
    setPasswordStatus(
      error
        ? {
            state: 'error',
            message: 'Couldn’t change the password. Try a different one.',
          }
        : { state: 'done', message: 'Password changed.' },
    )
  }

  return (
    <AccountSection
      emailStatus={emailStatus}
      passwordStatus={passwordStatus}
      onChangeEmail={changeEmail}
      onChangePassword={changePassword}
      onSignOut={() => supabase.auth.signOut()}
    />
  )
}

export default AccountCard
