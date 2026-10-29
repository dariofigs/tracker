import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  BatteryBar,
  BottomNav,
  Button,
  Card,
  PillChip,
  SectionHeader,
  StatusChip,
} from '.'

describe('Card', () => {
  it('renders children and merges className', () => {
    render(<Card className="mt-4">Hello</Card>)
    const card = screen.getByText('Hello')
    expect(card.tagName).toBe('DIV')
    expect(card).toHaveClass('bg-surface-card', 'mt-4')
  })

  it('renders as another element', () => {
    render(
      <Card as="section" aria-label="Battery">
        x
      </Card>,
    )
    expect(screen.getByRole('region', { name: 'Battery' })).toBeInTheDocument()
  })
})

describe('SectionHeader', () => {
  it('renders a heading and trailing content', () => {
    render(<SectionHeader title="Energy" trailing={<StatusChip status="balanced" />} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Energy' })).toBeInTheDocument()
    expect(screen.getByText('Balanced')).toBeInTheDocument()
  })

  it('supports h3', () => {
    render(<SectionHeader title="Sub" level={3} />)
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })
})

describe('StatusChip', () => {
  it.each([
    ['balanced', 'Balanced'],
    ['low-battery', 'Low Battery'],
    ['due', 'DUE'],
    ['flare', 'Flare'],
  ] as const)('shows the default label for %s', (status, label) => {
    render(<StatusChip status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('accepts a label override', () => {
    render(<StatusChip status="flare" label="Flare day" />)
    expect(screen.getByText('Flare day')).toBeInTheDocument()
  })
})

describe('PillChip', () => {
  it('shows + when inactive and ✓ when active', () => {
    const { rerender } = render(
      <PillChip label="Fatigue" selected={false} onChange={() => {}} />,
    )
    const chip = screen.getByRole('button', { name: /Fatigue/ })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    expect(chip).toHaveTextContent('+')
    rerender(<PillChip label="Fatigue" selected onChange={() => {}} />)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(chip).toHaveTextContent('✓')
  })

  it('reports the toggled value on tap', async () => {
    const onChange = vi.fn()
    render(<PillChip label="Walk" selected={false} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('uses the clay variant when active', () => {
    render(<PillChip label="Walk" selected variant="clay" onChange={() => {}} />)
    expect(screen.getByRole('button')).toHaveClass('text-accent-clay')
  })

  it('has a 48px minimum target', () => {
    render(<PillChip label="Walk" selected={false} onChange={() => {}} />)
    expect(screen.getByRole('button')).toHaveClass('min-touch')
  })
})

describe('Button', () => {
  it('is a non-submitting button by default and fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies secondary and full-width styles', () => {
    render(
      <Button variant="secondary" fullWidth>
        Cancel
      </Button>,
    )
    expect(screen.getByRole('button')).toHaveClass(
      'border-brand-sage',
      'w-full',
      'h-[5rem]',
    )
  })
})

describe('BatteryBar', () => {
  it('exposes the value as a meter and sizes the fill', () => {
    render(<BatteryBar value={65} label="Capacity" />)
    const meter = screen.getByRole('meter', { name: 'Capacity' })
    expect(meter).toHaveAttribute('aria-valuenow', '65')
    expect(meter.firstElementChild).toHaveStyle({ width: '65%' })
    expect(meter.firstElementChild).toHaveClass('bg-brand-sage')
  })

  it('turns clay at or below the low threshold', () => {
    render(<BatteryBar value={30} label="Capacity" />)
    expect(screen.getByRole('meter').firstElementChild).toHaveClass('bg-accent-clay')
  })

  it('clamps out-of-range values', () => {
    render(<BatteryBar value={140} label="Capacity" />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100')
  })
})

describe('BottomNav', () => {
  const items = [
    { id: 'today', label: 'Today', icon: null },
    { id: 'insights', label: 'Insights', icon: null },
    { id: 'settings', label: 'Settings', icon: null },
  ]

  it('marks the current tab and reports taps', async () => {
    const onChange = vi.fn()
    render(<BottomNav items={items} value="today" onChange={onChange} />)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: 'Insights' })).not.toHaveAttribute(
      'aria-current',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Insights' }))
    expect(onChange).toHaveBeenCalledWith('insights')
  })
})
