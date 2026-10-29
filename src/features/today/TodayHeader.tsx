import { formatHeaderDate, greetingFor } from './headerText'

// Single-user app; a Settings field can replace this later.
const NAME = 'Darío'

function TodayHeader({ now = new Date(), name = NAME }: { now?: Date; name?: string }) {
  return (
    <header className="pt-[2.4rem]">
      <p className="text-micro text-text-muted font-semibold uppercase">
        {formatHeaderDate(now)}
      </p>
      <h1 className="text-screen mt-[0.4rem]">
        {greetingFor(now)}, {name}
      </h1>
    </header>
  )
}

export default TodayHeader
