export type Status = 'balanced' | 'low-battery' | 'due' | 'flare'

const styles: Record<Status, { label: string; className: string }> = {
  balanced: { label: 'Balanced', className: 'bg-sage-tint text-brand-sage' },
  'low-battery': { label: 'Low Battery', className: 'bg-clay-tint text-accent-clay' },
  due: { label: 'DUE', className: 'bg-accent-clay text-surface-card' },
  flare: { label: 'Flare', className: 'bg-plum-tint text-flare-plum' },
}

type StatusChipProps = {
  status: Status
  /** Overrides the default label for the status. */
  label?: string
}

/** Read-only tag. Tappable toggles are the Pill Chip (3.2). */
function StatusChip({ status, label }: StatusChipProps) {
  const { label: defaultLabel, className } = styles[status]
  return (
    <span
      className={`text-micro inline-flex items-center rounded-full px-[1rem] py-[0.4rem] font-bold whitespace-nowrap uppercase ${className}`}
    >
      {label ?? defaultLabel}
    </span>
  )
}

export default StatusChip
