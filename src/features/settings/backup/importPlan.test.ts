import { describe, expect, it, vi } from 'vitest'
import type { CustomOption, Entry, TimedLog } from '../../../data/types'
import { backupToJson, buildBackup } from './backupFile'
import { applyImport, parseBackup, planImport, planIsEmpty } from './importPlan'

const am: Entry = {
  id: 'a',
  entryDate: '2026-10-01',
  period: 'AM',
  wakingPain: 4,
  sleepHours: 6.5,
  sleepQuality: 3,
  startingCapacity: 70,
  note: null,
  createdAt: '2026-10-01T07:00:00Z',
  updatedAt: '2026-10-01T07:00:00Z',
}
const pm: Entry = {
  id: 'b',
  entryDate: '2026-10-01',
  period: 'PM',
  endPain: 6,
  exercise: { type: 'Walk', minutes: 20, effort: 2 },
  activities: ['Walk'],
  symptoms: ['Fatigue'],
  painAreas: ['Neck'],
  stress: 5,
  remainingCapacity: 30,
  note: 'Long day',
  createdAt: '2026-10-01T20:00:00Z',
  updatedAt: '2026-10-01T20:00:00Z',
}
const option: CustomOption = {
  id: 'o1',
  kind: 'activity',
  label: 'Pool',
  hidden: false,
  createdAt: '',
}
const log: TimedLog = {
  id: 't1',
  occurredAt: '2026-10-01T13:00:00.000Z',
  kind: 'pain',
  pain: 7,
  label: null,
  minutes: null,
  effort: null,
  note: null,
  createdAt: '',
}

const saved = { entries: [am, pm], customOptions: [option], timedLogs: [log] }

function fileFor(data = saved) {
  return backupToJson(
    buildBackup(data, { morningCutoff: '11:00' }, new Date('2026-10-30T10:00:00Z')),
  )
}

function parsed(text: string) {
  const result = parseBackup(text)
  if (!result.ok) throw new Error(result.error)
  return result.backup
}

describe('parseBackup', () => {
  it('reads a file this app exported', () => {
    const backup = parsed(fileFor())
    expect(backup.entries).toHaveLength(2)
    expect(backup.preferences.morningCutoff).toBe('11:00')
  })

  it.each([
    ['not json', /isn’t a Tracker backup/],
    ['{"hello":1}', /isn’t a Tracker backup/],
    [JSON.stringify({ version: 2, entries: [] }), /different version/],
    [
      JSON.stringify({
        version: 1,
        entries: [{ entryDate: '2026-02-30', period: 'AM' }],
      }),
      /not a real date/,
    ],
    [
      JSON.stringify({
        version: 1,
        entries: [{ entryDate: '2026-10-01', period: 'AM', wakingPain: 11 }],
      }),
      /0 to 10/,
    ],
    [
      JSON.stringify({
        version: 1,
        entries: [{ entryDate: '2026-10-01', period: 'XX' }],
      }),
      /AM or PM/,
    ],
    [
      JSON.stringify({
        version: 1,
        entries: [
          { entryDate: '2026-10-01', period: 'AM' },
          { entryDate: '2026-10-01', period: 'AM' },
        ],
      }),
      /two AM/,
    ],
    [
      JSON.stringify({
        version: 1,
        entries: [],
        timedLogs: [{ id: 'x', kind: 'pain', occurredAt: '2026-10-01T00:00:00Z' }],
      }),
      /needs/,
    ],
  ])('rejects %s', (text, message) => {
    const result = parseBackup(text)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(message)
  })
})

describe('planImport', () => {
  it('finds everything unchanged when the file matches the saved data', () => {
    const plan = planImport(parsed(fileFor()), saved)
    expect(plan.entries.unchanged).toHaveLength(2)
    expect(planIsEmpty(plan)).toBe(true)
  })

  it('ignores ids and timestamps when comparing', () => {
    const renewed = {
      ...saved,
      entries: saved.entries.map((e) => ({ ...e, id: 'new', updatedAt: 'later' })),
    }
    expect(planIsEmpty(planImport(parsed(fileFor()), renewed))).toBe(true)
  })

  it('treats everything as new for an empty database', () => {
    const plan = planImport(parsed(fileFor()), {
      entries: [],
      customOptions: [],
      timedLogs: [],
    })
    expect(plan.entries.added).toHaveLength(2)
    expect(plan.timedLogs.added).toHaveLength(1)
    expect(plan.options.added).toHaveLength(1)
  })

  it('flags a check-in that differs from the saved one', () => {
    const edited = { ...saved, entries: [{ ...am, wakingPain: 8 }, pm] }
    const plan = planImport(parsed(fileFor()), edited)
    expect(plan.entries.changed).toHaveLength(1)
    expect(plan.entries.changed[0].existing.wakingPain).toBe(8)
    expect(plan.entries.changed[0].incoming.wakingPain).toBe(4)
  })
})

describe('applyImport', () => {
  function repo() {
    return {
      upsertEntries: vi.fn().mockResolvedValue([]),
      upsertTimedLog: vi.fn().mockResolvedValue({}),
      addCustomOption: vi.fn().mockResolvedValue({}),
      updateCustomOption: vi.fn().mockResolvedValue({}),
    }
  }

  it('saves new rows one per request with every field explicit', async () => {
    const r = repo()
    const plan = planImport(parsed(fileFor()), {
      entries: [],
      customOptions: [],
      timedLogs: [],
    })
    const progress = vi.fn()
    await applyImport(r, plan, false, progress)

    expect(r.upsertEntries).toHaveBeenCalledTimes(2)
    const [amSave] = r.upsertEntries.mock.calls[0][0]
    expect(amSave).toMatchObject({
      endPain: null,
      exercise: null,
      activities: [],
      note: null,
      wakingPain: 4,
    })
    expect(r.upsertTimedLog).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ kind: 'pain', pain: 7 }),
    )
    expect(r.addCustomOption).toHaveBeenCalledWith('activity', 'Pool', false)
    expect(progress).toHaveBeenLastCalledWith(4, 4)
  })

  it('leaves different rows alone unless overwrite is chosen', async () => {
    const edited = { ...saved, entries: [{ ...am, wakingPain: 8 }, pm] }
    const plan = planImport(parsed(fileFor()), edited)

    const keep = repo()
    await applyImport(keep, plan, false)
    expect(keep.upsertEntries).not.toHaveBeenCalled()

    const replace = repo()
    await applyImport(replace, plan, true)
    expect(replace.upsertEntries).toHaveBeenCalledTimes(1)
    expect(replace.upsertEntries.mock.calls[0][0][0]).toMatchObject({
      period: 'AM',
      wakingPain: 4,
    })
  })
})
