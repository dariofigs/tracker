import { describe, expect, it } from 'vitest'
import type { Entry } from '../../data/types'
import { DEFAULT_SLEEP_HOURS, defaultsFrom, emptyForm, formFromEntry, toEntryInput } from './formModel'

const entry = (over: Partial<Entry>): Entry => ({
  id: 'e1',
  entryDate: '2026-10-28',
  period: 'AM',
  note: null,
  createdAt: '',
  updatedAt: '',
  ...over,
})

describe('defaultsFrom', () => {
  it('carries sleep over from the last morning but never pain or capacity', () => {
    const form = defaultsFrom(
      entry({ sleepHours: 6.5, sleepQuality: 2, wakingPain: 8, startingCapacity: 25 }),
      'AM',
    )
    expect(form.sleepHours).toBe(6.5)
    expect(form.sleepQuality).toBe(2)
    expect(form.wakingPain).toBeNull()
    expect(form.startingCapacity).toBeNull()
  })

  it('falls back to a default sleep length with no history', () => {
    expect(defaultsFrom(null, 'AM').sleepHours).toBe(DEFAULT_SLEEP_HOURS)
  })

  it('starts the evening empty', () => {
    expect(defaultsFrom(entry({ period: 'PM', stress: 7 }), 'PM')).toEqual(emptyForm())
  })
})

describe('toEntryInput', () => {
  it('sends only morning fields that were answered', () => {
    const form = { ...emptyForm(), wakingPain: 0, sleepHours: 7, endPain: 9 }
    expect(toEntryInput('2026-10-29', 'AM', form)).toEqual({
      entryDate: '2026-10-29',
      period: 'AM',
      wakingPain: 0,
      sleepHours: 7,
      painAreas: [],
      note: null,
    })
  })

  it('sends evening lists even when empty, so removing a chip is saved', () => {
    const input = toEntryInput('2026-10-29', 'PM', { ...emptyForm(), stress: 4, note: '  rough  ' })
    expect(input).toMatchObject({ stress: 4, activities: [], symptoms: [], note: 'rough' })
    expect(input).not.toHaveProperty('endPain')
  })

  it('round-trips an edited entry', () => {
    const saved = entry({ period: 'PM', endPain: 5, activities: ['Walk'], note: 'hi' })
    expect(toEntryInput(saved.entryDate, 'PM', formFromEntry(saved))).toMatchObject({
      endPain: 5,
      activities: ['Walk'],
      note: 'hi',
    })
  })
})
