// Feature components (checklist Phase 4 onward). Every component built from a feature folder gets a
// section here in all its states; the shared primitives live on PrimitivesPage.
import { useState, type ReactNode } from 'react'
import OfflineBanner from '../components/OfflineBanner'
import StartupScreen from '../components/StartupScreen'
import { Button, Card, SectionHeader } from '../components/ui'
import type { Entry, EntryInput } from '../data/types'
import { generateSeed } from './seedData'
import { findInsights } from '../features/insights/engine/insights'
import DayDetailSheet from '../features/insights/DayDetailSheet'
import FlareDistributionCard from '../features/insights/FlareDistributionCard'
import MonthSummaryCard from '../features/insights/MonthSummaryCard'
import NotableDaysCard from '../features/insights/NotableDaysCard'
import InsightCard from '../features/insights/InsightCard'
import LagCurveCard from '../features/insights/LagCurveCard'
import MonthGrid from '../features/insights/MonthGrid'
import ScatterCard from '../features/insights/ScatterCard'
import {
  lagSeries,
  sleepPainPoints,
  stressPainPoints,
  weeklyDistribution,
} from '../features/insights/trends'
import CapacityPicker from '../features/checkin/CapacityPicker'
import EveningForm from '../features/checkin/EveningForm'
import MorningForm from '../features/checkin/MorningForm'
import CustomChipAdder from '../features/checkin/CustomChipAdder'
import NoteField from '../features/checkin/NoteField'
import { DEFAULT_OPTIONS } from '../features/checkin/options'
import AccountSection from '../features/settings/AccountSection'
import CredentialForm, {
  type CredentialStatus,
} from '../features/settings/CredentialForm'
import ImportPreview, {
  type ImportStage,
} from '../features/settings/backup/ImportPreview'
import type { ImportPlan } from '../features/settings/backup/importPlan'
import OptionsList from '../features/settings/OptionsList'
import { buildOptionRows } from '../features/settings/optionsModel'
import RenameSheet, { type RenameStage } from '../features/settings/RenameSheet'
import ThemeSetting from '../features/settings/ThemeSetting'
import WeatherSetting from '../features/settings/WeatherSetting'
import TimeSetting from '../features/settings/TimeSetting'
import type { ThemeMode } from '../lib/preferences'
import BackupReminder from '../features/today/BackupReminder'
import {
  defaultsFrom,
  emptyForm,
  formFromEntry,
  type CheckinForm,
} from '../features/checkin/formModel'
import RecentDaysCard from '../features/today/RecentDaysCard'
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
      <p className="text-micro text-text-muted">{label}</p>
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

function MorningDemo({ initial }: { initial: CheckinForm }) {
  const [form, setForm] = useState(initial)
  return (
    <MorningForm
      form={form}
      onChange={(c) => setForm((f) => ({ ...f, ...c }))}
      options={DEFAULT_OPTIONS}
      onAddOption={() => {}}
    />
  )
}

function EveningDemo({ initial }: { initial: CheckinForm }) {
  const [form, setForm] = useState(initial)
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  return (
    <EveningForm
      form={form}
      options={options}
      onAddOption={(kind, label) =>
        setOptions((o) => ({ ...o, [kind]: [...o[kind], label] }))
      }
      onChange={(c) => setForm((f) => ({ ...f, ...c }))}
    />
  )
}

function CapacityDemo({ initial }: { initial: number | null }) {
  const [value, setValue] = useState(initial)
  return <CapacityPicker label="Capacity" value={value} onChange={setValue} />
}

function NoteDemo({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  return <NoteField value={value} onChange={setValue} />
}

const filledEvening: Entry = {
  ...base,
  period: 'PM',
  endPain: 6,
  stress: 4,
  remainingCapacity: 25,
  painAreas: ['Lower back', 'Hips'],
  activities: ['Walk', 'Pool therapy'],
  symptoms: ['Fatigue', 'Brain fog'],
  note: 'Pushed it at the pool.',
}

const DEMO_END = '2026-10-28'
const DEMO_FROM = '2026-09-29'
const demoInputs: EntryInput[] = generateSeed(DEMO_END, 60)
const demoEntries: Entry[] = demoInputs.map((e, i) => ({
  ...base,
  ...e,
  id: `demo-${i}`,
  note: null,
}))
const octoberEntries = demoEntries.filter((e) => e.entryDate.startsWith('2026-10'))
const zeroPainEntries: Entry[] = [
  { ...base, id: 'z1', entryDate: '2026-10-12', period: 'AM', wakingPain: 0 },
  { ...base, id: 'z2', entryDate: '2026-10-13', period: 'PM', endPain: 0 },
]

function DayDetailDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open day sheet
      </Button>
      {open && (
        <DayDetailSheet
          day="2026-10-28"
          entries={demoEntries.filter((e) => e.entryDate === '2026-10-28')}
          onClose={() => setOpen(false)}
          onEdit={() => setOpen(false)}
          onDeleted={() => setOpen(false)}
        />
      )}
    </>
  )
}

