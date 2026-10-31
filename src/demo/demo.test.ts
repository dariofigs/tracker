import { describe, expect, it } from 'vitest'
import { generateDemoEntries } from './demoData'
import { createMemoryRepository } from './memoryRepository'

const MORNING = new Date(2026, 9, 31, 8, 0)
const AFTERNOON = new Date(2026, 9, 31, 15, 0)

describe('generateDemoEntries', () => {
  it('is deterministic for a given day', () => {
    expect(generateDemoEntries(AFTERNOON)).toEqual(generateDemoEntries(AFTERNOON))
  })

  it('covers 120 days ending yesterday, plus this morning once the check-in has switched to PM', () => {
    const entries = generateDemoEntries(AFTERNOON)
    expect(entries.filter((e) => e.period === 'PM')).toHaveLength(120)
    expect(entries.at(-1)).toMatchObject({ entryDate: '2026-10-31', period: 'AM' })
    expect(entries.some((e) => e.entryDate === '2026-10-31' && e.period === 'PM')).toBe(false)
  })

  it('logs nothing for today before the switch time', () => {
    expect(generateDemoEntries(MORNING).some((e) => e.entryDate === '2026-10-31')).toBe(false)
  })

  it('keeps pain, capacity and stress in range and fills pain areas', () => {
    const entries = generateDemoEntries(AFTERNOON)
    for (const e of entries) {
      for (const v of [e.wakingPain, e.endPain, e.stress]) {
        if (v != null) expect(v >= 0 && v <= 10).toBe(true)
      }
      for (const v of [e.startingCapacity, e.remainingCapacity]) {
        if (v != null) expect(v >= 0 && v <= 100).toBe(true)
      }
    }
    expect(entries.some((e) => (e.painAreas?.length ?? 0) > 0)).toBe(true)
  })

  it('contains no seed marker', () => {
    expect(generateDemoEntries(AFTERNOON).some((e) => e.note === 'SEED DATA')).toBe(false)
  })
})

describe('createMemoryRepository', () => {
  it('merges a second save of the same day and period instead of duplicating', async () => {
    const repo = createMemoryRepository([], [])
    await repo.upsertEntry({ entryDate: '2026-10-30', period: 'AM', wakingPain: 4 })
    await repo.upsertEntry({ entryDate: '2026-10-30', period: 'AM', sleepHours: 7 })
    const day = await repo.getEntriesForDate('2026-10-30')
    expect(day).toHaveLength(1)
    expect(day[0]).toMatchObject({ wakingPain: 4, sleepHours: 7 })
  })

  it('returns ranges oldest first and deletes by id', async () => {
    const repo = createMemoryRepository([], [])
    await repo.upsertEntries([
      { entryDate: '2026-10-02', period: 'PM', endPain: 2 },
      { entryDate: '2026-10-01', period: 'AM', wakingPain: 1 },
    ])
    const range = await repo.getEntriesInRange('2026-10-01', '2026-10-31')
    expect(range.map((e) => e.entryDate)).toEqual(['2026-10-01', '2026-10-02'])
    await repo.deleteEntry(range[0].id)
    expect(await repo.getEarliestEntryDate()).toBe('2026-10-02')
  })

  it('hides and renames options', async () => {
    const repo = createMemoryRepository([], [])
    const added = await repo.addCustomOption('symptom', ' Dizzy ')
    expect(added.label).toBe('Dizzy')
    await repo.updateCustomOption(added.id, { hidden: true, label: 'Dizziness' })
    expect(await repo.listCustomOptions('symptom')).toEqual([
      expect.objectContaining({ label: 'Dizziness', hidden: true }),
    ])
  })

  it('starts from the demo story, separate for each instance', async () => {
    const a = createMemoryRepository(generateDemoEntries(AFTERNOON))
    const b = createMemoryRepository(generateDemoEntries(AFTERNOON))
    await a.deleteEntry((await a.getAllEntries())[0].id)
    expect((await b.getAllEntries()).length).toBeGreaterThan((await a.getAllEntries()).length)
  })
})
