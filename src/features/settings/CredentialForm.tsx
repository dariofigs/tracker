import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui'

export type CredentialStatus =
  | { state: 'idle' }
  | { state: 'saving' }
  | { state: 'done'; message: string }
  | { state: 'error'; message: string }

type CredentialFormProps = {
  kind: 'email' | 'password'
  status: CredentialStatus
  /** The new email or password, after the form's own checks pass. */
  onSubmit: (value: string) => void
}

export const MIN_PASSWORD = 8

const field =
  'min-touch w-full rounded-tile border border-border-subtle bg-surface-card px-[1.6rem] text-body'

/** Change-email or change-password form with a confirm field for passwords. */
function CredentialForm({ kind, status, onSubmit }: CredentialFormProps) {
  const [value, setValue] = useState('')
  const [confirm, setConfirm] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const isPassword = kind === 'password'
  const saving = status.state === 'saving'

  function submit(event: FormEvent) {
    event.preventDefault()
    if (isPassword && value.length < MIN_PASSWORD) {
      setProblem(`Use at least ${MIN_PASSWORD} characters.`)
      return
    }
    if (isPassword && value !== confirm) {
      setProblem('The two passwords don’t match.')
      return
    }
    if (!isPassword && !/^\S+@\S+\.\S+$/.test(value.trim())) {
      setProblem('Enter a full email address.')
      return
    }
    setProblem(null)
    onSubmit(isPassword ? value : value.trim())
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-[1.2rem]">
      <label className="block space-y-[0.8rem]">
        <span className="text-body-sm text-text-muted">
          {isPassword ? 'New password' : 'New email'}
        </span>
        <input
          type={isPassword ? 'password' : 'email'}
          name={isPassword ? 'new-password' : 'new-email'}
          autoComplete={isPassword ? 'new-password' : 'email'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={field}
        />
      </label>
      {isPassword && (
        <label className="block space-y-[0.8rem]">
          <span className="text-body-sm text-text-muted">Repeat new password</span>
          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={field}
          />
        </label>
      )}
      {(problem || status.state === 'error') && (
        <p role="alert" className="text-body-sm text-flare-plum">
          {problem ?? (status.state === 'error' ? status.message : '')}
        </p>
      )}
      {status.state === 'done' && (
        <p role="status" className="text-body-sm text-brand-sage">
          {status.message}
        </p>
      )}
      <Button type="submit" variant="secondary" disabled={saving}>
        {saving ? 'Saving…' : isPassword ? 'Change password' : 'Change email'}
      </Button>
    </form>
  )
}

export default CredentialForm
