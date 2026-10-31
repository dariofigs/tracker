import { isDemo } from '../../demo/mode'
import { usePreferences } from '../../lib/preferences'
import { formatHeaderDate, greetingFor } from './headerText'

// The demo greets with a made-up name rather than the owner's.
const DEMO_NAME = 'Demo'

function TodayHeader({ now = new Date(), name }: { now?: Date; name?: string }) {
  const saved = usePreferences().name.trim()
  const shown = name ?? (saved || (isDemo ? DEMO_NAME : ''))
  return (
    <header className="pt-[2.4rem]">
      <p className="text-micro text-text-muted font-semibold">{formatHeaderDate(now)}</p>
      <h1 className="text-screen mt-[0.4rem] leading-[1.05]">
        {greetingFor(now)}
        {shown && `, ${shown}`}
      </h1>
    </header>
  )
}

export default TodayHeader
