import { useState } from 'react'
import { Button } from '../../components/ui'
import { usePreferences } from '../../lib/preferences'
import { exportCsv, exportJson } from './backup/exportActions'
import ImportFlow from './backup/ImportFlow'

type Busy = null | 'json' | 'csv'

function lastBackupText(lastExportAt: string | null): string {
  if (!lastExportAt) return 'You haven’t backed up yet.'
  const date = new Date(lastExportAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `Last backup: ${date}.`
}

/** Export for restore (JSON) and for spreadsheets (CSV), and restoring from a file. */
function BackupCard() {
  const { lastExportAt } = usePreferences()
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  async function run(kind: Exclude<Busy, null>) {
    setBusy(kind)
    setError(null)
    setNote(null)
    try {
      const result = await (kind === 'json' ? exportJson() : exportCsv())
      if (result.saved)
        setNote(`Exported ${result.entries} check-in${result.entries === 1 ? '' : 's'}.`)
    } catch {
      setError('Couldn’t export. Check your connection and try again.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-[1.6rem]">
      <p className="text-body text-text-muted">{lastBackupText(lastExportAt)}</p>
      <div className="flex flex-col gap-[1.2rem]">
        <Button disabled={busy !== null} onClick={() => run('json')}>
          {busy === 'json' ? 'Exporting…' : 'Export backup (JSON)'}
        </Button>
        <Button variant="secondary" disabled={busy !== null} onClick={() => run('csv')}>
          {busy === 'csv' ? 'Exporting…' : 'Export for spreadsheet (CSV)'}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-caption text-flare-plum">
          {error}
        </p>
      )}
      {note && (
        <p role="status" className="text-caption text-brand-sage">
          {note}
        </p>
      )}
      <ImportFlow />
    </div>
  )
}

export default BackupCard
