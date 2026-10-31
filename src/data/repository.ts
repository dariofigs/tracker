import type { SupabaseClient } from '@supabase/supabase-js'
import { createMemoryRepository } from '../demo/memoryRepository'
import { isDemo } from '../demo/mode'
import { supabase } from '../lib/supabase'
import { customOptionFromRow, entryFromRow, entryToRow, timedLogFromRow, timedLogToRow } from './mappers'
import type {
  CustomOption,
  CustomOptionKind,
  CustomOptionRow,
  Entry,
  EntryInput,
  EntryRow,
  TimedLog,
  TimedLogInput,
  TimedLogRow,
} from './types'

/** A Supabase error. `code` is the Postgres or PostgREST code, empty when there was no response. */
export class DataError extends Error {
  readonly code: string | undefined

  constructor(message: string, code: string | undefined) {
    super(message)
    this.name = 'DataError'
    this.code = code
  }
}

/** Throws on a Supabase error so callers (and the save queue) can classify it by code. */
function unwrap<T>(result: {
  data: T | null
  error: { message: string; code?: string } | null
}): T {
  if (result.error) throw new DataError(result.error.message, result.error.code)
  return result.data as T
}

/** PostgREST returns at most 1000 rows per request, so full-table reads go a page at a time. */
export const PAGE_SIZE = 1000

/** Reads every row of a query by asking for consecutive pages until one comes back short. */
async function fetchAllPages<T>(
  page: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string; code?: string } | null }>,
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const batch = unwrap(await page(from, from + PAGE_SIZE - 1))
    rows.push(...batch)
    if (batch.length < PAGE_SIZE) return rows
  }
}

