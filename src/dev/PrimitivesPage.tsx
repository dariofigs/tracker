// Primitives page (checklist Phase 3). Every UI primitive gets a section here in all its states,
// the same way SwatchPage keeps the design tokens.
import type { ReactNode } from 'react'
import { Card, SectionHeader, StatusChip } from '../components/ui'

function Demo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-[1.2rem]">
      <h2 className="text-section">{title}</h2>
      {children}
    </section>
  )
}

function PrimitivesPage() {
  return (
    <main className="text-text-primary mx-auto min-h-dvh max-w-[120rem] space-y-[2.4rem] p-[1.6rem] pt-[7.2rem] md:p-[3.2rem] md:pt-[8rem]">
      <header>
        <h1 className="text-screen">UI primitives</h1>
        <p className="text-body text-text-muted">
          Every primitive in every state, checklist Phase 3
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-[2.4rem] md:grid-cols-2 lg:grid-cols-3">
        <Demo title="Status Chip">
          <Card className="flex flex-wrap gap-[1.2rem]">
            <StatusChip status="balanced" />
            <StatusChip status="low-battery" />
            <StatusChip status="due" />
            <StatusChip status="flare" />
          </Card>
        </Demo>

        <Demo title="Section Header">
          <Card className="space-y-[1.2rem]">
            <SectionHeader title="Title only" />
            <SectionHeader
              title="With status"
              trailing={<StatusChip status="balanced" />}
            />
            <SectionHeader title="Sub-heading (h3)" level={3} />
          </Card>
        </Demo>

        <Demo title="Card">
          <Card>
            <p className="text-body text-text-muted">Default card</p>
          </Card>
        </Demo>
      </div>
    </main>
  )
}

export default PrimitivesPage
