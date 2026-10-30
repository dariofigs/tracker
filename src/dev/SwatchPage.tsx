// Swatch page (checklist 0.5). Kept as a permanent reference for the design tokens.

const colors = [
  { name: 'canvas-bg', hex: '#FBF9F5', className: 'bg-canvas-bg' },
  { name: 'surface-card', hex: '#FFFFFF', className: 'bg-surface-card' },
  { name: 'surface-subtle', hex: '#F3EFEA', className: 'bg-surface-subtle' },
  { name: 'border-subtle', hex: '#EBE5DC', className: 'bg-border-subtle' },
  { name: 'brand-sage', hex: '#2D5A46', className: 'bg-brand-sage' },
  { name: 'sage-tint', hex: '#E8F2EC', className: 'bg-sage-tint' },
  { name: 'accent-clay', hex: '#C47151', className: 'bg-accent-clay' },
  { name: 'clay-text', hex: '#A85A3C', className: 'bg-clay-text' },
  { name: 'clay-tint', hex: '#FDF1ED', className: 'bg-clay-tint' },
  { name: 'flare-plum', hex: '#8C3B4E', className: 'bg-flare-plum' },
  { name: 'plum-tint', hex: '#FBECEF', className: 'bg-plum-tint' },
  { name: 'amber-pacing', hex: '#D97706', className: 'bg-amber-pacing' },
  { name: 'text-primary', hex: '#1E2220', className: 'bg-text-primary' },
  { name: 'text-muted', hex: '#736B63', className: 'bg-text-muted' },
]

const typeScale = [
  { name: 'screen · 36px · Fraunces 600', className: 'text-screen font-display' },
  { name: 'section · 24px · Fraunces 600', className: 'text-section font-display' },
  { name: 'title · 18px · DM Sans 600', className: 'text-title font-semibold' },
  { name: 'body · 16px · DM Sans 450 (also form fields)', className: 'text-body' },
  { name: 'caption · 14px · DM Sans 450', className: 'text-caption' },
  { name: 'micro · 12px · DM Sans 500', className: 'text-micro font-medium' },
  {
    name: 'metric · 36px · DM Sans 600',
    className: 'text-metric font-semibold tabular-nums',
  },
]

const radii = [
  { name: 'tile · 16px', className: 'rounded-tile' },
  { name: 'card · 20px', className: 'rounded-card' },
  { name: 'sheet · 24px', className: 'rounded-sheet' },
]

function SwatchPage() {
  return (
    <main className="text-text-primary mx-auto min-h-dvh max-w-[120rem] space-y-[2.4rem] p-[1.6rem] pt-[7.2rem] md:p-[3.2rem] md:pt-[8rem]">
      <header>
        <h1 className="text-screen">Botanical Sanctuary</h1>
        <p className="text-body text-text-muted">Swatch page, checklist 0.5</p>
      </header>

      <section className="space-y-[1.2rem]">
        <h2 className="text-section">Color tokens</h2>
        <ul className="grid grid-cols-2 gap-[1.2rem] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {colors.map((c) => (
            <li
              key={c.name}
              className="rounded-card border-border-subtle bg-surface-card border p-[1.2rem]"
            >
              <div
                className={`rounded-tile border-border-subtle h-[4.8rem] border ${c.className}`}
              />
              <p className="text-caption mt-[0.8rem] font-semibold">{c.name}</p>
              <p className="text-micro text-text-muted">{c.hex}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-[1.2rem]">
        <h2 className="text-section">Type scale</h2>
        <div className="rounded-card border-border-subtle bg-surface-card space-y-[1.2rem] border p-[2.4rem]">
          {typeScale.map((t) => (
            <div key={t.name}>
              <p className={t.className}>The quick brown fox</p>
              <p className="text-micro text-text-muted">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-[1.2rem]">
        <h2 className="text-section">Radii</h2>
        <div className="grid grid-cols-1 gap-[1.2rem] sm:grid-cols-3">
          {radii.map((r) => (
            <div
              key={r.name}
              className="rounded-card border-border-subtle bg-surface-card border p-[1.2rem]"
            >
              <div
                className={`border-border-subtle bg-sage-tint h-[8rem] border ${r.className}`}
              />
              <p className="text-micro text-text-muted mt-[0.8rem]">{r.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-[1.2rem]">
        <h2 className="text-section">48px min-touch</h2>
        <div className="flex gap-[1.2rem]">
          <button
            type="button"
            className="min-touch rounded-tile border-brand-sage bg-sage-tint text-body text-brand-sage border px-[1.2rem] font-semibold"
          >
            ✓ Active chip
          </button>
          <button
            type="button"
            className="min-touch rounded-tile bg-surface-subtle text-body text-text-muted px-[1.2rem]"
          >
            + Inactive chip
          </button>
        </div>
      </section>
    </main>
  )
}

export default SwatchPage
