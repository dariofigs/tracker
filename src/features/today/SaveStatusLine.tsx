import { useEffect, useRef, useState } from 'react'
import type { SaveStatus } from '../../data/saveQueue'
import { saveMessage } from './saveMessage'

/** How long the quiet "Saved" confirmation stays up. */
const SAVED_VISIBLE_MS = 2500

function SaveStatusLine({ status }: { status: SaveStatus }) {
  const [justSaved, setJustSaved] = useState(false)
  const previous = useRef(status.state)

  // Say "Saved" briefly when a save finishes, not whenever the screen opens already saved.
  useEffect(() => {
    const was = previous.current
    previous.current = status.state
    if (status.state !== 'saved' || was === 'saved') return
    setJustSaved(true)
    const timer = setTimeout(() => setJustSaved(false), SAVED_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [status.state])

  const message =
    saveMessage(status) ?? (justSaved && status.state === 'saved' ? 'Saved' : null)
  const warn = status.state !== 'saving' && status.state !== 'saved'

  return (
    <div role="status" aria-live="polite">
      {message && (
        <p
          className={`text-body-sm rounded-tile px-[1.2rem] py-[0.8rem] font-semibold ${
            warn ? 'bg-clay-tint text-clay-text' : 'bg-surface-subtle text-text-muted'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default SaveStatusLine
