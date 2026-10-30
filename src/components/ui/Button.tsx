import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet'
  /** Stretches to the container width at the 50px Save Entry height. */
  fullWidth?: boolean
}

const variants = {
  primary:
    'bg-brand-sage text-surface-card enabled:active:bg-brand-sage/90 disabled:bg-surface-subtle disabled:text-text-muted',
  secondary:
    'border border-brand-sage bg-surface-card text-brand-sage enabled:active:bg-sage-tint disabled:border-border-subtle disabled:text-text-muted',
  /** Low-emphasis action with no outline, for things like Sign out. */
  quiet:
    'bg-transparent text-clay-text enabled:active:bg-clay-tint disabled:text-text-muted',
}

function Button({
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`min-touch text-body focus-visible:outline-brand-sage inline-flex items-center justify-center rounded-full px-[2.4rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${
        fullWidth ? 'h-[5rem] w-full' : ''
      } ${variants[variant]} ${className}`}
      {...rest}
    />
  )
}

export default Button
