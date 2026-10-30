import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ErrorBoundary from './ErrorBoundary'
import OfflineBanner from './OfflineBanner'
import StartupScreen from './StartupScreen'

function Boom(): never {
  throw new Error('render crash')
}

describe('OfflineBanner', () => {
  afterEach(() => vi.restoreAllMocks())

  it('shows the offline notice when the browser reports no connection', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    render(<OfflineBanner />)
    expect(screen.getByRole('status')).toHaveTextContent('You’re offline')
  })

  it('renders nothing while online', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    render(<OfflineBanner />)
    expect(screen.queryByRole('status')).toBeNull()
  })
})

describe('StartupScreen', () => {
  it('offers a retry on a failed start', async () => {
    const onRetry = vi.fn()
    render(
      <StartupScreen
        state="error"
        title="Couldn’t reach your data"
        message="Check it."
        onRetry={onRetry}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Couldn’t reach your data')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows no retry when none is given', () => {
    render(
      <StartupScreen
        state="error"
        title="App isn’t configured"
        message="Missing keys."
      />,
    )
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('ErrorBoundary', () => {
  it('replaces a crashed screen with a message and reload button', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
