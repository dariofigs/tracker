import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  /** Status chip or other trailing element. */
  trailing?: ReactNode
  /** Heading level; defaults to h2. */
  level?: 2 | 3
}

function SectionHeader({ title, trailing, level = 2 }: SectionHeaderProps) {
  const Heading = level === 2 ? 'h2' : 'h3'
  return (
    <div className="flex min-h-[2.8rem] items-center justify-between gap-[1.2rem]">
      <Heading className="text-section text-text-primary">{title}</Heading>
      {trailing}
    </div>
  )
}

export default SectionHeader
