import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { Entry } from '../../data/types'
import { startOfMonth, todayString } from '../../lib/dates'
import DayDetailSheet from './DayDetailSheet'
import HistoryList from './HistoryList'
import InsightCard from './InsightCard'
import InsightsScreen from './InsightsScreen'
import MonthGrid from './MonthGrid'

// The spy returns nothing: vitest tracks a spy's returned promise and reports a rejection as unhandled.
const deleteEntry = vi.fn<(id: string) => void>()
// A factory, so a rejected promise only exists once the code under test calls it and handles it.
let deleteResult: () => Promise<void> = () => Promise.resolve()
vi.mock('../../data/repository', () => ({
  repository: {
    deleteEntry: (id: string) => {
      deleteEntry(id)
      return deleteResult()
    },
  },
}))
vi.mock('../../hooks/useEntriesInRange', () => ({
  useEntriesInRange: () => ({
    entries: [],
    loading: false,
    error: null,
    reload: vi.fn(),
  }),
}))
vi.mock('../checkin/CheckinContext', () => ({
  useCheckin: () => ({ openCheckin: vi.fn() }),
}))

const base = { note: null, createdAt: '', updatedAt: '' }
const am: Entry = {
  ...base,
  id: 'am-1',
  entryDate: '2026-10-28',
  period: 'AM',
  wakingPain: 8,
}
const pm: Entry = {
  ...base,
  id: 'pm-1',
  entryDate: '2026-10-28',
  period: 'PM',
  endPain: 2,
  stress: 5,
}

beforeEach(() => {
  deleteEntry.mockReset()
  deleteResult = () => Promise.resolve()
})

describe('InsightCard', () => {
  it('says how many more days are needed', () => {
    render(<InsightCard result={{ status: 'needs-more-days', have: 6, need: 10 }} />)
    expect(screen.getByText(/6 of 10 days so far/)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '6')
  })

  it('says plainly when nothing stands out', () => {
    render(<InsightCard result={{ status: 'ready', have: 40, insights: [] }} />)
    expect(screen.getByText(/Nothing stands out yet across 40 days/)).toBeInTheDocument()
  })
})

describe('MonthGrid', () => {
  it('describes each day by its morning and evening pain, and blocks future days', async () => {
    const onSelect = vi.fn()
    render(
      <MonthGrid
        monthStart="2026-10-01"
        entries={[am, pm]}
        today="2026-10-29"
        onSelect={onSelect}
      />,
    )
    const day = screen.getByRole('gridcell', {
      name: /October 28: morning pain 8, evening pain 2/,
    })
    await userEvent.click(day)
    expect(onSelect).toHaveBeenCalledWith('2026-10-28')
    expect(screen.getByRole('gridcell', { name: /October 30/ })).toBeDisabled()
  })
})

describe('HistoryList', () => {
  it('lists logged days with both pain ratings', () => {
    render(<HistoryList entries={[am, pm]} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Oct 28/ })).toHaveTextContent(
      'AM 8 · PM 2',
    )
  })
})

describe('DayDetailSheet', () => {
  const renderSheet = (entries: Entry[] = [am, pm]) => {
    const props = { onClose: vi.fn(), onEdit: vi.fn(), onDeleted: vi.fn() }
    render(<DayDetailSheet day="2026-10-28" entries={entries} {...props} />)
    return props
  }

  it('asks before deleting and keeps the entry when cancelled', async () => {
    renderSheet()
    await userEvent.click(screen.getByRole('button', { name: 'Delete morning entry' }))
    expect(screen.getByText(/Delete this morning entry\?/)).toBeInTheDocument()
    expect(deleteEntry).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Keep it' }))
    expect(screen.queryByText(/Delete this morning entry\?/)).not.toBeInTheDocument()
  })

  it('deletes after confirmation and tells the caller to reload', async () => {
    const { onDeleted } = renderSheet()
    await userEvent.click(screen.getByRole('button', { name: 'Delete morning entry' }))
    const dialog = screen.getByRole('alertdialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(deleteEntry).toHaveBeenCalledWith('am-1')
    expect(onDeleted).toHaveBeenCalled()
  })

  it('shows an error and keeps the confirmation open when delete fails', async () => {
    deleteResult = () => Promise.reject(new Error('offline'))
    const { onDeleted } = renderSheet()
    await userEvent.click(screen.getByRole('button', { name: 'Delete evening entry' }))
    await userEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(/Couldn’t delete/)
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('offers to log a period that has no entry, and to edit one that does', async () => {
    const { onEdit } = renderSheet([am])
    await userEvent.click(screen.getByRole('button', { name: 'Log evening' }))
    expect(onEdit).toHaveBeenCalledWith('PM')
    await userEvent.click(screen.getByRole('button', { name: 'Edit morning' }))
    expect(onEdit).toHaveBeenCalledWith('AM')
  })
})

describe('InsightsScreen', () => {
  it('switches between Trends and Calendar', async () => {
    render(
      <MemoryRouter>
        <InsightsScreen />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('region', { name: 'Patterns in your data' }),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: 'Calendar' }))
    expect(screen.getByRole('grid', { name: 'Month calendar' })).toBeInTheDocument()
    expect(screen.getByText(/Nothing logged in/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByRole('button', { name: 'Next month' })).toBeEnabled()
    expect(startOfMonth(todayString())).toMatch(/-01$/)
  })

  it('opens on the calendar from a link', () => {
    render(
      <MemoryRouter initialEntries={['/insights?view=calendar']}>
        <InsightsScreen />
      </MemoryRouter>,
    )
    expect(screen.getByRole('radio', { name: 'Calendar' })).toBeChecked()
  })
})
