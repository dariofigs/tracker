import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '../../../components/ui'
import { repository } from '../../../data/repository'
import { preferences } from '../../../lib/preferences'
import { loadAllData } from './exportActions'
import ImportPreview, { type ImportStage } from './ImportPreview'
import type { BackupFile } from './backupFile'
import {
  applyImport,
  importSize,
  parseBackup,
  planImport,
  type ImportPlan,
} from './importPlan'

/** Choose a backup file, review what it would change, then restore. */
function ImportFlow() {
  const input = useRef<HTMLInputElement>(null)
  const [reading, setReading] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [backup, setBackup] = useState<BackupFile | null>(null)
  const [plan, setPlan] = useState<ImportPlan | null>(null)
  const overwriteChoice = useRef(false)
  const [stage, setStage] = useState<ImportStage>({ step: 'preview' })

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setProblem(null)
    setReading(true)
    try {
      const parsed = parseBackup(await file.text())
      if (!parsed.ok) {
        setProblem(parsed.error)
        return
      }
      const nextPlan = planImport(parsed.backup, await loadAllData())
      setStage({ step: 'preview' })
      setBackup(parsed.backup)
      setPlan(nextPlan)
    } catch {
      setProblem(
        'Couldn’t read that file or check your saved data. Check your connection and try again.',
      )
    } finally {
      setReading(false)
    }
  }

  async function runImport(overwrite: boolean) {
    if (!plan) return
    overwriteChoice.current = overwrite
    setStage({ step: 'working', done: 0, total: importSize(plan, overwrite) })
    try {
      await applyImport(repository, plan, overwrite, (done, total) =>
        setStage({ step: 'working', done, total }),
      )
      if (plan.morningCutoff) preferences.set({ morningCutoff: plan.morningCutoff })
      setStage({ step: 'done', saved: importSize(plan, overwrite) })
    } catch {
      setStage({
        step: 'error',
        message:
          'Stopped part-way. Nothing is lost. Try again to finish; rows already saved are skipped.',
      })
      // Re-plan against what is saved now, so a retry only sends what is left (adding an option twice would duplicate it).
      try {
        if (backup) setPlan(planImport(backup, await loadAllData()))
      } catch {
        // Offline: keep the old plan; the retry will fail again with the same message.
      }
    }
  }

  return (
    <div className="flex flex-col gap-[1.2rem]">
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label="Backup file"
        tabIndex={-1}
        onChange={onFile}
      />
      <Button
        variant="secondary"
        disabled={reading}
        onClick={() => input.current?.click()}
      >
        {reading ? 'Reading file…' : 'Restore from backup file'}
      </Button>
      {problem && (
        <p role="alert" className="text-body-sm text-flare-plum">
          {problem}
        </p>
      )}
      {plan && (
        <ImportPreview
          plan={plan}
          stage={stage}
          onClose={() => setPlan(null)}
          onImport={runImport}
          onRetry={() => runImport(overwriteChoice.current)}
        />
      )}
    </div>
  )
}

export default ImportFlow
