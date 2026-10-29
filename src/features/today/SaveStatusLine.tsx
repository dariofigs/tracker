import type { SaveStatus } from '../../data/saveQueue'
import { saveMessage } from './saveMessage'

function SaveStatusLine({ status }: { status: SaveStatus }) {
  const message = saveMessage(status)
  const warn = status.state !== 'saving'

  return (
    <div role="status" aria-live="polite">
      {message && (
        <p
          className={`text-body-sm rounded-tile px-[1.2rem] py-[0.8rem] font-semibold ${
            warn ? 'bg-clay-tint text-accent-clay' : 'bg-surface-subtle text-text-muted'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default SaveStatusLine
