import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import AppShell from './AppShell'

describe('AppShell', () => {
  it('renders content inside main', () => {
    render(<AppShell>Hello</AppShell>)
    expect(screen.getByRole('main')).toHaveTextContent('Hello')
  })

  it('renders the nav slot outside main when given', () => {
    render(<AppShell nav={<nav aria-label="Main">tabs</nav>}>Hello</AppShell>)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('main')).not.toContainElement(screen.getByRole('navigation'))
  })
})
