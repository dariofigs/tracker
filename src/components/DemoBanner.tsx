import { useState } from 'react'
import { isDemo } from '../demo/mode'

/**
 * Slim notice at the top of every /demo screen. Dismissing lasts until the page is reloaded.
 * `show` overrides the route check, for the /dev gallery and tests.
 */
function DemoBanner({ show }: { show?: boolean }) {
  const [dismissed, setDismissed] = useState(false)
  if (!(show ?? isDemo) || dismissed) return null

  return (
    <div
      role="status"
      className="bg-clay-tint text-clay-text text-caption flex items-center justify-center gap-[1.2rem] px-[1.6rem] py-[0.8rem] text-center font-semibold"
    >
      <span>Demo with sample data. Nothing you log is saved.</span>
      <button type="button" onClick={() => setDismissed(true)} className="min-touch underline">
        Dismiss
      </button>
    </div>
  )
}

export default DemoBanner