/** Data access for entries and custom options. RLS limits every query to the signed-in user. */
export function createRepository(client: SupabaseClient) {
  return {
    /** Every entry, oldest first. For export, import checks and renaming a label across history. */
    async getAllEntries(): Promise<Entry[]> {
      const rows = await fetchAllPages<EntryRow>((from, to) =>
        client
          .from('entries')
          .select()
          .order('entry_date', { ascending: true })
          .order('period', { ascending: true })
          .range(from, to),
      )
      return rows.map(entryFromRow)
    },

    /** Day of the oldest entry (YYYY-MM-DD), or null when nothing has been logged. */
    async getEarliestEntryDate(): Promise<string | null> {
      const result = await client
        .from('entries')
        .select('entry_date')
        .order('entry_date', { ascending: true })
        .limit(1)
      return unwrap(result)[0]?.entry_date ?? null
    },

    /** The saved check-in switch time ("HH:mm"), or null when none is saved yet. */
    async getMorningCutoff(): Promise<string | null> {
      const result = await client.from('user_preferences').select('morning_cutoff').limit(1)
      return unwrap(result)[0]?.morning_cutoff ?? null
    },

    /** Saves the check-in switch time so every device uses the same one. */
    async setMorningCutoff(value: string): Promise<void> {
      const result = await client
        .from('user_preferences')
        .upsert({ morning_cutoff: value, updated_at: new Date().toISOString() })
      unwrap(result)
    },

    /** Every timed log, oldest first. */
    async listAllTimedLogs(): Promise<TimedLog[]> {
      const rows = await fetchAllPages<TimedLogRow>((from, to) =>
        client
          .from('timed_logs')
          .select()
          .order('occurred_at', { ascending: true })
          .order('id', { ascending: true })
          .range(from, to),
      )
      return rows.map(timedLogFromRow)
    },

    /** Every custom option of every kind, including hidden ones, in creation order. */
    async listAllCustomOptions(): Promise<CustomOption[]> {
      const rows = await fetchAllPages<CustomOptionRow>((from, to) =>
        client
          .from('custom_options')
          .select()
          .order('created_at', { ascending: true })
          .order('id', { ascending: true })
          .range(from, to),
      )
      return rows.map(customOptionFromRow)
    },

    /** Inserts or replaces the row for this day and period. Saving again edits instead of duplicating. */
    async upsertEntry(input: EntryInput): Promise<Entry> {
      const result = await client
        .from('entries')
        .upsert(entryToRow(input), { onConflict: 'user_id,entry_date,period' })
        .select()
        .single()
      return entryFromRow(unwrap(result))
    },

    /**
     * Saves several entries one row per request, in order. Use this instead of a single bulk upsert:
     * a bulk upsert fills any column missing from some rows with null, which breaks not-null columns.
     */
    async upsertEntries(inputs: EntryInput[]): Promise<Entry[]> {
      const saved: Entry[] = []
      for (const input of inputs) saved.push(await this.upsertEntry(input))
      return saved
    },

    /** Both AM and PM entries for one local day (YYYY-MM-DD), AM first. */
    async getEntriesForDate(date: string): Promise<Entry[]> {
      const result = await client
        .from('entries')
        .select()
        .eq('entry_date', date)
        .order('period', { ascending: true })
      return unwrap(result).map(entryFromRow)
    },

    /** Entries between two local days, inclusive, oldest first. */
    async getEntriesInRange(from: string, to: string): Promise<Entry[]> {
      const result = await client
        .from('entries')
        .select()
        .gte('entry_date', from)
        .lte('entry_date', to)
        .order('entry_date', { ascending: true })
        .order('period', { ascending: true })
      return unwrap(result).map(entryFromRow)
    },

    async deleteEntry(id: string): Promise<void> {
      const result = await client.from('entries').delete().eq('id', id)
      unwrap(result)
    },

    /** Timed logs are added, not merged: every call creates a new event. */
    async addTimedLog(input: TimedLogInput): Promise<TimedLog> {
      const result = await client.from('timed_logs').insert(timedLogToRow(input)).select().single()
      return timedLogFromRow(unwrap(result))
    },

    /**
     * Saves a timed log under an id made on the phone. Saving the same id again edits that row,
     * so a retry after a lost response can't create a second copy.
     */
    async upsertTimedLog(id: string, input: TimedLogInput): Promise<TimedLog> {
      const result = await client
        .from('timed_logs')
        .upsert({ id, ...timedLogToRow(input) }, { onConflict: 'id' })
        .select()
        .single()
      return timedLogFromRow(unwrap(result))
    },

    /** Timed logs with occurredAt in [from, to), oldest first. Use dayBounds() for one local day. */
    async listTimedLogs(from: Date, to: Date): Promise<TimedLog[]> {
      const result = await client
        .from('timed_logs')
        .select()
        .gte('occurred_at', from.toISOString())
        .lt('occurred_at', to.toISOString())
        .order('occurred_at', { ascending: true })
      return unwrap(result).map(timedLogFromRow)
    },

    async updateTimedLog(id: string, changes: Partial<TimedLogInput>): Promise<TimedLog> {
      const result = await client
        .from('timed_logs')
        .update(timedLogToRow(changes))
        .eq('id', id)
        .select()
        .single()
      return timedLogFromRow(unwrap(result))
    },

    async deleteTimedLog(id: string): Promise<void> {
      const result = await client.from('timed_logs').delete().eq('id', id)
      unwrap(result)
    },

    async listCustomOptions(kind: CustomOptionKind): Promise<CustomOption[]> {
      const result = await client
        .from('custom_options')
        .select()
        .eq('kind', kind)
        .order('created_at', { ascending: true })
      return unwrap(result).map(customOptionFromRow)
    },

    /** `hidden` adds the option already hidden, which is how a built-in choice is switched off. */
    async addCustomOption(
      kind: CustomOptionKind,
      label: string,
      hidden = false,
    ): Promise<CustomOption> {
      const result = await client
        .from('custom_options')
        .insert({ kind, label: label.trim(), ...(hidden && { hidden }) })
        .select()
        .single()
      return customOptionFromRow(unwrap(result))
    },

    /**
     * Rename and/or hide or unhide an option. There is no delete: old entries store the label as
     * text, so hiding keeps them readable and the option can be restored.
     */
    async updateCustomOption(
      id: string,
      changes: { label?: string; hidden?: boolean },
    ): Promise<CustomOption> {
      const patch = {
        ...(changes.label !== undefined && { label: changes.label.trim() }),
        ...(changes.hidden !== undefined && { hidden: changes.hidden }),
      }
      const result = await client.from('custom_options').update(patch).eq('id', id).select().single()
      return customOptionFromRow(unwrap(result))
    },

  }
}

export type Repository = ReturnType<typeof createRepository>

/** On /demo the data lives in memory and resets on reload; otherwise it is the Supabase account. */
export const repository: Repository = isDemo
  ? createMemoryRepository()
  : createRepository(supabase)
