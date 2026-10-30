import { BottomSheet, Button } from '../../../components/ui'
import { importSize, planIsEmpty, type ImportPlan } from './importPlan'

export type ImportStage =
  | { step: 'preview' }
  | { step: 'working'; done: number; total: number }
  | { step: 'done'; saved: number }
  | { step: 'error'; message: string }

type ImportPreviewProps = {
  plan: ImportPlan
  stage: ImportStage
  onClose: () => void
  /** `overwrite` replaces check-ins whose saved version differs from the file. */
  onImport: (overwrite: boolean) => void
  /** Repeats the last choice after a failure. */
  onRetry: () => void
}

function count(n: number, noun: string) {
  return `${n} ${noun}${n === 1 ? '' : 's'}`
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-[1.6rem]">
      <dt className="text-body text-text-muted">{label}</dt>
      <dd className="text-body font-semibold">{value}</dd>
    </div>
  )
}

/** What a backup file would change, shown before anything is saved. */
function ImportPreview({ plan, stage, onClose, onImport, onRetry }: ImportPreviewProps) {
  const changed = plan.entries.changed
  const busy = stage.step === 'working'
  const nothingToDo = planIsEmpty(plan)

  return (
    <BottomSheet
      open
      onClose={busy ? () => {} : onClose}
      title="Restore from backup"
      footer={
        <div className="flex flex-col gap-[1.2rem]">
          {stage.step === 'preview' && !nothingToDo && changed.length > 0 && (
            <Button fullWidth onClick={() => onImport(true)}>
              Import and replace {count(changed.length, 'check-in')}
            </Button>
          )}
          {stage.step === 'preview' && !nothingToDo && (
            <Button
              fullWidth
              variant={changed.length > 0 ? 'secondary' : 'primary'}
              onClick={() => onImport(false)}
              disabled={importSize(plan, false) === 0}
            >
              {changed.length > 0 ? 'Import new only' : 'Import'}
            </Button>
          )}
          {stage.step === 'error' && (
            <Button fullWidth onClick={onRetry}>
              Try again
            </Button>
          )}
          <Button fullWidth variant="secondary" onClick={onClose} disabled={busy}>
            {stage.step === 'done' || nothingToDo ? 'Close' : 'Cancel'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-[1.6rem]">
        {stage.step === 'preview' && nothingToDo && (
          <p className="text-body">
            Everything in this file is already saved exactly as it is. Nothing to import.
          </p>
        )}
        {stage.step === 'preview' && !nothingToDo && (
          <>
            <dl className="flex flex-col gap-[0.8rem]">
              <Line label="New check-ins" value={String(plan.entries.added.length)} />
              <Line
                label="Already saved, same"
                value={String(plan.entries.unchanged.length)}
              />
              <Line label="Saved but different" value={String(changed.length)} />
              {(plan.timedLogs.added.length > 0 || plan.timedLogs.changed.length > 0) && (
                <Line
                  label="Timed logs to add or replace"
                  value={String(
                    plan.timedLogs.added.length + plan.timedLogs.changed.length,
                  )}
                />
              )}
              {plan.options.added.length > 0 && (
                <Line label="Options to add" value={String(plan.options.added.length)} />
              )}
            </dl>
            {changed.length > 0 && (
              <div className="flex flex-col gap-[0.8rem]">
                <p className="text-body">
                  These days are saved differently now. Replacing them uses the backup’s
                  version.
                </p>
                <ul className="text-body-sm text-text-muted max-h-[16rem] overflow-y-auto">
                  {changed.map(({ incoming }) => (
                    <li key={`${incoming.entryDate}|${incoming.period}`}>
                      {incoming.entryDate} {incoming.period}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        {stage.step === 'working' && (
          <p role="status" className="text-body text-text-muted">
            Saving {stage.done} of {stage.total}…
          </p>
        )}
        {stage.step === 'done' && (
          <p role="status" className="text-body">
            Done. {count(stage.saved, 'item')} restored.
          </p>
        )}
        {stage.step === 'error' && (
          <p role="alert" className="text-body-sm text-flare-plum">
            {stage.message}
          </p>
        )}
      </div>
    </BottomSheet>
  )
}

export default ImportPreview
