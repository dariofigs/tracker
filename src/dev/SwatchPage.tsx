// Swatch page (checklist 0.5). Kept as a permanent reference for the design tokens.

const colors = [
  { name: 'canvas-bg', hex: '#FBF9F5', className: 'bg-canvas-bg' },
  { name: 'surface-card', hex: '#FFFFFF', className: 'bg-surface-card' },
  { name: 'surface-subtle', hex: '#F3EFEA', className: 'bg-surface-subtle' },
  { name: 'border-subtle', hex: '#EBE5DC', className: 'bg-border-subtle' },
  { name: 'brand-sage', hex: '#2D5A46', className: 'bg-brand-sage' },
  { name: 'sage-tint', hex: '#E8F2EC', className: 'bg-sage-tint' },
  { name: 'accent-clay', hex: '#C47151', className: 'bg-accent-clay' },
  { name: 'clay-tint', hex: '#FDF1ED', className: 'bg-clay-tint' },
  { name: 'flare-plum', hex: '#8C3B4E', className: 'bg-flare-plum' },
  { name: 'plum-tint', hex: '#FBECEF', className: 'bg-plum-tint' },
  { name: 'amber-pacing', hex: '#D97706', className: 'bg-amber-pacing' },
  { name: 'text-primary', hex: '#1E2220', className: 'bg-text-primary' },
  { name: 'text-muted', hex: '#736B63', className: 'bg-text-muted' },
]

const typeScale = [
  { name: 'screen · 28px', className: 'text-screen font-display' },
  { name: 'section · 20px', className: 'text-section font-display' },
  { name: 'title · 16px', className: 'text-title font-semibold' },
  { name: 'body · 14px', className: 'text-body' },
  { name: 'body-sm · 13px', className: 'text-body-sm' },
  { name: 'micro · 11px', className: 'text-micro uppercase font-semibold' },
  { name: 'metric · 40px', className: 'text-metric font-extrabold' },
]

const radii = [
  { name: 'tile · 16px', className: 'rounded-tile' },
  { name: 'card · 20px', className: 'rounded-card' },
  { name: 'sheet · 24px', className: 'rounded-sheet' },
]

function SwatchPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-[43rem] space-y-[2.4rem] bg-canvas-bg p-[1.6rem] text-text-primary">
      <header>
        <h1 className="text-screen">Botanical Sanctuary</h1>
        <p className="text-body text-text-muted">Swatch page, checklist 0.5</p>
      </header>

      <section className="space-y-[1.2rem]">
        <h2 className="text-section">Color tokens</h2>
        <ul className="grid grid-cols-2 gap-[1.2rem]">
          {colors.map((c) => (
            <li key={c.name} className="rounded-card border border-border-subtle bg-surface-card p-[1.2rem]">
              <div className={`h-[4.8rem] rounded-tile border border-border-subtle ${c.className}`} />
              <p className="mt-[0.8rem] text-body-sm font-semibold">{c.name}</p>
              <p className="text-micro uppercase text-text-muted">{c.hex}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-[1.2rem]">
        <h2 className="text-section">Type scale</h2>
        <div className="space-y-[1.2rem] rounded-card border border-border-subtle bg-surface-card p-[1.6rem]">
          {typeScale.map((t) => (
            <div key={t.name}>
              <p className={t.className}>The quick brown fox</p>
              <p className="text-micro uppercase text-text-muted">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-[1.2rem]">
        <h2 className="text-section">Radii</h2>
        <div className="grid grid-cols-3 gap-[1.2rem]">
          {radii.map((r) => (
            <div key={r.name} className={`h-[8rem] border border-border-subtle bg-sage-tint ${r.className}`}>
              <p className="p-[0.8rem] text-micro uppercase text-text-muted">{r.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-[1.2rem]">
        <h2 className="text-section">48px min-touch</h2>
        <div className="flex gap-[1.2rem]">
          <button type="button" className="min-touch rounded-tile border border-brand-sage bg-sage-tint px-[1.2rem] text-body font-semibold text-brand-sage">
            ✓ Active chip
          </button>
          <button type="button" className="min-touch rounded-tile bg-surface-subtle px-[1.2rem] text-body text-text-muted">
            + Inactive chip
          </button>
        </div>
      </section>
    </main>
  )
}

export default SwatchPage
