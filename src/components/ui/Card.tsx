import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'section' | 'article'
}

function Card({ as: Tag = 'div', className = '', ...rest }: CardProps) {
  return (
    <Tag
      className={`rounded-card border-border-subtle bg-surface-card border p-[1.6rem] ${className}`}
      {...rest}
    />
  )
}

export default Card
