import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './AppLayout'

const today = vi.hoisted(() => ({
  value: { morning: null, evening: null, loading: false, error: null, reload: () => {} } as {
    morning: object | null
    evening: object | null
    loading: boolean
    error: string | null
    reload: () => void
  },
}))
vi.mock('../hooks/useTodayEntries', () => ({ useTodayEntries: () => today.value }))

beforeEach(() => {
  today.value = { morning: null, evening: null, loading: false, error: null, reload: () => {} }
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<p>today page</p>} />
          <Route path="insights" element={<p>insights page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppLayout', () => {
  it('marks Today current at the root', () => {
    renderAt('/')
    expect(screen.getByRole('button', { name: /today/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('navigates when a tab is tapped', async () => {
    renderAt('/')
    await userEvent.click(screen.getByRole('button', { name: /trends/i }))
    expect(screen.getByText('insights page')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /trends/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})

describe('Rapid check-in', () => {
  it('is not shown on other tabs', () => {
    renderAt('/insights')
    expect(screen.queryByRole('button', { name: /check-in/i })).not.toBeInTheDocument()
  })

  it('opens the sheet from Today', async () => {
    renderAt('/')
    await userEvent.click(screen.getByRole('button', { name: /check-in/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('Rapid check-in once logged', () => {
  it('disappears when the current period is already logged', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      vi.setSystemTime(new Date(2026, 9, 30, 8, 0))
      today.value = { ...today.value, morning: {} }
      renderAt('/')
      expect(screen.queryByRole('button', { name: /check-in/i })).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('returns as the evening check-in once the cutoff passes', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      vi.setSystemTime(new Date(2026, 9, 30, 18, 0))
      today.value = { ...today.value, morning: {} }
      renderAt('/')
      expect(screen.getByRole('button', { name: 'Evening check-in' })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('Rapid check-in placement (today)', () => {
  it('appears on Today only', () => {
    renderAt('/')
    expect(screen.getByRole('button', { name: /check-in/i })).toBeInTheDocument()
  })
})
