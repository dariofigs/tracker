import { BottomSheet, Button } from '../../components/ui'
import { saveQueue } from '../../data/saveQueue'
import type { Period } from '../../data/types'
import { todayString } from '../../lib/dates'
import EveningForm from './EveningForm'
import { sheetTitle, toEntryInput } from './formModel'
import MorningForm from './MorningForm'
import NoteField from './NoteField'
import { useCheckinOptions } from './options'
import { useCheckinForm } from './useCheckinForm'

type CheckinSheetProps = {
  period: Period
  /** Local day, YYYY-MM-DD. Defaults to today. */
  date?: string
  onClose: () => void
}

/**
 * The check-in sheet. Save hands the entry to the save queue and closes straight away: the queue
 * keeps it on the phone and retries, and the Today screen shows if it hasn't gone through yet.
 */
function CheckinSheet({ period, date = todayString(), onClose }: CheckinSheetProps) {
  const { form, patch, editing, ready } = useCheckinForm(period, date)
  const { options, addOption } = useCheckinOptions()

  function save() {
    void saveQueue.save(toEntryInput(date, period, form))
    onClose()
  }

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={sheetTitle(period, date, editing)}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="h-[5rem]">
            Cancel
          </Button>
          <Button fullWidth onClick={save} disabled={!ready}>
            Save Entry
          </Button>
        </>
      }
    >
      {ready ? (
        <div className="space-y-[3.2rem] pb-[0.8rem]">
          {period === 'AM' ? (
            <MorningForm form={form} onChange={patch} options={options} onAddOption={addOption} />
          ) : (
            <EveningForm form={form} onChange={patch} options={options} onAddOption={addOption} />
          )}
          <NoteField value={form.note} onChange={(note) => patch({ note })} />
        </div>
      ) : (
        <p role="status" className="text-body text-text-muted pb-[1.6rem]">
          Loading…
        </p>
      )}
    </BottomSheet>
  )
}

export default CheckinSheet
