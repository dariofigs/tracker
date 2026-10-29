import type { ReactNode } from 'react'

export type NavItem = {
  id: string
  label: string
  icon: ReactNode
}

type BottomNavProps = {
  items: NavItem[]
  value: string
  onChange: (id: string) => void
}

/** Floating pill of tabs. The app shell (4.1) positions it and adds the safe-area inset. */
function BottomNav({ items, value, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Main"
      className="border-border-subtle bg-surface-card mx-auto flex w-fit items-center gap-[0.4rem] rounded-full border p-[0.6rem] shadow-lg"
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange(item.id)}
            className={`min-touch text-micro focus-visible:outline-brand-sage flex min-w-[8rem] flex-col items-center justify-center gap-[0.2rem] rounded-full px-[1.6rem] py-[0.6rem] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${
              active ? 'bg-sage-tint text-brand-sage' : 'text-text-muted'
            }`}
          >
            <span aria-hidden="true" className="size-[2.4rem]">
              {item.icon}
            </span>
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
