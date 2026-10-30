import { describe, expect, it } from 'vitest'
import type { Entry } from '../../../data/types'
import { csvCell, entriesToCsv } from './exportCsv'

const entry: Entry = {
  id: 'e1',
  entryDate: '2026-10-01',
  period: 'PM',
  endPain: 4,
  exercise: { type: 'Walk', minutes: 30, effort: 2 },
  activities: ['Walk', 'Rest'],
  symptoms: [],
  painAreas: ['Neck'],
  stress: 3,
  note: 'Said "ok", then rested',
  createdAt: '',
  updatedAt: '',
}

describe('csvCell', () => {
  it('quotes commas, quotes and newlines', () => {
    expect(csvCell('a,b')).toBe('"a,b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('two\nlines')).toBe('"two\nlines"')
  })

  it('leaves blanks empty and numbers plain', () => {
    expect(csvCell(null)).toBe('')
    expect(csvCell(undefined)).toBe('')
    expect(csvCell(0)).toBe('0')
    expect(csvCell(-1)).toBe('-1')
  })

  it('keeps formula-looking text as text', () => {
    expect(csvCell('=SUM(A1)')).toBe("'=SUM(A1)")
    expect(csvCell('@home')).toBe("'@home")
  })
})

describe('entriesToCsv', () => {
  it('writes a BOM, a header and one row per entry', () => {
    const lines = entriesToCsv([entry]).replace('﻿', '').trimEnd().split('\r\n')
    expect(lines).toHaveLength(2)
    expect(lines[0].startsWith('date,period,waking_pain')).toBe(true)
    expect(lines[1]).toBe(
      '2026-10-01,PM,,,,,4,Walk,30,2,Walk; Rest,,Neck,3,,"Said ""ok"", then rested"',
    )
  })
})
