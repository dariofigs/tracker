import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SegmentedControl, Stepper } from '.'

describe('Stepper', () => {
  it('steps without float drift and respects the limits', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <Stepper
        label="Sleep hours"
        value={6.5}
        step={0.5}
        min={0}
        max={7}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Increase Sleep hours' }))
    expect(onChange).toHaveBeenLastCalledWith(7)
    await userEvent.click(screen.getByRole('button', { name: 'Decrease Sleep hours' }))
    expect(onChange).toHaveBeenLastCalledWith(6)

    rerender(
      <Stepper
        label="Sleep hours"
        value={7}
        step={0.5}
        min={0}
        max={7}
        onChange={onChange}
      />,
    )
    expect(screen.getByRole('button', { name: 'Increase Sleep hours' })).toBeDisabled()
    rerender(
      <Stepper
        label="Sleep hours"
        value={0}
        step={0.5}
        min={0}
        max={7}
        onChange={onChange}
      />,
    )
    expect(screen.getByRole('button', { name: 'Decrease Sleep hours' })).toBeDisabled()
  })
})

describe('SegmentedControl', () => {
  const options = [1, 2, 3].map((n) => ({ value: n, label: String(n) }))

  it('selects on tap and exposes radio semantics', async () => {
    const onChange = vi.fn()
    render(
      <SegmentedControl label="Effort" options={options} value={2} onChange={onChange} />,
    )
    expect(screen.getByRole('radiogroup', { name: 'Effort' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '2' })).toBeChecked()
    await userEvent.click(screen.getByRole('radio', { name: '3' }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('moves with arrow keys, wrapping around', async () => {
    const onChange = vi.fn()
    render(
      <SegmentedControl label="Effort" options={options} value={3} onChange={onChange} />,
    )
    screen.getByRole('radio', { name: '3' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith(1)
    // Focus follows the move, so Left from the first option wraps back to the last.
    await userEvent.keyboard('{ArrowLeft}')
    expect(onChange).toHaveBeenLastCalledWith(3)
  })

  it('is reachable by Tab when nothing is selected', () => {
    render(
      <SegmentedControl
        label="Effort"
        options={options}
        value={null}
        onChange={() => {}}
      />,
    )
    expect(screen.getByRole('radio', { name: '1' })).toHaveAttribute('tabindex', '0')
  })
})
