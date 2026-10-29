// Feature components (checklist Phase 4 onward). Every component built from a feature folder gets a
// section here in all its states; the shared primitives live on PrimitivesPage.
import type { ReactNode } from 'react'
import type { Entry } from '../data/types'
import CadenceCard from '../features/today/CadenceCard'
import BatteryCard from '../features/today/BatteryCard'
import InsightBanner from '../features/today/InsightBanner'
import LoadErrorCard from '../features/today/LoadErrorCard'
import LoadingCards from '../features/today/LoadingCards'
import SaveStatusLine from '../features/today/SaveStatusLine'
import TodayHeader from '../features/today/TodayHeader'

function Demo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-[1.2rem]">
      <h2 className="text-section">{title}</h2>
      {children}
    </section>
  )
}

function Variant({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-[0.8rem]">
      <p className="text-micro text-text-muted uppercase">{label}</p>
      {children}
    </div>
  )
}

const base = {
  id: 'demo',
  entryDate: '2026-10-29',
  note: null,
  createdAt: '2026-10-29T13:00:00Z',
  updatedAt: '2026-10-29T13:00:00Z',
}
const morning: Entry = { ...base, period: 'AM', wakingPain: 3, startingCapacity: 70 }
const evening: Entry = { ...base, period: 'PM', endPain: 5, remainingCapacity: 25 }

function ComponentsPage() {
  const noop = () => {}

  return (
    <main className="text-text-primary mx-auto min-h-dvh max-w-[120rem] space-y-[2.4rem] p-[1.6rem] pt-[7.2rem] md:p-[3.2rem] md:pt-[8rem]">
      <header>
        <h1 className="text-screen">Components</h1>
        <p className="text-body text-text-muted">
          Feature components in every state. Add each new one here as it is built.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-[2.4rem] md:grid-cols-2 lg:grid-cols-3">
        <Demo title="Today header">
          <Variant label="Morning">
            <TodayHeader now={new Date(2026, 9, 29, 8)} />
          </Variant>
          <Variant label="Evening">
            <TodayHeader now={new Date(2026, 9, 29, 19)} />
          </Variant>
        </Demo>

        <Demo title="Cadence card">
          <Variant label="Nothing logged, morning">
            <CadenceCard morning={null} evening={null} currentPeriod="AM" onOpen={noop} />
          </Variant>
          <Variant label="Nothing logged, evening">
            <CadenceCard morning={null} evening={null} currentPeriod="PM" onOpen={noop} />
          </Variant>
          <Variant label="Morning only, evening due">
            <CadenceCard
              morning={morning}
              evening={null}
              currentPeriod="PM"
              onOpen={noop}
            />
          </Variant>
          <Variant label="Both done">
            <CadenceCard
              morning={morning}
              evening={evening}
              currentPeriod="PM"
              onOpen={noop}
            />
          </Variant>
        </Demo>

        <Demo title="Battery card">
          <Variant label="Empty">
            <BatteryCard reading={null} />
          </Variant>
          <Variant label="Morning reading">
            <BatteryCard reading={{ value: 70, source: 'morning' }} />
          </Variant>
          <Variant label="Evening reading, low">
            <BatteryCard reading={{ value: 25, source: 'evening' }} />
          </Variant>
        </Demo>

        <Demo title="Insight banner">
          <Variant label="With an insight">
            <InsightBanner
              insight={{
                text: 'Gentle walks tend to come before calmer mornings in your log.',
              }}
            />
          </Variant>
          <Variant label="No insight (renders nothing)">
            <InsightBanner insight={null} />
          </Variant>
        </Demo>

        <Demo title="Save status line">
          <Variant label="Saving">
            <SaveStatusLine status={{ state: 'saving', pending: 1, failed: 0 }} />
          </Variant>
          <Variant label="Not saved yet">
            <SaveStatusLine status={{ state: 'not_saved', pending: 2, failed: 0 }} />
          </Variant>
          <Variant label="Needs attention">
            <SaveStatusLine
              status={{ state: 'needs_attention', pending: 0, failed: 1 }}
            />
          </Variant>
          <Variant label="Signed out">
            <SaveStatusLine status={{ state: 'paused', pending: 1, failed: 0 }} />
          </Variant>
        </Demo>

        <Demo title="Load states">
          <Variant label="Loading">
            <LoadingCards />
          </Variant>
          <Variant label="Load error">
            <LoadErrorCard onRetry={noop} />
          </Variant>
        </Demo>
      </div>
    </main>
  )
}

export default ComponentsPage
