// Dev-only switcher between the token swatches, primitives and feature components pages.
import { useState } from 'react'
import ComponentsPage from './ComponentsPage'
import PrimitivesPage from './PrimitivesPage'
import SwatchPage from './SwatchPage'

const pages = [
  { id: 'primitives', label: 'Primitives', Page: PrimitivesPage },
  { id: 'components', label: 'Components', Page: ComponentsPage },
  { id: 'tokens', label: 'Tokens', Page: SwatchPage },
] as const

function DevPages() {
  const [active, setActive] = useState<(typeof pages)[number]['id']>('primitives')
  const { Page } = pages.find((p) => p.id === active)!

  return (
    <>
      <nav
        aria-label="Dev pages"
        className="fixed top-[1.6rem] left-[1.6rem] z-10 flex gap-[0.8rem]"
      >
        {pages.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={active === id}
            onClick={() => setActive(id)}
            className={`min-touch rounded-tile text-body-sm px-[1.6rem] ${
              active === id
                ? 'bg-brand-sage text-surface-card font-semibold'
                : 'bg-surface-card text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
      <Page />
    </>
  )
}

export default DevPages
