import type { Repository } from '../../data/repository'
import type { CustomOptionKind } from '../../data/types'
import { renameInEntry, timedLogsUsing, type OptionRow } from './optionsModel'

type Repo = Pick<
  Repository,
  | 'addCustomOption'
  | 'updateCustomOption'
  | 'getAllEntries'
  | 'listAllTimedLogs'
  | 'upsertEntries'
  | 'updateTimedLog'
>

/** Past records that use a label, found before a rename so the user can confirm the change. */
export async function findUsage(repo: Repo, kind: CustomOptionKind, label: string) {
  const [entries, logs] = await Promise.all([
    repo.getAllEntries(),
    repo.listAllTimedLogs(),
  ])
  return {
    entries: entries.filter((e) => renameInEntry(e, kind, label, label) !== null),
    timedLogs: timedLogsUsing(logs, kind, label),
  }
}

export async function hideOption(repo: Repo, kind: CustomOptionKind, row: OptionRow) {
  if (row.id) await repo.updateCustomOption(row.id, { hidden: true })
  else await repo.addCustomOption(kind, row.label, true)
}

export async function showOption(repo: Repo, row: OptionRow) {
  if (row.id) await repo.updateCustomOption(row.id, { hidden: false })
}

/**
 * Renames a choice and rewrites every past entry and timed log that used the old name, so history
 * and insights stay under one label. The choice changes first, then history; running the rename
 * again after an interruption finishes whatever is left.
 */
export async function renameOption(
  repo: Repo,
  kind: CustomOptionKind,
  row: OptionRow,
  to: string,
  onProgress?: (done: number, total: number) => void,
) {
  const label = to.trim()
  if (row.source === 'custom' && row.id) {
    await repo.updateCustomOption(row.id, { label })
  } else {
    await repo.addCustomOption(kind, label)
    if (row.id) await repo.updateCustomOption(row.id, { hidden: true })
    else await repo.addCustomOption(kind, row.label, true)
  }

  const [entries, logs] = await Promise.all([
    repo.getAllEntries(),
    repo.listAllTimedLogs(),
  ])
  const saves = entries.flatMap((e) => renameInEntry(e, kind, row.label, label) ?? [])
  const timed = timedLogsUsing(logs, kind, row.label)
  const total = saves.length + timed.length
  let done = 0
  onProgress?.(done, total)

  // One row per request, so a partial run leaves complete rows rather than half-written ones.
  for (const save of saves) {
    await repo.upsertEntries([save])
    onProgress?.(++done, total)
  }
  for (const log of timed) {
    await repo.updateTimedLog(log.id, { label })
    onProgress?.(++done, total)
  }
}
