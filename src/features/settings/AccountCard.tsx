import { useState } from 'react'
import { Button } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import CredentialForm, { type CredentialStatus } from './CredentialForm'

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
    <div className="flex flex-col gap-[2.4rem]">
      <CredentialForm kind="email" status={emailStatus} onSubmit={changeEmail} />
      <div className="pt-[2.4rem]">
        <CredentialForm
          kind="password"
          status={passwordStatus}
          onSubmit={changePassword}
        />
      </div>
      <div className="border-border-subtle border-t pt-[1.6rem]">
        <Button variant="quiet" fullWidth onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}

export default AccountCard
