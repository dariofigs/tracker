import { Icon } from '../components/ui'
import { preferences } from '../lib/preferences'
import { useResolvedTheme } from '../lib/theme'

const OPTIONS = [
  { theme: 'light', label: 'Light', icon: 'sun' },
  { theme: 'dark', label: 'Dark', icon: 'moon' },
] as const

/** Dev-only light/dark switch. Writes the same preference as Settings, so it overrides System and Day and night. */
function ThemeSwitch() {
  const resolved = useResolvedTheme()

  return (
    <div
      role="group"
      aria-label="Theme"
      className="border-border-subtle bg-surface-card inline-flex rounded-full border p-[0.4rem]"
    >
      {OPTIONS.map(({ theme, label, icon }) => {
        const active = resolved === theme
        return (
          <button
            key={theme}
            type="button"
            aria-pressed={active}
            aria-label={label}
            onClick={() => preferences.set({ theme })}
            className={`focus-visible:outline-brand-sage flex h-[4rem] min-w-[4.8rem] items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
              active ? 'bg-brand-sage text-surface-card' : 'text-text-muted'
            }`}
          >
            <Icon name={icon} size={20} />
          </button>
        )
      })}
    </div>
  )
}

export default ThemeSwitch
