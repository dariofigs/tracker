import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Entry } from '../../data/types'
import CadenceCard from './CadenceCard'

const base = {
  id: 'x',
  entryDate: '2026-10-29',
  note: null,
  createdAt: '2026-10-29T14:00:00Z',
  updatedAt: '2026-10-29T14:00:00Z',
}
const morning: Entry = { ...base, period: 'AM', wakingPain: 3, startingCapacity: 70 }
const evening: Entry = { ...base, period: 'PM', endPain: 5, remainingCapacity: 30 }

describe('CadenceCard', () => {
  it('shows an unlogged morning and a later evening in the morning', () => {
    render(
      <CadenceCard morning={null} evening={null} currentPeriod="AM" onOpen={() => {}} />,
    )
    expect(screen.getByText('Not logged yet')).toBeInTheDocument()
    expect(screen.getByText('Later today')).toBeInTheDocument()
    expect(screen.queryByText('DUE')).not.toBeInTheDocument()
  })

  it('shows the morning summary and a DUE evening that opens the PM sheet', async () => {
    const onOpen = vi.fn()
    render(
      <CadenceCard morning={morning} evening={null} currentPeriod="PM" onOpen={onOpen} />,
    )
    expect(screen.getByText('Pain 3/10 · Capacity 70%')).toBeInTheDocument()
    expect(screen.getByText('DUE')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /evening/i }))
    expect(onOpen).toHaveBeenCalledWith('PM')
  })

  it('shows both done', () => {
    render(
      <CadenceCard
        morning={morning}
        evening={evening}
        currentPeriod="PM"
        onOpen={() => {}}
      />,
    )
    expect(screen.getByText('Pain 5/10 · Capacity 30%')).toBeInTheDocument()
    expect(screen.queryByText('DUE')).not.toBeInTheDocument()
  })
})
