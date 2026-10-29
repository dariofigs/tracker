import { Button, Card } from '../../components/ui'

function LoadErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <Card as="section" role="alert" className="flex flex-col items-start gap-[1.2rem]">
      <p className="text-title font-semibold">Couldn’t load today</p>
      <p className="text-body text-text-muted">
        Check your connection. Anything you’ve logged is safe.
      </p>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </Card>
  )
}

export default LoadErrorCard
