import { describe, expect, it } from 'vitest'
import type { CustomOption, Entry, TimedLog } from '../../data/types'
import {
  buildOptionRows,
  renameInEntry,
  timedLogsUsing,
  validateLabel,
} from './optionsModel'

const option = (over: Partial<CustomOption>): CustomOption => ({
  id: 'o1',
  kind: 'activity',
  label: 'Pool',
  hidden: false,
  createdAt: '2026-10-01T00:00:00Z',
  ...over,
})

const entry = (over: Partial<Entry>): Entry => ({
  id: 'e1',
  entryDate: '2026-10-01',
  period: 'PM',
  note: null,
  createdAt: '',
  updatedAt: '',
  ...over,
})

describe('buildOptionRows', () => {
  it('lists built-ins, then custom choices', () => {
    const rows = buildOptionRows('activity', [option({})])
    expect(rows[0]).toMatchObject({ label: 'Walk', source: 'default', hidden: false })
    expect(rows.at(-1)).toMatchObject({ label: 'Pool', source: 'custom', id: 'o1' })
  })

  it('marks a built-in hidden when a hidden custom row has its name', () => {
    const rows = buildOptionRows('activity', [
      option({ id: 'h1', label: 'Walk', hidden: true }),
    ])
    expect(rows.find((r) => r.label === 'Walk')).toMatchObject({ hidden: true, id: 'h1' })
    expect(rows.filter((r) => r.label === 'Walk')).toHaveLength(1)
  })

  it('ignores other kinds', () => {
    const rows = buildOptionRows('symptom', [option({})])
    expect(rows.some((r) => r.label === 'Pool')).toBe(false)
  })
})

describe('validateLabel', () => {
  const rows = buildOptionRows('activity', [option({})])

  it('rejects empty, long and duplicate names regardless of case', () => {
    expect(validateLabel('activity', '  ', rows)).toMatch(/Type a name/)
    expect(validateLabel('activity', 'x'.repeat(41), rows)).toMatch(/40/)
    expect(validateLabel('activity', 'walk', rows)).toMatch(/already/)
  })

  it('allows keeping the current name while renaming', () => {
    expect(validateLabel('activity', 'Pool', rows, 'Pool')).toBeNull()
    expect(validateLabel('activity', 'Swim', rows, 'Pool')).toBeNull()
  })
})

describe('renameInEntry', () => {
  it('swaps a label in a list and removes a resulting duplicate', () => {
    const result = renameInEntry(
      entry({ activities: ['Pool', 'Swim'] }),
      'activity',
      'Pool',
      'Swim',
    )
    expect(result).toEqual({
      entryDate: '2026-10-01',
      period: 'PM',
      activities: ['Swim'],
    })
  })

  it('renames the exercise type and keeps minutes and effort', () => {
    const result = renameInEntry(
      entry({ exercise: { type: 'Walk', minutes: 30, effort: 2 } }),
      'exercise_type',
      'Walk',
      'Stroll',
    )
    expect(result?.exercise).toEqual({ type: 'Stroll', minutes: 30, effort: 2 })
  })

  it('returns null when the entry does not use the label', () => {
    expect(
      renameInEntry(entry({ symptoms: ['Fatigue'] }), 'symptom', 'Nausea', 'Queasy'),
    ).toBeNull()
    expect(renameInEntry(entry({}), 'pain_area', 'Neck', 'Nape')).toBeNull()
  })
})

describe('timedLogsUsing', () => {
  const log = (over: Partial<TimedLog>): TimedLog => ({
    id: 't',
    occurredAt: '',
    kind: 'activity',
    pain: null,
    label: 'Pool',
    minutes: null,
    effort: null,
    note: null,
    createdAt: '',
    ...over,
  })

  it('matches by kind and label', () => {
    const logs = [
      log({ id: 'a' }),
      log({ id: 'b', kind: 'symptom' }),
      log({ id: 'c', label: 'Walk' }),
    ]
    expect(timedLogsUsing(logs, 'activity', 'Pool').map((l) => l.id)).toEqual(['a'])
    expect(timedLogsUsing(logs, 'pain_area', 'Pool')).toEqual([])
  })
})