const demoOptionRows = buildOptionRows('activity', [
  { id: 'c1', kind: 'activity', label: 'Pool', hidden: false, createdAt: '' },
  { id: 'c2', kind: 'activity', label: 'Rest', hidden: true, createdAt: '' },
])

// Local state only: the gallery cards must not change the theme of the whole page.
function ThemeSettingCard({ initial }: { initial: ThemeMode }) {
  const [state, setState] = useState({
    theme: initial,
    darkFrom: '19:00',
    lightFrom: '07:00',
  })
  return (
    <Card className="flex flex-col gap-[1.6rem]">
      <SectionHeader title="Appearance" />
      <ThemeSetting
        {...state}
        onChange={(changes) => setState((s) => ({ ...s, ...changes }))}
      />
    </Card>
  )
}

// Local state only: the gallery must not ask for location or change the real setting.
function WeatherSettingCard({ initial, refuse = false }: { initial: boolean; refuse?: boolean }) {
  const [enabled, setEnabled] = useState(initial)
  return (
    <Card className="flex flex-col gap-[1.6rem]">
      <SectionHeader title="Weather" />
      <WeatherSetting
        enabled={enabled}
        onChange={(next) => {
          if (next && refuse) return false
          setEnabled(next)
          return true
        }}
      />
    </Card>
  )
}

function TimeSettingDemo({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  return <TimeSetting value={value} onChange={setValue} />
}

function RenameDemo({ stage, label }: { stage: RenameStage; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open && (
        <RenameSheet
          kind="activity"
          row={demoOptionRows[0]}
          rows={demoOptionRows}
          stage={stage}
          onClose={() => setOpen(false)}
          onReview={() => {}}
          onConfirm={() => {}}
        />
      )}
    </>
  )
}

const emptyGroup = { added: [], unchanged: [], changed: [] }
const demoPlan: ImportPlan = {
  entries: {
    added: demoEntries.slice(0, 4),
    unchanged: demoEntries.slice(4, 30),
    changed: [
      { incoming: demoEntries[30], existing: { ...demoEntries[30], note: 'edited' } },
      { incoming: demoEntries[31], existing: { ...demoEntries[31], note: 'edited' } },
    ],
  },
  timedLogs: emptyGroup,
  options: { added: [], hiddenChanged: [] },
  morningCutoff: '',
}
const samePlan: ImportPlan = {
  ...demoPlan,
  entries: { added: [], unchanged: demoEntries.slice(0, 30), changed: [] },
}

function ImportDemo({
  plan,
  stage,
  label,
}: {
  plan: ImportPlan
  stage: ImportStage
  label: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open && (
        <ImportPreview
          plan={plan}
          stage={stage}
          onClose={() => setOpen(false)}
          onImport={() => {}}
          onRetry={() => {}}
        />
      )}
    </>
  )
}

