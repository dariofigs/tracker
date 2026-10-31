import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ThemeSetting from './ThemeSetting'

const times = { darkFrom: '19:00', lightFrom: '07:00' }

describe('ThemeSetting', () => {
  it('offers the four modes and marks the current one', () => {
    render(<ThemeSetting theme="dark" {...times} onChange={vi.fn()} />)
    expect(screen.getAllByRole('radio')).toHaveLength(4)
    expect(screen.getByRole('radio', { name: /^Dark/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /^Light/ })).not.toBeChecked()
  })

  it('reports the chosen mode', async () => {
    const onChange = vi.fn()
    render(<ThemeSetting theme="system" {...times} onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio', { name: /^Day and night/ }))
    expect(onChange).toHaveBeenCalledWith({ theme: 'schedule' })
  })

  it('moves with the arrow keys', async () => {
    const onChange = vi.fn()
    render(<ThemeSetting theme="light" {...times} onChange={onChange} />)
    screen.getByRole('radio', { name: /^Light/ }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('shows the switch times only for day and night', () => {
    const { rerender } = render(
      <ThemeSetting theme="dark" {...times} onChange={vi.fn()} />,
    )
    expect(screen.queryByLabelText('Switch to dark at')).toBeNull()
    rerender(<ThemeSetting theme="schedule" {...times} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Switch to dark at')).toHaveValue('19:00')
    expect(screen.getByLabelText('Switch to light at')).toHaveValue('07:00')
  })
})
