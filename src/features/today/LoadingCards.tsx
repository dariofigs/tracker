import { Card } from '../../components/ui'

function LoadingCards() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading today"
      className="flex flex-col gap-[2.4rem]"
    >
      <Card className="bg-surface-subtle h-[14rem] border-transparent motion-safe:animate-pulse" />
      <Card className="bg-surface-subtle h-[14rem] border-transparent motion-safe:animate-pulse" />
    </div>
  )
}

export default LoadingCards
