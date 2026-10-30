import type { ReactNode } from 'react'

/** A labelled row inside a check-in form. */
function Field({
  label,
  hint,
  children,
}: {
  label: string
  /** One short, encouraging line on why this is asked or how to answer. */
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-[0.8rem]">
      <div>
        <p className="text-body text-text-primary font-semibold">{label}</p>
        {hint && <p className="text-caption text-text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

export default Field
