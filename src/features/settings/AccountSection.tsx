import { Button } from '../../components/ui'
import CredentialForm, { type CredentialStatus } from './CredentialForm'

type AccountSectionProps = {
  emailStatus: CredentialStatus
  passwordStatus: CredentialStatus
  onChangeEmail: (email: string) => void
  onChangePassword: (password: string) => void
  onSignOut: () => void
}

/** Change-login forms and Sign out. Pure layout; AccountCard supplies the Supabase calls. */
function AccountSection({
  emailStatus,
  passwordStatus,
  onChangeEmail,
  onChangePassword,
  onSignOut,
}: AccountSectionProps) {
  return (
    <div className="flex flex-col gap-[2.4rem]">
      <CredentialForm kind="email" status={emailStatus} onSubmit={onChangeEmail} />
      <div className="pt-[2.4rem]">
        <CredentialForm
          kind="password"
          status={passwordStatus}
          onSubmit={onChangePassword}
        />
      </div>
      <div className="border-border-subtle border-t pt-[1.6rem]">
        <Button variant="quiet" fullWidth onClick={onSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  )
}

export default AccountSection
