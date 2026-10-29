import { useSyncExternalStore } from 'react'
import { saveQueue, type SaveStatus } from '../data/saveQueue'

/** Current save state for the UI: saving, saved, or not saved yet, plus how many entries are waiting. */
export function useSaveStatus(): SaveStatus {
  return useSyncExternalStore(
    (listener) => saveQueue.subscribe(listener),
    () => saveQueue.getStatus(),
  )
}
