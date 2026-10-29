import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import TodayHeader from './TodayHeader'
import { formatHeaderDate, greetingFor } from './headerText'

describe('TodayHeader', () => {
  it('greets by time of day', () => {
    expect(greetingFor(new Date(2026, 9, 29, 8))).toBe('Good morning')
    expect(greetingFor(new Date(2026, 9, 29, 12))).toBe('Good afternoon')
    expect(greetingFor(new Date(2026, 9, 29, 18))).toBe('Good evening')
  })

  it('shows the long local date and the greeting as the page heading', () => {
    const now = new Date(2026, 9, 29, 9)
    expect(formatHeaderDate(now)).toBe('Thursday, October 29')
    render(<TodayHeader now={now} name="Sam" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Good morning, Sam',
    )
    expect(screen.getByText('Thursday, October 29')).toBeInTheDocument()
  })
})
