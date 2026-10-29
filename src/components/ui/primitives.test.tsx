import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card, PillChip, SectionHeader, StatusChip } from '.'

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
