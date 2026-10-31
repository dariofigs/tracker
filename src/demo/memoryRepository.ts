import type { Repository } from '../data/repository'
import { newId } from '../lib/ids'
import type { CustomOption, Entry, EntryInput, TimedLog } from '../data/types'
import { DEMO_CUSTOM_OPTIONS, generateDemoEntries } from './demoData'

const byDatePeriod = (a: Entry, b: Entry) =>
  a.entryDate.localeCompare(b.entryDate) || a.period.localeCompare(b.period)

function withoutUndefined<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)) as Partial<T>
}

/** The demo's data layer: same methods as the Supabase repository, but nothing leaves the page. */
export function createMemoryRepository(
  seed: EntryInput[] = generateDemoEntries(),
  seedOptions: Pick<CustomOption, 'kind' | 'label' | 'hidden'>[] = DEMO_CUSTOM_OPTIONS,
): Repository {
  const entries = new Map<string, Entry>()
  const timedLogs = new Map<string, TimedLog>()
  const options: CustomOption[] = []
  let morningCutoff: string | null = null
  let displayName: string | null = null
  let optionClock = 0

  const keyOf = (date: string, period: string) => `${date}|${period}`

  function upsertEntry(input: EntryInput): Entry {
    const key = keyOf(input.entryDate, input.period)
    const existing = entries.get(key)
    const now = new Date().toISOString()
    const saved: Entry = {
      id: existing?.id ?? newId(),
      wakingPain: null,
      sleepHours: null,
      sleepQuality: null,
      startingCapacity: null,
      endPain: null,
      exercise: null,
      activities: [],
      symptoms: [],
      painAreas: [],
      stress: null,
      remainingCapacity: null,
      note: null,
      createdAt: existing?.createdAt ?? now,
      ...existing,
      ...withoutUndefined(input),
      entryDate: input.entryDate,
      period: input.period,
      updatedAt: now,
    }
    entries.set(key, saved)
    return saved
  }

  function addOption(kind: CustomOption['kind'], label: string, hidden = false): CustomOption {
    // Ordered by a counter rather than the clock, so options added in one tick keep their order.
    const option: CustomOption = {
      id: newId(),
      kind,
      label: label.trim(),
      hidden,
      createdAt: new Date(Date.UTC(2000, 0, 1) + optionClock++).toISOString(),
    }
    options.push(option)
    return option
  }

  for (const input of seed) {
    const saved = upsertEntry(input)
    const at = new Date(`${input.entryDate}T${input.period === 'AM' ? '08' : '20'}:00:00`).toISOString()
    entries.set(keyOf(input.entryDate, input.period), { ...saved, createdAt: at, updatedAt: at })
  }
  for (const option of seedOptions) addOption(option.kind, option.label, option.hidden)

  const sorted = () => [...entries.values()].sort(byDatePeriod)

  const repository: Repository = {
    async getAllEntries() {
      return sorted()
    },
    async getEarliestEntryDate() {
      return sorted()[0]?.entryDate ?? null
    },
    async getMorningCutoff() {
      return morningCutoff
    },
    async setMorningCutoff(value) {
      morningCutoff = value
    },
    async getDisplayName() {
      return displayName
    },
    async setDisplayName(value) {
      displayName = value
    },
    async listAllTimedLogs() {
      return [...timedLogs.values()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    },
    async listAllCustomOptions() {
      return [...options]
    },
    async upsertEntry(input) {
      return upsertEntry(input)
    },
    async upsertEntries(inputs) {
      return inputs.map(upsertEntry)
    },
    async getEntriesForDate(date) {
      return sorted().filter((e) => e.entryDate === date)
    },
    async getEntriesInRange(from, to) {
      return sorted().filter((e) => e.entryDate >= from && e.entryDate <= to)
    },
    async deleteEntry(id) {
      for (const [key, entry] of entries) if (entry.id === id) entries.delete(key)
    },
    async addTimedLog(input) {
      return repository.upsertTimedLog(newId(), input)
    },
    async upsertTimedLog(id, input) {
      const existing = timedLogs.get(id)
      const saved: TimedLog = {
        occurredAt: input.occurredAt,
        kind: input.kind,
        pain: null,
        label: null,
        minutes: null,
        effort: null,
        note: null,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        ...existing,
        ...withoutUndefined(input),
        id,
      }
      timedLogs.set(id, saved)
      return saved
    },
    async listTimedLogs(from, to) {
      return [...timedLogs.values()]
        .filter((l) => l.occurredAt >= from.toISOString() && l.occurredAt < to.toISOString())
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    },
    async updateTimedLog(id, changes) {
      const existing = timedLogs.get(id)
      if (!existing) throw new Error('Timed log not found')
      const saved = { ...existing, ...withoutUndefined(changes) }
      timedLogs.set(id, saved)
      return saved
    },
    async deleteTimedLog(id) {
      timedLogs.delete(id)
    },
    async listCustomOptions(kind) {
      return options.filter((o) => o.kind === kind)
    },
    async addCustomOption(kind, label, hidden = false) {
      return addOption(kind, label, hidden)
    },
    async updateCustomOption(id, changes) {
      const index = options.findIndex((o) => o.id === id)
      if (index < 0) throw new Error('Option not found')
      options[index] = {
        ...options[index],
        ...(changes.label !== undefined && { label: changes.label.trim() }),
        ...(changes.hidden !== undefined && { hidden: changes.hidden }),
      }
      return options[index]
    },
  }
  return repository
}
