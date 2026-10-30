import { Link } from 'react-router-dom'

type BackupReminderProps = {
  /** Whole days since the last backup (or since the first entry, if never backed up). */
  days: number
  neverBackedUp: boolean
  onSnooze: () => void
}

/** Monthly nudge to export a copy of the data. Dismissible; reappears after a week. */
function BackupReminder({ days, neverBackedUp, onSnooze }: BackupReminderProps) {
  return (
    <aside
      aria-label="Backup reminder"
      className="rounded-card bg-clay-tint flex flex-col gap-[1.2rem] p-[1.6rem]"
    >
      <p className="text-body">
        {neverBackedUp
          ? 'You haven’t saved a backup yet. A copy of your history keeps it safe if your phone is lost.'
          : `It’s been ${days} days since your last backup.`}
      </p>
      <div className="flex flex-wrap items-center gap-[1.6rem]">
        <Link
          to="/settings"
          className="text-body-sm text-brand-sage focus-visible:outline-brand-sage min-touch inline-flex items-center font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Back up now
        </Link>
        <button
          type="button"
          onClick={onSnooze}
          className="text-body-sm text-text-muted focus-visible:outline-brand-sage min-touch font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Remind me later
        </button>
      </div>
    </aside>
  )
}

export default BackupReminder
