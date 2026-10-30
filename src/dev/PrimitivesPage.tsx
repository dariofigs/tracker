// Primitives page (checklist Phase 3). Every UI primitive gets a section here in all its states,
// the same way SwatchPage keeps the design tokens.
import { useState, type ReactNode } from 'react'
import {
  BatteryBar,
  SegmentedControl,
  ScrollTabs,
  Stepper,
  BottomNav,
  ICON_NAMES,
  Icon,
  BottomSheet,
  Button,
  Card,
  PainGauge,
  PillChip,
  SectionHeader,
  StatusChip,
} from '../components/ui'

function Demo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-[1.2rem]">
      <h2 className="text-section">{title}</h2>
      {children}
    </section>
  )
}

function ChipDemo() {
  const [on, setOn] = useState(false)
  return (
    <div className="flex flex-wrap gap-[1.2rem]">
      <PillChip label="Inactive" selected={false} onChange={() => {}} />
      <PillChip label="Active" selected onChange={() => {}} />
      <PillChip label="Tap me" selected={on} onChange={setOn} />
    </div>
  )
}

function GaugeDemo({
  label,
  initial,
  rangeLabels,
}: {
  label: string
  initial: number
  rangeLabels?: string[]
}) {
  const [v, setV] = useState(initial)
  return <PainGauge label={label} value={v} onChange={setV} rangeLabels={rangeLabels} />
}

function SheetDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open sheet
      </Button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Evening check-in">
        <div className="space-y-[1.6rem]">
          <GaugeDemo label="Pain" initial={3} />
          <p className="text-body text-text-muted">
            Swipe the handle down, tap outside or press Escape to close.
          </p>
          <p className="text-body text-text-muted">
            Extra content to check that the body scrolls on short screens.
          </p>
          <Button fullWidth onClick={() => setOpen(false)}>
            Save Entry
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}

const navItems = [
  { id: 'today', label: 'Today', icon: 'today' as const },
  { id: 'insights', label: 'Insights', icon: 'insights' as const },
  { id: 'settings', label: 'Settings', icon: 'settings' as const },
]

function NavDemo() {
  const [tab, setTab] = useState('today')
  return <BottomNav items={navItems} value={tab} onChange={setTab} />
}

const qualityOptions = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))
const effortOptions = [
  { value: 1, label: 'Light' },
  { value: 2, label: 'Easy' },
  { value: 3, label: 'Mod' },
  { value: 4, label: 'Hard' },
  { value: 5, label: 'Max' },
]

const kindOptions = [
  { value: 'symptom', label: 'Symptoms' },
  { value: 'activity', label: 'Activities' },
  { value: 'exercise_type', label: 'Exercise' },
  { value: 'pain_area', label: 'Body' },
]

function CompactDemo() {
  const [kind, setKind] = useState('symptom')
  const [hours, setHours] = useState(7)
  const [quality, setQuality] = useState<number | null>(3)
  const [effort, setEffort] = useState<number | null>(null)
  return (
    <div className="space-y-[2rem]">
      <div className="space-y-[0.8rem]">
        <p className="text-micro text-text-muted">Sleep hours</p>
        <Stepper
          label="Sleep hours"
          value={hours}
          onChange={setHours}
          step={0.5}
          max={14}
          unit="h"
        />
      </div>
      <div className="space-y-[0.8rem]">
        <p className="text-micro text-text-muted">Sleep quality</p>
        <SegmentedControl
          label="Sleep quality"
          options={qualityOptions}
          value={quality}
          onChange={setQuality}
        />
      </div>
      <div className="space-y-[0.8rem]">
        <p className="text-micro text-text-muted">Effort (nothing selected)</p>
        <SegmentedControl
          label="Effort"
          options={effortOptions}
          value={effort}
          onChange={setEffort}
        />
      </div>
      <div className="space-y-[0.8rem]">
        <p className="text-micro text-text-muted">
          Scroll tabs (fades show more chips; Settings options)
        </p>
        <ScrollTabs
          label="Kind of option"
          options={kindOptions}
          value={kind}
          onChange={setKind}
        />
      </div>
    </div>
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

        <Demo title="Buttons">
          <Card className="space-y-[1.6rem]">
            <div className="flex flex-wrap gap-[1.2rem]">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button disabled>Disabled</Button>
              <Button variant="secondary" disabled>
                Disabled
              </Button>
              <Button variant="quiet">Quiet (Sign out)</Button>
            </div>
            <Button fullWidth>Save Entry</Button>
            <Button fullWidth variant="secondary">
              Cancel
            </Button>
          </Card>
        </Demo>

        <Demo title="Stepper and Segmented">
          <Card>
            <CompactDemo />
          </Card>
        </Demo>

        <Demo title="Bottom Nav">
          <Card className="bg-surface-subtle">
            <NavDemo />
          </Card>
        </Demo>

        <Demo title="Icons (Solar, CC BY 4.0 by 480 Design)">
          <Card className="space-y-[1.6rem]">
            {([false, true] as const).map((bold) => (
              <div key={String(bold)}>
                <p className="text-micro text-text-muted mb-[0.8rem]">
                  {bold ? 'Bold Duotone (active)' : 'Line Duotone'}
                </p>
                <div className="text-brand-sage flex flex-wrap gap-[1.6rem]">
                  {ICON_NAMES.map((name) => (
                    <span key={name} className="flex flex-col items-center gap-[0.4rem]">
                      <Icon name={name} bold={bold} size={28} />
                      <span className="text-micro text-text-muted">{name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </Demo>

        <Demo title="Bottom Sheet">
          <Card>
            <SheetDemo />
          </Card>
        </Demo>

        <Demo title="Battery Bar">
          <Card className="space-y-[1.6rem]">
            {[100, 65, 30, 10, 0].map((v) => (
              <div key={v} className="space-y-[0.8rem]">
                <p className="text-micro text-text-muted">{v}%</p>
                <BatteryBar value={v} label={`Capacity ${v}%`} />
              </div>
            ))}
          </Card>
        </Demo>

        <Demo title="Pain Gauge">
          <Card className="space-y-[2.4rem]">
            <GaugeDemo label="Pain" initial={0} />
            <GaugeDemo label="Pain" initial={4} />
            <GaugeDemo label="Pain" initial={10} />
            <GaugeDemo
              label="Stress"
              initial={6}
              rangeLabels={['0 Calm', '10 Overwhelmed']}
            />
          </Card>
        </Demo>

        <Demo title="Pill Chip">
          <Card className="space-y-[1.6rem]">
            <ChipDemo />
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
