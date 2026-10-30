import type { ButtonHTMLAttributes } from 'react'
import Icon from './Icon'

type PillChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'children'
> & {
  label: string
  selected: boolean
  onChange: (selected: boolean) => void
}

function PillChip({
  label,
  selected,
  onChange,
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
          ? 'border-brand-sage bg-sage-tint text-brand-sage font-semibold'
          : 'bg-surface-subtle text-text-muted border-transparent'
      } ${className}`}
      {...rest}
    >
      <Icon name={selected ? 'check' : 'add'} bold={selected} size={18} />
      {label}
    </button>
  )
}

export default PillChip
