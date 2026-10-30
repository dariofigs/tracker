import { describe, expect, it } from 'vitest'
import type { Entry } from '../../data/types'
import { notableDays, summarizeMonth } from './monthStats'

const base = { note: null, createdAt: '', updatedAt: '' }
let n = 0
const am = (entryDate: string, wakingPain: number): Entry => ({
  ...base,
  id: `a${n++}`,
  entryDate,
  period: 'AM',
  wakingPain,
})
const pm = (entryDate: string, endPain: number, symptoms: string[] = []): Entry => ({
  ...base,
  id: `p${n++}`,
  entryDate,
  period: 'PM',
  endPain,
  symptoms,
})

describe('summarizeMonth', () => {
  it('handles an empty month', () => {
    expect(summarizeMonth([])).toEqual({
      daysLogged: 0,
      averagePain: null,
      flareDays: 0,
      topSymptom: null,
    })
  })

  it('counts days, averages pain, and finds the top symptom', () => {
    const s = summarizeMonth([
      am('2026-10-01', 2),
      pm('2026-10-01', 3, ['Fatigue']),
      am('2026-10-02', 8),
      pm('2026-10-02', 5, ['Fatigue', 'Nausea']),
    ])
    expect(s.daysLogged).toBe(2)
    expect(s.averagePain).toBe(4.5)
    expect(s.flareDays).toBe(1)
    expect(s.topSymptom).toEqual({ label: 'Fatigue', days: 2 })
  })
})

describe('notableDays', () => {
  it('is empty with no pain ratings', () => {
    expect(notableDays([])).toEqual({ highest: null, lowest: null, longestFlare: null })
  })

  it('omits the lowest day when every day matches', () => {
    expect(notableDays([am('2026-10-01', 4)]).lowest).toBeNull()
  })

  it('finds highest, lowest and the longest flare run', () => {
    const r = notableDays([
      am('2026-10-01', 2),
      am('2026-10-05', 7),
      pm('2026-10-06', 9),
      am('2026-10-07', 8),
      am('2026-10-10', 7),
    ])
    expect(r.highest).toEqual({ day: '2026-10-06', pain: 9 })
    expect(r.lowest).toEqual({ day: '2026-10-01', pain: 2 })
    expect(r.longestFlare).toEqual({ start: '2026-10-05', days: 3 })
  })
})
