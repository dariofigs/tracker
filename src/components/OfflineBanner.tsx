import { useOnline } from '../hooks/useOnline'

/**
 * Slim notice shown while the phone has no connection. Entries still queue and save later.
 * `offline` overrides the browser's state, for the /dev gallery and tests.
 */
function OfflineBanner({ offline }: { offline?: boolean }) {
  const online = useOnline()
  if (!(offline ?? !online)) return null

  return (
    <div
      role="status"
      className="bg-clay-tint text-text-primary text-body-sm px-[1.6rem] py-[0.8rem] text-center font-semibold"
    >
      You’re offline. Entries will save when you’re back online.
    </div>
  )
}

export default OfflineBanner
