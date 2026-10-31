import { MAX_NAME_LENGTH } from '../../lib/preferences'

type NameSettingProps = {
  value: string
  onChange: (value: string) => void
  /** Called when the field loses focus, with the trimmed name, so the account is saved once per edit. */
  onCommit?: (value: string) => void
}

/** What the Today greeting calls you. Left empty, the greeting has no name. */
function NameSetting({ value, onChange, onCommit }: NameSettingProps) {
  return (
    <div className="flex flex-col gap-[0.8rem]">
      <label className="flex items-center justify-between gap-[1.6rem]">
        <span className="text-body text-balance">Your name</span>
        <input
          type="text"
          value={value}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="given-name"
          placeholder="Optional"
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => {
            const trimmed = e.target.value.trim()
            if (trimmed !== e.target.value) onChange(trimmed)
            onCommit?.(trimmed)
          }}
          className="min-touch bg-surface-subtle text-body text-text-primary focus-visible:outline-brand-sage w-[16rem] min-w-0 rounded-full px-[1.6rem] focus-visible:outline-2"
        />
      </label>
      <p className="text-caption text-text-muted">Shown in the greeting on the Today tab.</p>
    </div>
  )
}

export default NameSetting
