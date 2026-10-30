import { Button, Card } from './ui'

type StartupScreenProps =
  | { state: 'loading' }
  | { state: 'error'; title: string; message: string; onRetry?: () => void }

/** Full-screen state shown before the app is ready: session loading, missing config, or a failed start. */
function StartupScreen(props: StartupScreenProps) {
  return (
    <div className="bg-canvas-bg flex min-h-dvh items-center justify-center px-[1.6rem]">
      {props.state === 'loading' ? (
        <p
          role="status"
          aria-busy="true"
          className="font-display text-title motion-safe:animate-pulse"
        >
          Tracker
        </p>
      ) : (
        <Card
          as="section"
          role="alert"
          className="flex w-full max-w-[40rem] flex-col items-start gap-[1.2rem]"
        >
          <p className="text-title font-semibold">{props.title}</p>
          <p className="text-body text-text-muted">{props.message}</p>
          {props.onRetry && (
            <Button variant="secondary" onClick={props.onRetry}>
              Try again
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}

export default StartupScreen
