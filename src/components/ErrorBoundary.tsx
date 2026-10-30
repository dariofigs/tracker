import { Component } from 'react'
import type { ReactNode } from 'react'
import StartupScreen from './StartupScreen'

type ErrorBoundaryState = { failed: boolean }

/** Catches a render crash so the phone shows a message and a reload, not a blank page. */
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <StartupScreen
        state="error"
        title="Something went wrong"
        message="Anything you’ve logged is safe. Reload to try again."
        onRetry={() => window.location.reload()}
      />
    )
  }
}

export default ErrorBoundary
