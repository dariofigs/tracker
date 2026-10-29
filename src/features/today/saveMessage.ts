import type { SaveStatus } from '../../data/saveQueue'

/** What the user should read for each queue state; null means nothing worth saying. */
export function saveMessage({ state, pending, failed }: SaveStatus): string | null {
  switch (state) {
    case 'saving':
      return 'Saving…'
    case 'not_saved':
      return pending === 1
        ? 'Not saved yet. Retrying soon.'
        : `${pending} entries not saved yet. Retrying soon.`
    case 'needs_attention':
      return failed === 1
        ? 'An entry couldn’t be saved. It’s kept on your phone.'
        : `${failed} entries couldn’t be saved. They’re kept on your phone.`
    case 'paused':
      return 'Sign in again to save your entries.'
    default:
      return null
  }
}
