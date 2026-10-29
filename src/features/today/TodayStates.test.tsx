import { describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoadErrorCard from './LoadErrorCard'
import SaveStatusLine from './SaveStatusLine'
import { saveMessage } from './saveMessage'

describe('saveMessage', () => {
  it('stays quiet when idle or saved', () => {
    expect(saveMessage({ state: 'idle', pending: 0, failed: 0 })).toBeNull()
    expect(saveMessage({ state: 'saved', pending: 0, failed: 0 })).toBeNull()
  })

  it('describes saving, unsaved, refused and signed-out states', () => {
    expect(saveMessage({ state: 'saving', pending: 1, failed: 0 })).toBe('Saving…')
    expect(saveMessage({ state: 'not_saved', pending: 1, failed: 0 })).toMatch(
      /Not saved yet/,
    )
    expect(saveMessage({ state: 'not_saved', pending: 3, failed: 0 })).toMatch(
      /3 entries/,
    )
    expect(saveMessage({ state: 'needs_attention', pending: 0, failed: 2 })).toMatch(
      /2 entries/,
    )
    expect(saveMessage({ state: 'paused', pending: 1, failed: 0 })).toMatch(
      /Sign in again/,
    )
  })
})

describe('SaveStatusLine', () => {
  it('announces a message inside a live region', () => {
    render(<SaveStatusLine status={{ state: 'not_saved', pending: 1, failed: 0 }} />)
    expect(screen.getByRole('status')).toHaveTextContent('Not saved yet')
  })
})

describe('SaveStatusLine confirmation', () => {
  it('says Saved briefly after a save finishes, then goes quiet', () => {
    vi.useFakeTimers()
    const { rerender } = render(
      <SaveStatusLine status={{ state: 'saving', pending: 1, failed: 0 }} />,
    )
    rerender(<SaveStatusLine status={{ state: 'saved', pending: 0, failed: 0 }} />)
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    vi.useRealTimers()
  })

  it('stays quiet when the screen opens already saved', () => {
    render(<SaveStatusLine status={{ state: 'saved', pending: 0, failed: 0 }} />)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})

describe('LoadErrorCard', () => {
  it('offers a retry', async () => {
    const onRetry = vi.fn()
    render(<LoadErrorCard onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Couldn’t load today')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
