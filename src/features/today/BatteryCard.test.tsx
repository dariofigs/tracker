import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Entry } from '../../data/types'
import BatteryCard from './BatteryCard'
import { latestCapacity } from './latestCapacity'

const base = {
  id: 'x',
  entryDate: '2026-10-29',
  note: null,
  createdAt: '2026-10-29T14:00:00Z',
  updatedAt: '2026-10-29T14:00:00Z',
}
const morning: Entry = { ...base, period: 'AM', startingCapacity: 70 }
const evening: Entry = { ...base, period: 'PM', remainingCapacity: 25 }

describe('latestCapacity', () => {
  it('prefers the evening reading, then the morning, then nothing', () => {
    expect(latestCapacity(morning, evening)).toEqual({ value: 25, source: 'evening' })
    expect(latestCapacity(morning, null)).toEqual({ value: 70, source: 'morning' })
    expect(latestCapacity(null, null)).toBeNull()
  })

  it('falls back to the morning when the evening skipped capacity', () => {
    expect(latestCapacity(morning, { ...evening, remainingCapacity: null })?.source).toBe(
      'morning',
    )
  })
})

describe('BatteryCard', () => {
  it('shows an empty prompt with no reading', () => {
    render(<BatteryCard reading={null} />)
    expect(
      screen.getByText(
        'Nothing logged today. Your level will show here after a check-in.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('meter')).not.toBeInTheDocument()
  })

  it('shows Balanced for a healthy morning reading', () => {
    render(<BatteryCard reading={{ value: 70, source: 'morning' }} />)
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('Balanced')).toBeInTheDocument()
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '70')
  })

  it('shows Low Battery at or below 30%', () => {
    render(<BatteryCard reading={{ value: 25, source: 'evening' }} />)
    expect(screen.getByText('Low Battery')).toBeInTheDocument()
  })
})
