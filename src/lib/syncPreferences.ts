import { useEffect } from 'react'
import { repository } from '../data/repository'
import { DEFAULT_MORNING_CUTOFF } from './dates'
import { isValidCutoff, preferences, type PreferencesStore } from './preferences'

type CutoffRepository = {
  getMorningCutoff: () => Promise<string | null>
  setMorningCutoff: (value: string) => Promise<void>
}

/**
 * Makes the check-in switch time follow the account. The saved value wins on this device;
 * with nothing saved yet, a time already changed here is uploaded so it isn't lost.
 * Any failure (offline, table not created yet) leaves this device's own value in place.
 */
export async function syncMorningCutoff(
  repo: CutoffRepository,
  store: PreferencesStore,
): Promise<void> {
  try {
    const saved = await repo.getMorningCutoff()
    if (isValidCutoff(saved)) {
      if (saved !== store.get().morningCutoff) store.set({ morningCutoff: saved })
    } else if (store.get().morningCutoff !== DEFAULT_MORNING_CUTOFF) {
      await repo.setMorningCutoff(store.get().morningCutoff)
    }
  } catch {
    // Keep the local value.
  }
}

/** Runs the sync once per sign-in. */
export function usePreferencesSync(signedIn: boolean): void {
  useEffect(() => {
    if (signedIn) void syncMorningCutoff(repository, preferences)
  }, [signedIn])
}