function CredentialDemo({
  kind,
  status,
}: {
  kind: 'email' | 'password'
  status: CredentialStatus
}) {
  return <CredentialForm kind={kind} status={status} onSubmit={() => {}} />
}

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
          <Variant label="Afternoon">
            <TodayHeader now={new Date(2026, 9, 29, 14)} />
          </Variant>
          <Variant label="Evening">
            <TodayHeader now={new Date(2026, 9, 29, 19)} />
          </Variant>
        </Demo>

        <Demo title="Offline banner">
          <Variant label="Offline">
            <OfflineBanner offline />
          </Variant>
          <Variant label="Online (renders nothing)">
            <OfflineBanner offline={false} />
          </Variant>
        </Demo>

        <Demo title="Startup screen">
          <Variant label="Loading">
            <div className="h-[16rem] overflow-hidden">
              <StartupScreen state="loading" />
            </div>
          </Variant>
          <Variant label="Database unreachable">
            <StartupScreen
              state="error"
              title="Couldn’t reach your data"
              message="Check your connection. If you haven’t used the app for a week, the free database may be paused: restart it from the Supabase dashboard."
              onRetry={noop}
            />
          </Variant>
          <Variant label="Not configured">
            <StartupScreen
              state="error"
              title="App isn’t configured"
              message="The Supabase URL or key is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild."
            />
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

        <Demo title="Morning form">
          <Variant label="New, no history (pain and quality unset)">
            <MorningDemo initial={defaultsFrom(null, 'AM')} />
          </Variant>
          <Variant label="New, sleep carried from last morning">
            <MorningDemo
              initial={defaultsFrom(
                { ...morning, sleepHours: 6.5, sleepQuality: 2 },
                'AM',
              )}
            />
          </Variant>
          <Variant label="Pain above 0 asks where it hurts">
            <MorningDemo
              initial={{
                ...defaultsFrom(null, 'AM'),
                wakingPain: 4,
                painAreas: ['Knees'],
              }}
            />
          </Variant>
          <Variant label="Editing a saved entry">
            <MorningDemo
              initial={formFromEntry({ ...morning, sleepHours: 8, sleepQuality: 4 })}
            />
          </Variant>
        </Demo>

        <Demo title="Evening form">
          <Variant label="New (all unset)">
            <EveningDemo initial={emptyForm()} />
          </Variant>
          <Variant label="Editing a saved entry with a custom chip">
            <EveningDemo initial={formFromEntry(filledEvening)} />
          </Variant>
        </Demo>

        <Demo title="Capacity picker">
          <Variant label="Unset">
            <CapacityDemo initial={null} />
          </Variant>
          <Variant label="Preset">
            <CapacityDemo initial={50} />
          </Variant>
          <Variant label="Saved value that isn't a preset">
            <CapacityDemo initial={60} />
          </Variant>
        </Demo>

        <Demo title="Add-new chip">
          <Variant label="Tap + Add new to type a name (Enter or Add)">
            <div className="flex flex-wrap gap-[0.8rem]">
              <CustomChipAdder noun="activity" onAdd={noop} />
            </div>
          </Variant>
        </Demo>

        <Demo title="Note field">
          <Variant label="Collapsed">
            <NoteDemo initial="" />
          </Variant>
          <Variant label="Open with text">
            <NoteDemo initial="Slept badly, woke twice." />
          </Variant>
        </Demo>

        <Demo title="Recent days card">
          <Variant label="Mid-week (Fri Oct 30), 3-day streak, a flare evening (clay), missed days">
            <RecentDaysCard
              today="2026-10-30"
              streak={3}
              entries={[
                { ...morning, entryDate: '2026-10-29' },
                { ...evening, entryDate: '2026-10-29' },
                { ...morning, entryDate: '2026-10-28' },
                { ...morning, entryDate: '2026-10-27' },
                { ...evening, entryDate: '2026-10-27', endPain: 8 },
                { ...morning, entryDate: '2026-10-30' },
              ]}
            />
          </Variant>
          <Variant label="Start of the week, no streak">
            <RecentDaysCard today="2026-10-25" streak={0} entries={[]} />
          </Variant>
          <Variant label="Last day of the week, one-day streak">
            <RecentDaysCard
              today="2026-10-31"
              streak={1}
              entries={[{ ...evening, entryDate: '2026-10-31' }]}
            />
          </Variant>
        </Demo>

        <Demo title="Insight card">
          <Variant label="Not enough days yet">
            <InsightCard result={{ status: 'needs-more-days', have: 6, need: 10 }} />
          </Variant>
          <Variant label="Enough days, nothing stands out">
            <InsightCard result={{ status: 'ready', have: 40, insights: [] }} />
          </Variant>
          <Variant label="Patterns found (90 days of seed data)">
            <InsightCard result={findInsights(generateSeed(DEMO_END, 90))} />
          </Variant>
        </Demo>

        <Demo title="Exertion and next-morning pain">
          <Variant label="30 days">
            <LagCurveCard series={lagSeries(demoInputs, DEMO_FROM, DEMO_END)} />
          </Variant>
          <Variant label="Nothing logged">
            <LagCurveCard series={lagSeries([], '2026-10-22', DEMO_END)} />
          </Variant>
        </Demo>

        <Demo title="Scatter chart (sleep, stress)">
          <Variant label="Sleep and morning pain">
            <ScatterCard
              title="Sleep and morning pain"
              xLabel="hours slept"
              yLabel="waking pain"
              xDomain={[3, 10]}
              points={sleepPainPoints(demoInputs, DEMO_FROM, DEMO_END)}
            />
          </Variant>
          <Variant label="Stress and next-morning pain">
            <ScatterCard
              title="Stress and next-morning pain"
              xLabel="evening stress"
              yLabel="next morning's pain"
              xDomain={[0, 10]}
              points={stressPainPoints(demoInputs, DEMO_FROM, DEMO_END)}
            />
          </Variant>
          <Variant label="Empty">
            <ScatterCard
              title="Sleep and morning pain"
              xLabel="hours slept"
              yLabel="waking pain"
              xDomain={[3, 10]}
              points={[]}
            />
          </Variant>
        </Demo>

        <Demo title="Flare distribution card">
          <Variant label="Five weeks">
            <FlareDistributionCard
              weeks={weeklyDistribution(demoInputs, DEMO_FROM, DEMO_END)}
            />
          </Variant>
          <Variant label="Nothing logged">
            <FlareDistributionCard weeks={[]} />
          </Variant>
        </Demo>

        <Demo title="Month grid">
          <Variant label="October, fully logged (today is the 29th)">
            <MonthGrid
              monthStart="2026-10-01"
              entries={octoberEntries}
              today="2026-10-29"
              onSelect={noop}
            />
          </Variant>
          <Variant label="Empty month">
            <MonthGrid
              monthStart="2026-09-01"
              entries={[]}
              today="2026-10-29"
              onSelect={noop}
            />
          </Variant>
        </Demo>

        <Demo title="Month summary card">
          <Variant label="October, fully logged">
            <MonthSummaryCard monthName="October" entries={octoberEntries} />
          </Variant>
          <Variant label="Nothing rated">
            <MonthSummaryCard monthName="September" entries={[]} />
          </Variant>
        </Demo>

        <Demo title="Notable days card">
          <Variant label="October, fully logged">
            <NotableDaysCard entries={octoberEntries} onSelect={noop} />
          </Variant>
          <Variant label="One day only (no lowest day)">
            <NotableDaysCard entries={octoberEntries.slice(0, 1)} onSelect={noop} />
          </Variant>
          <Variant label="Nothing notable (no pain above zero)">
            <NotableDaysCard
              entries={zeroPainEntries}
              onSelect={noop}
              monthName="October"
            />
          </Variant>
        </Demo>

        <Demo title="Day detail sheet">
          <Variant label="Entries with edit and delete (delete asks to confirm)">
            <DayDetailDemo />
          </Variant>
        </Demo>

        <Demo title="Check-in switch time">
          <Variant label="Default (noon)">
            <Card className="flex flex-col gap-[1.6rem]">
              <SectionHeader title="Check-in" />
              <TimeSettingDemo initial="12:00" />
            </Card>
          </Variant>
          <Variant label="Changed (shows reset; card padding as in Settings)">
            <Card className="flex flex-col gap-[1.6rem]">
              <SectionHeader title="Check-in" />
              <TimeSettingDemo initial="19:00" />
            </Card>
          </Variant>
        </Demo>

        <Demo title="Appearance setting">
          <Variant label="Same as device (default)">
            <ThemeSettingCard initial="system" />
          </Variant>
          <Variant label="Light">
            <ThemeSettingCard initial="light" />
          </Variant>
          <Variant label="Dark">
            <ThemeSettingCard initial="dark" />
          </Variant>
          <Variant label="Day and night (shows the two switch times)">
            <ThemeSettingCard initial="schedule" />
          </Variant>
        </Demo>

        <Demo title="Weather setting">
          <Variant label="Off (default)">
            <WeatherSettingCard initial={false} />
          </Variant>
          <Variant label="On">
            <WeatherSettingCard initial />
          </Variant>
          <Variant label="Location blocked (turning on is refused)">
            <WeatherSettingCard initial={false} refuse />
          </Variant>
        </Demo>

        <Demo title="Options list">
          <Variant label="Custom, built-in and hidden (try Add with no text)">
            <OptionsList
              kind="activity"
              rows={demoOptionRows}
              onAdd={noop}
              onRename={noop}
              onToggleHidden={noop}
            />
          </Variant>
          <Variant label="Every option hidden (no divider)">
            <OptionsList
              kind="activity"
              rows={buildOptionRows(
                'activity',
                ['Walk', 'Stretch'].map((label, i) => ({
                  id: `h${i}`,
                  kind: 'activity' as const,
                  label,
                  hidden: true,
                  createdAt: '',
                })),
              ).filter((r) => r.hidden)}
              onAdd={noop}
              onRename={noop}
              onToggleHidden={noop}
            />
          </Variant>
          <Variant label="Saving (buttons disabled)">
            <OptionsList
              kind="symptom"
              rows={buildOptionRows('symptom', [])}
              busy
              onAdd={noop}
              onRename={noop}
              onToggleHidden={noop}
            />
          </Variant>
        </Demo>

        <Demo title="Rename sheet">
          <Variant label="Edit">
            <RenameDemo label="Open: edit" stage={{ step: 'edit' }} />
          </Variant>
          <Variant label="Checking history">
            <RenameDemo label="Open: checking" stage={{ step: 'checking' }} />
          </Variant>
          <Variant label="Confirm">
            <RenameDemo
              label="Open: confirm"
              stage={{ step: 'confirm', entries: 12, timedLogs: 2 }}
            />
          </Variant>
          <Variant label="Confirm, nothing uses it">
            <RenameDemo
              label="Open: unused"
              stage={{ step: 'confirm', entries: 0, timedLogs: 0 }}
            />
          </Variant>
          <Variant label="Updating">
            <RenameDemo
              label="Open: working"
              stage={{ step: 'working', done: 5, total: 12 }}
            />
          </Variant>
          <Variant label="Error">
            <RenameDemo
              label="Open: error"
              stage={{ step: 'error', message: 'Stopped part-way. Nothing is lost.' }}
            />
          </Variant>
        </Demo>

        <Demo title="Import preview">
          <Variant label="New, same and different">
            <ImportDemo
              label="Open: preview"
              plan={demoPlan}
              stage={{ step: 'preview' }}
            />
          </Variant>
          <Variant label="Nothing to import">
            <ImportDemo
              label="Open: all same"
              plan={samePlan}
              stage={{ step: 'preview' }}
            />
          </Variant>
          <Variant label="Saving">
            <ImportDemo
              label="Open: saving"
              plan={demoPlan}
              stage={{ step: 'working', done: 12, total: 30 }}
            />
          </Variant>
          <Variant label="Done">
            <ImportDemo
              label="Open: done"
              plan={demoPlan}
              stage={{ step: 'done', saved: 30 }}
            />
          </Variant>
          <Variant label="Error">
            <ImportDemo
              label="Open: error"
              plan={demoPlan}
              stage={{ step: 'error', message: 'Stopped part-way. Nothing is lost.' }}
            />
          </Variant>
        </Demo>

        <Demo title="Backup reminder">
          <Variant label="Never backed up">
            <BackupReminder days={42} neverBackedUp onSnooze={noop} />
          </Variant>
          <Variant label="Overdue">
            <BackupReminder days={35} neverBackedUp={false} onSnooze={noop} />
          </Variant>
        </Demo>

        <Demo title="Change email and password">
          <Variant label="Email, idle">
            <CredentialDemo kind="email" status={{ state: 'idle' }} />
          </Variant>
          <Variant label="Email, saved">
            <CredentialDemo
              kind="email"
              status={{
                state: 'done',
                message: 'Check both inboxes and open the confirmation links.',
              }}
            />
          </Variant>
          <Variant label="Password, saving">
            <CredentialDemo kind="password" status={{ state: 'saving' }} />
          </Variant>
          <Variant label="Password, error">
            <CredentialDemo
              kind="password"
              status={{
                state: 'error',
                message: 'Could not change the password. Try a different one.',
              }}
            />
          </Variant>
        </Demo>

        <Demo title="Account section">
          <Variant label="Idle">
            <Card className="flex flex-col gap-[1.6rem]">
              <SectionHeader title="Account" />
              <AccountSection
                emailStatus={{ state: 'idle' }}
                passwordStatus={{ state: 'idle' }}
                onChangeEmail={noop}
                onChangePassword={noop}
                onSignOut={noop}
              />
            </Card>
          </Variant>
          <Variant label="Saving, error and done messages">
            <Card className="flex flex-col gap-[1.6rem]">
              <SectionHeader title="Account" />
              <AccountSection
                emailStatus={{
                  state: 'done',
                  message: 'Check both inboxes and open the confirmation links.',
                }}
                passwordStatus={{
                  state: 'error',
                  message: 'Could not change the password. Try a different one.',
                }}
                onChangeEmail={noop}
                onChangePassword={noop}
                onSignOut={noop}
              />
            </Card>
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
