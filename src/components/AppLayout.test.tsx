import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './AppLayout'

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
    await userEvent.click(screen.getByRole('button', { name: /insights/i }))
    expect(screen.getByText('insights page')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /insights/i })).toHaveAttribute(
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

describe('Rapid check-in placement (today)', () => {
  it('appears on Today only', () => {
    renderAt('/')
    expect(screen.getByRole('button', { name: /check-in/i })).toBeInTheDocument()
  })
})
