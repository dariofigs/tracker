import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, SectionHeader, StatusChip } from '.'

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
