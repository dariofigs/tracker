import { useState } from 'react'
import { BottomSheet, Button } from '../../components/ui'
import type { CustomOptionKind } from '../../data/types'
import { KIND_NOUN, validateLabel, type OptionRow } from './optionsModel'

export type RenameStage =
  | { step: 'edit' }
  | { step: 'checking' }
  | { step: 'confirm'; entries: number; timedLogs: number }
  | { step: 'working'; done: number; total: number }
  | { step: 'error'; message: string }

type RenameSheetProps = {
  kind: CustomOptionKind
  row: OptionRow
  rows: OptionRow[]
  stage: RenameStage
  onClose: () => void
  /** Called with the new name; the parent looks up how much history uses the old one. */
  onReview: (label: string) => void
  onConfirm: () => void
}

/** Rename flow: type the name, see how many past records change, confirm. */
function RenameSheet({
  kind,
  row,
  rows,
  stage,
  onClose,
  onReview,
  onConfirm,
}: RenameSheetProps) {
  const [text, setText] = useState(row.label)
  const [problem, setProblem] = useState<string | null>(null)
  const noun = KIND_NOUN[kind]
  const working = stage.step === 'working' || stage.step === 'checking'

  function review() {
    const found = validateLabel(kind, text, rows, row.label)
    setProblem(found)
    if (!found) onReview(text.trim())
  }

  return (
    <BottomSheet
      open
      onClose={working ? () => {} : onClose}
      title={`Rename ${noun}`}
      footer={
        <div className="flex gap-[1.2rem]">
          <Button variant="secondary" onClick={onClose} disabled={working}>
            Cancel
          </Button>
          {(stage.step === 'edit' || stage.step === 'error') && (
            <Button onClick={review} className="flex-1">
              Review
            </Button>
          )}
          {stage.step === 'confirm' && (
            <Button onClick={onConfirm} className="flex-1">
              Rename
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-[1.2rem]">
        <input
          type="text"
          aria-label={`New name for ${row.label}`}
          value={text}
          maxLength={40}
          disabled={stage.step !== 'edit' && stage.step !== 'error'}
          onChange={(e) => setText(e.target.value)}
          className="min-touch bg-surface-subtle text-body text-text-primary focus-visible:outline-brand-sage rounded-full px-[1.6rem] focus-visible:outline-2"
        />
        {problem && (
          <p role="alert" className="text-caption text-flare-plum">
            {problem}
          </p>
        )}
        {stage.step === 'checking' && (
          <p className="text-body text-text-muted">Checking your history…</p>
        )}
        {stage.step === 'confirm' && (
          <p className="text-body">
            {stage.entries + stage.timedLogs === 0
              ? `No past records use “${row.label}”.`
              : `This also changes “${row.label}” to “${text.trim()}” on ${stage.entries} check-in${
                  stage.entries === 1 ? '' : 's'
                }${stage.timedLogs ? ` and ${stage.timedLogs} timed log${stage.timedLogs === 1 ? '' : 's'}` : ''}, so your insights stay together.`}
          </p>
        )}
        {stage.step === 'working' && (
          <p role="status" className="text-body text-text-muted">
            Updating {stage.done} of {stage.total}…
          </p>
        )}
        {stage.step === 'error' && (
          <p role="alert" className="text-caption text-flare-plum">
            {stage.message}
          </p>
        )}
      </div>
    </BottomSheet>
  )
}

export default RenameSheet
