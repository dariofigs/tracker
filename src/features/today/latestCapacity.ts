import type { Entry } from '../../data/types'

export type CapacityReading = { value: number; source: 'evening' | 'morning' }

/** Newest capacity reading today: the evening's remaining, else the morning's starting. */
export function latestCapacity(
  morning: Entry | null,
  evening: Entry | null,
): CapacityReading | null {
  if (evening?.remainingCapacity != null) {
    return { value: evening.remainingCapacity, source: 'evening' }
  }
  if (morning?.startingCapacity != null) {
    return { value: morning.startingCapacity, source: 'morning' }
  }
  return null
}
