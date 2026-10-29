import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

function Counter() {
  const [n, setN] = useState(0)
  return <button onClick={() => setN(n + 1)}>Taps: {n}</button>
}

describe('test setup', () => {
  it('renders React and handles a tap', async () => {
    render(<Counter />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Taps: 0')
    await userEvent.click(button)
    expect(button).toHaveTextContent('Taps: 1')
  })
})
