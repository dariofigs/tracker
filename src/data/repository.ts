import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { customOptionFromRow, entryFromRow, entryToRow } from './mappers'
import type { CustomOption, CustomOptionKind, Entry, EntryInput } from './types'

/** Throws on a Supabase error so callers (and the failed-save queue in 2.4) can catch it. */
function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message)
  return result.data as T
}

/** Data access for entries and custom options. RLS limits every query to the signed-in user. */
export function createRepository(client: SupabaseClient) {
  return {
    /** Inserts or replaces the row for this day and period. Saving again edits instead of duplicating. */
    async upsertEntry(input: EntryInput): Promise<Entry> {
      const result = await client
        .from('entries')
        .upsert(entryToRow(input), { onConflict: 'user_id,entry_date,period' })
        .select()
        .single()
      return entryFromRow(unwrap(result))
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

    async listCustomOptions(kind: CustomOptionKind): Promise<CustomOption[]> {
      const result = await client
        .from('custom_options')
        .select()
        .eq('kind', kind)
        .order('created_at', { ascending: true })
      return unwrap(result).map(customOptionFromRow)
    },

    async addCustomOption(kind: CustomOptionKind, label: string): Promise<CustomOption> {
      const result = await client
        .from('custom_options')
        .insert({ kind, label: label.trim() })
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

export const repository = createRepository(supabase)
