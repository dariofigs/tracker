import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { PainGauge } from '.'

function Harness({
  initial = 3,
  onChange = () => {},
}: {
  initial?: number
  onChange?: (n: number) => void
}) {
  const [v, setV] = useState(initial)
  return (
    <PainGauge
      label="Waking pain"
      value={v}
      onChange={(n) => {
        setV(n)
        onChange(n)
      }}
    />
  )
}

const slider = () => screen.getByRole('slider', { name: 'Waking pain' })

describe('PainGauge', () => {
  it('exposes slider semantics for 0-10', () => {
    render(<Harness />)
    expect(slider()).toHaveAttribute('aria-valuemin', '0')
    expect(slider()).toHaveAttribute('aria-valuemax', '10')
    expect(slider()).toHaveAttribute('aria-valuenow', '3')
    expect(slider()).toHaveTextContent('3')
  })

  it('steps with arrow keys and clamps at the ends', async () => {
    render(<Harness initial={9} />)
    slider().focus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')
    expect(slider()).toHaveAttribute('aria-valuenow', '10')
    await userEvent.keyboard('{ArrowLeft}')
    expect(slider()).toHaveAttribute('aria-valuenow', '9')
    await userEvent.keyboard('{Home}')
    expect(slider()).toHaveAttribute('aria-valuenow', '0')
    await userEvent.keyboard('{ArrowDown}')
    expect(slider()).toHaveAttribute('aria-valuenow', '0')
    await userEvent.keyboard('{End}')
    expect(slider()).toHaveAttribute('aria-valuenow', '10')
  })

  it('sets the nearest whole value on tap and while dragging', () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    const track = slider().parentElement!
    track.getBoundingClientRect = () => ({ left: 100, width: 200 }) as DOMRect
    const area = track.parentElement!

    fireEvent.pointerDown(area, { clientX: 200, pointerId: 1 })
    expect(slider()).toHaveAttribute('aria-valuenow', '5')
    fireEvent.pointerMove(area, { clientX: 262, pointerId: 1 })
    expect(slider()).toHaveAttribute('aria-valuenow', '8')
    fireEvent.pointerUp(area, { pointerId: 1 })
    fireEvent.pointerMove(area, { clientX: 100, pointerId: 1 })
    expect(slider()).toHaveAttribute('aria-valuenow', '8')
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('shows range labels, and hides them when empty', () => {
    const { rerender } = render(<PainGauge label="Pain" value={0} onChange={() => {}} />)
    expect(screen.getByText('Flare (8-10)')).toBeInTheDocument()
    rerender(<PainGauge label="Stress" value={0} onChange={() => {}} rangeLabels={[]} />)
    expect(screen.queryByText('Flare (8-10)')).not.toBeInTheDocument()
  })

  it('counts the first key press as an answer when unset, even at 0', async () => {
    const onChange = vi.fn()
    render(<PainGauge label="Waking pain" value={0} unset onChange={onChange} />)
    expect(slider()).not.toHaveAttribute('aria-valuenow')
    expect(slider()).toHaveAttribute('aria-valuetext', 'Not set')
    slider().focus()
    await userEvent.keyboard('{Home}')
    expect(onChange).toHaveBeenCalledWith(0)
  })
})
