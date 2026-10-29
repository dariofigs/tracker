import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Entry } from '../../data/types'

const { getEntriesInRange, listCustomOptions, addCustomOption, save } = vi.hoisted(() => ({
  getEntriesInRange: vi.fn(),
  listCustomOptions: vi.fn(),
  addCustomOption: vi.fn(),
  save: vi.fn(),
}))

vi.mock('../../data/repository', () => ({
  repository: { getEntriesInRange, listCustomOptions, addCustomOption },
}))
vi.mock('../../data/saveQueue', () => ({ saveQueue: { save } }))

import CheckinSheet from './CheckinSheet'

const DATE = '2026-10-29'

const entry = (over: Partial<Entry>): Entry => ({
  id: 'e',
  entryDate: DATE,
  period: 'AM',
  note: null,
  createdAt: '',
  updatedAt: '',
  ...over,
})

async function open(period: 'AM' | 'PM', onClose = vi.fn()) {
  render(<CheckinSheet period={period} date={DATE} onClose={onClose} />)
  await screen.findByRole('button', { name: 'Save Entry' })
  await screen.findAllByRole('slider')
  return onClose
}

/** Every call counts as one tap, so the tests below double as the tap-budget check (5.9). */
function taps() {
  let count = 0
  return {
    get count() {
      return count
    },
    async tap(target: HTMLElement) {
      count++
      await userEvent.click(target)
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  getEntriesInRange.mockResolvedValue([])
  listCustomOptions.mockResolvedValue([])
})

describe('morning check-in', () => {
  it('saves the fastest path in 4 taps', async () => {
    const onClose = await open('AM')
    const t = taps()
    await t.tap(screen.getByRole('slider', { name: 'Waking pain' }))
    await t.tap(screen.getByRole('radio', { name: '4' }))
    await t.tap(screen.getByRole('radio', { name: '50%' }))
    await t.tap(screen.getByRole('button', { name: 'Save Entry' }))

    expect(t.count).toBeLessThanOrEqual(4)
    expect(save).toHaveBeenCalledWith({
      entryDate: DATE,
      period: 'AM',
      wakingPain: 0,
      sleepHours: 7,
      sleepQuality: 4,
      startingCapacity: 50,
      note: null,
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('pre-fills sleep from the last morning but leaves pain unset', async () => {
    getEntriesInRange.mockResolvedValue([
      entry({ entryDate: '2026-10-28', sleepHours: 6.5, sleepQuality: 2, wakingPain: 9 }),
    ])
    await open('AM')
    expect(screen.getByRole('group', { name: 'Sleep hours' })).toHaveTextContent('6.5')
    expect(screen.getByRole('radio', { name: '2' })).toBeChecked()
    expect(screen.getByRole('slider', { name: 'Waking pain' })).toHaveAttribute(
      'aria-valuetext',
      'Not set',
    )
  })

  it('does not save pain that was never answered', async () => {
    await open('AM')
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }))
    expect(save.mock.calls[0][0]).not.toHaveProperty('wakingPain')
  })

  it('keeps the note collapsed until asked for', async () => {
    await open('AM')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '+ Add a note' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Note' }), 'slept badly')
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }))
    expect(save.mock.calls[0][0]).toMatchObject({ note: 'slept badly' })
  })

  it('closes without saving on Cancel', async () => {
    const onClose = await open('AM')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(save).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})

describe('evening check-in', () => {
  it('saves the fastest path, with a chip of each kind, in 6 taps', async () => {
    await open('PM')
    const t = taps()
    await t.tap(screen.getByRole('slider', { name: 'End-of-day pain' }))
    await t.tap(screen.getByRole('slider', { name: 'Stress' }))
    await t.tap(screen.getByRole('radio', { name: '25%' }))
    await t.tap(screen.getByRole('button', { name: 'Walk' }))
    await t.tap(screen.getByRole('button', { name: 'Fatigue' }))
    await t.tap(screen.getByRole('button', { name: 'Save Entry' }))

    expect(t.count).toBeLessThanOrEqual(6)
    expect(save).toHaveBeenCalledWith({
      entryDate: DATE,
      period: 'PM',
      endPain: 0,
      stress: 0,
      remainingCapacity: 25,
      activities: ['Walk'],
      symptoms: ['Fatigue'],
      painAreas: [],
      note: null,
    })
  })

  it('adds a custom activity and symptom, selected and saved as options', async () => {
    addCustomOption.mockResolvedValue({})
    await open('PM')
    await userEvent.click(screen.getByRole('button', { name: '+ Add new activity' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'New activity' }), 'Pool therapy{Enter}')
    await userEvent.click(screen.getByRole('button', { name: '+ Add new symptom' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'New symptom' }), 'Tingling')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByRole('button', { name: 'Pool therapy', pressed: true })).toBeInTheDocument()
    expect(addCustomOption).toHaveBeenCalledWith('activity', 'Pool therapy')
    expect(addCustomOption).toHaveBeenCalledWith('symptom', 'Tingling')

    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }))
    expect(save.mock.calls[0][0]).toMatchObject({
      activities: ['Pool therapy'],
      symptoms: ['Tingling'],
    })
  })

  it('keeps a custom chip for this check-in even if saving the option fails', async () => {
    addCustomOption.mockRejectedValue(new Error('offline'))
    await open('PM')
    await userEvent.click(screen.getByRole('button', { name: '+ Add new activity' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'New activity' }), 'Yoga{Enter}')
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }))
    expect(save.mock.calls[0][0]).toMatchObject({ activities: ['Yoga'] })
  })

  it('asks where it hurts only when end-of-day pain is above 0', async () => {
    await open('PM')
    expect(screen.queryByText('Where does it hurt?')).not.toBeInTheDocument()

    const pain = screen.getByRole('slider', { name: 'End-of-day pain' })
    pain.focus()
    await userEvent.keyboard('{End}')
    expect(screen.getByText('Where does it hurt?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Lower back' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }))
    expect(save.mock.calls[0][0]).toMatchObject({ endPain: 10, painAreas: ['Lower back'] })
  })

  it('clears areas when pain is set back to 0', async () => {
    await open('PM')
    const pain = screen.getByRole('slider', { name: 'End-of-day pain' })
    pain.focus()
    await userEvent.keyboard('{End}')
    await userEvent.click(screen.getByRole('button', { name: 'Knees' }))
    pain.focus()
    await userEvent.keyboard('{Home}')
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }))
    expect(save.mock.calls[0][0]).toMatchObject({ endPain: 0, painAreas: [] })
  })

  it('has no separate exercise section', async () => {
    await open('PM')
    expect(screen.queryByRole('button', { name: '+ Add exercise' })).not.toBeInTheDocument()
  })

  it('offers visible custom options and hides hidden ones', async () => {
    listCustomOptions.mockImplementation(async (kind: string) =>
      kind === 'symptom'
        ? [
            { id: '1', kind, label: 'Tingling', hidden: false, createdAt: '' },
            { id: '2', kind, label: 'Nausea', hidden: true, createdAt: '' },
          ]
        : [],
    )
    await open('PM')
    expect(await screen.findByRole('button', { name: 'Tingling' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Nausea' })).not.toBeInTheDocument()
  })
})

describe('edit mode', () => {
  it('opens the saved entry and saves changes to the same day and period', async () => {
    getEntriesInRange.mockResolvedValue([
      entry({ wakingPain: 6, sleepHours: 8, sleepQuality: 3, startingCapacity: 60, note: 'old' }),
    ])
    await open('AM')
    expect(screen.getByRole('dialog', { name: 'Edit morning check-in' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Waking pain' })).toHaveAttribute('aria-valuenow', '6')
    expect(screen.getByRole('radio', { name: '60%' })).toBeChecked()
    expect(screen.getByRole('textbox', { name: 'Note' })).toHaveValue('old')

    await userEvent.click(screen.getByRole('radio', { name: '75%' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }))
    expect(save).toHaveBeenCalledWith({
      entryDate: DATE,
      period: 'AM',
      wakingPain: 6,
      sleepHours: 8,
      sleepQuality: 3,
      startingCapacity: 75,
      note: 'old',
    })
  })

  it('names the day when editing a past one', async () => {
    getEntriesInRange.mockResolvedValue([])
    render(<CheckinSheet period="PM" date="2026-10-27" onClose={() => {}} />)
    expect(
      await screen.findByRole('dialog', { name: 'Evening check-in · Tue, Oct 27' }),
    ).toBeInTheDocument()
  })

  it('still lets you log when the lookup fails (offline)', async () => {
    getEntriesInRange.mockRejectedValue(new Error('offline'))
    await open('AM')
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }))
    expect(save).toHaveBeenCalledTimes(1)
  })
})
