import { Link } from 'react-router-dom'

type BackupReminderProps = {
  /** Whole days since the last backup (or since the first entry, if never backed up). */
  days: number
  neverBackedUp: boolean
  onSnooze: () => void
}

const focus =
  'focus-visible:outline-brand-sage focus-visible:outline-2 focus-visible:outline-offset-2'

/** Monthly nudge to export a copy of the data. Dismissible; reappears the next day. */
function BackupReminder({ days, neverBackedUp, onSnooze }: BackupReminderProps) {
  return (
    <aside
      aria-label="Backup reminder"
      className="rounded-card bg-clay-tint flex flex-col gap-[1.2rem] p-[1.6rem]"
    >
      <p className="text-body text-clay-text">
        {neverBackedUp
          ? 'You haven’t saved a backup yet. A copy of your history keeps it safe if your phone is lost.'
          : `It’s been ${days} days since your last backup.`}
      </p>
      <div className="flex flex-wrap items-center gap-[1.6rem]">
        <Link
          to="/settings"
          className={`min-touch text-body bg-brand-sage text-surface-card inline-flex items-center rounded-full px-[2.4rem] font-semibold ${focus}`}
        >
          Back up now
        </Link>
        <button
          type="button"
          onClick={onSnooze}
          className={`text-caption text-clay-text min-touch font-semibold ${focus}`}
        >
          Remind me later
        </button>
      </div>
    </aside>
  )
}

export default BackupReminder
