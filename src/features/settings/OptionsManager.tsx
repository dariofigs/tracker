import { useCallback, useEffect, useState } from 'react'
import { SegmentedControl } from '../../components/ui'
import { repository } from '../../data/repository'
import type { CustomOption, CustomOptionKind } from '../../data/types'
import LoadErrorCard from '../today/LoadErrorCard'
import OptionsList from './OptionsList'
import { findUsage, hideOption, renameOption, showOption } from './optionsActions'
import { buildOptionRows, type OptionRow } from './optionsModel'
import RenameSheet, { type RenameStage } from './RenameSheet'

const KINDS: { value: CustomOptionKind; label: string }[] = [
  { value: 'symptom', label: 'Symptoms' },
  { value: 'activity', label: 'Activities' },
  { value: 'exercise_type', label: 'Exercise' },
  { value: 'pain_area', label: 'Body' },
]

type Renaming = { row: OptionRow; to: string | null; stage: RenameStage }

/** Settings section for the user's own symptoms, activities, exercise types and body areas. */
function OptionsManager() {
  const [kind, setKind] = useState<CustomOptionKind>('symptom')
  const [custom, setCustom] = useState<CustomOption[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<Renaming | null>(null)

  const load = useCallback(async () => {
    try {
      setCustom(await repository.listAllCustomOptions())
      setLoadFailed(false)
    } catch {
      setLoadFailed(true)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void load()
  }, [load])

  /** Runs a change, then reloads the list. A failure keeps the list as it was and says so. */
  async function change(action: () => Promise<void>) {
    setBusy(true)
    setActionError(null)
    try {
      await action()
    } catch {
      setActionError('That didn’t save. Check your connection and try again.')
    }
    await load()
    setBusy(false)
  }

  if (loadFailed) return <LoadErrorCard what="your options" onRetry={load} />
  if (!custom) return <p className="text-body text-text-muted">Loading your options…</p>

  const rows = buildOptionRows(kind, custom)

  async function review(label: string) {
    if (!renaming) return
    setRenaming({ ...renaming, to: label, stage: { step: 'checking' } })
    try {
      const usage = await findUsage(repository, kind, renaming.row.label)
      setRenaming({
        ...renaming,
        to: label,
        stage: {
          step: 'confirm',
          entries: usage.entries.length,
          timedLogs: usage.timedLogs.length,
        },
      })
    } catch {
      setRenaming({
        ...renaming,
        stage: { step: 'error', message: 'Couldn’t check your history. Try again.' },
      })
    }
  }

  async function confirmRename() {
    if (!renaming?.to) return
    const { row, to } = renaming
    setRenaming({ row, to, stage: { step: 'working', done: 0, total: 0 } })
    try {
      await renameOption(repository, kind, row, to, (done, total) =>
        setRenaming({ row, to, stage: { step: 'working', done, total } }),
      )
      setRenaming(null)
      await load()
    } catch {
      setRenaming({
        row,
        to,
        stage: {
          step: 'error',
          message:
            'Stopped part-way. Nothing is lost; tap Review and Rename again to finish.',
        },
      })
      await load()
    }
  }

  return (
    <div className="flex flex-col gap-[1.6rem]">
      <SegmentedControl
        label="Kind of option"
        options={KINDS}
        value={kind}
        onChange={setKind}
      />
      <OptionsList
        kind={kind}
        rows={rows}
        busy={busy}
        onAdd={(label) =>
          change(() => repository.addCustomOption(kind, label).then(() => {}))
        }
        onRename={(row) => setRenaming({ row, to: null, stage: { step: 'edit' } })}
        onToggleHidden={(row) =>
          change(() =>
            row.hidden ? showOption(repository, row) : hideOption(repository, kind, row),
          )
        }
      />
      {actionError && (
        <p role="alert" className="text-body-sm text-flare-plum">
          {actionError}
        </p>
      )}
      {renaming && (
        <RenameSheet
          key={renaming.row.label}
          kind={kind}
          row={renaming.row}
          rows={rows}
          stage={renaming.stage}
          onClose={() => setRenaming(null)}
          onReview={review}
          onConfirm={confirmRename}
        />
      )}
    </div>
  )
}

export default OptionsManager
