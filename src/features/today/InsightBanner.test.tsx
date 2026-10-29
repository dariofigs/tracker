import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InsightBanner from './InsightBanner'

describe('InsightBanner', () => {
  it('renders nothing without an insight', () => {
    const { container } = render(
      <MemoryRouter>
        <InsightBanner insight={null} />
      </MemoryRouter>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the takeaway and links to Insights', () => {
    render(
      <MemoryRouter>
        <InsightBanner
          insight={{ text: 'Gentle walks tend to come before calmer mornings.' }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByRole('complementary', { name: 'Insight' })).toHaveTextContent(
      'calmer mornings',
    )
    expect(screen.getByRole('link', { name: 'View trend chart' })).toHaveAttribute(
      'href',
      '/insights',
    )
  })
})
