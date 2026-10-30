import type { ButtonHTMLAttributes } from 'react'

type PillChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'children'
> & {
  label: string
  selected: boolean
  onChange: (selected: boolean) => void
  /** Sage for symptoms/general, Clay for exertion. */
  variant?: 'sage' | 'clay'
}

const activeStyles = {
  sage: 'border-brand-sage bg-sage-tint text-brand-sage',
  clay: 'border-accent-clay bg-clay-tint text-clay-text',
}

function PillChip({
  label,
  selected,
  onChange,
  variant = 'sage',
  className = '',
  ...rest
}: PillChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onChange(!selected)}
      className={`min-touch text-body focus-visible:outline-brand-sage inline-flex items-center gap-[0.8rem] rounded-full border px-[1.6rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
        selected
          ? `${activeStyles[variant]} font-bold`
          : 'bg-surface-subtle text-text-muted border-transparent'
      } ${className}`}
      {...rest}
    >
      <span aria-hidden="true">{selected ? '✓' : '+'}</span>
      {label}
    </button>
  )
}

export default PillChip
