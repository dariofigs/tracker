import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createRepository } from './repository'
import { entryFromRow, entryToRow } from './mappers'
import type { EntryInput, EntryRow } from './types'

interface Call {
  method: string
  args: unknown[]
}

/** Records every query-builder call and resolves to the given result, like the real chainable client. */
function fakeClient(result: { data: unknown; error: { message: string } | null }) {
  const calls: Call[] = []
  const builder: Record<string, unknown> = {}
  for (const method of [
    'from',
    'select',
    'upsert',
    'insert',
    'update',
    'delete',
    'eq',
    'gte',
    'lte',
    'order',
    'single',
  ]) {
    builder[method] = (...args: unknown[]) => {
      calls.push({ method, args })
      return builder
    }
  }
  builder.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject)
  const client = { from: builder.from } as unknown as SupabaseClient
  return { client, calls }
}

const amRow: EntryRow = {
  id: 'e1',
  entry_date: '2026-10-28',
  period: 'AM',
  waking_pain: 4,
  sleep_hours: '7.5' as unknown as number,
  sleep_quality: 3,
  starting_capacity: 60,
  end_pain: null,
  exercise: null,
  activities: [],
  symptoms: ['headache'],
  stress: null,
  remaining_capacity: null,
  note: null,
  created_at: '2026-10-28T07:00:00Z',
  updated_at: '2026-10-28T07:00:00Z',
}

describe('entry mappers', () => {
  it('maps a database row to camelCase and coerces numeric strings', () => {
    const entry = entryFromRow(amRow)
    expect(entry.entryDate).toBe('2026-10-28')
    expect(entry.wakingPain).toBe(4)
    expect(entry.sleepHours).toBe(7.5)
    expect(entry.startingCapacity).toBe(60)
    expect(entry.symptoms).toEqual(['headache'])
  })

  it('leaves out fields the caller did not supply', () => {
    const row = entryToRow({ entryDate: '2026-10-28', period: 'PM', endPain: 3 })
    expect(row).toEqual({ entry_date: '2026-10-28', period: 'PM', end_pain: 3 })
  })

  it('keeps explicit nulls so a field can be cleared on purpose', () => {
    const row = entryToRow({ entryDate: '2026-10-28', period: 'AM', sleepHours: null })
    expect(row).toEqual({ entry_date: '2026-10-28', period: 'AM', sleep_hours: null })
  })
})

describe('createRepository', () => {
  it('upserts on date, period and user, and returns the saved entry', async () => {
    const { client, calls } = fakeClient({ data: amRow, error: null })
    const repo = createRepository(client)
    const input: EntryInput = { entryDate: '2026-10-28', period: 'AM', wakingPain: 4 }

    const saved = await repo.upsertEntry(input)

    expect(calls[0]).toEqual({ method: 'from', args: ['entries'] })
    expect(calls[1]).toEqual({
      method: 'upsert',
      args: [expect.objectContaining({ entry_date: '2026-10-28', waking_pain: 4 }), {
        onConflict: 'user_id,entry_date,period',
      }],
    })
    expect(saved.id).toBe('e1')
  })

  it('filters by date for getEntriesForDate', async () => {
    const { client, calls } = fakeClient({ data: [amRow], error: null })
    const entries = await createRepository(client).getEntriesForDate('2026-10-28')

    expect(calls).toContainEqual({ method: 'eq', args: ['entry_date', '2026-10-28'] })
    expect(entries).toHaveLength(1)
  })

  it('filters both ends of the range for getEntriesInRange', async () => {
    const { client, calls } = fakeClient({ data: [], error: null })
    await createRepository(client).getEntriesInRange('2026-10-01', '2026-10-31')

    expect(calls).toContainEqual({ method: 'gte', args: ['entry_date', '2026-10-01'] })
    expect(calls).toContainEqual({ method: 'lte', args: ['entry_date', '2026-10-31'] })
  })

  it('throws the Supabase message when a query fails', async () => {
    const { client } = fakeClient({ data: null, error: { message: 'connection dropped' } })
    await expect(createRepository(client).deleteEntry('e1')).rejects.toThrow('connection dropped')
  })

  it('trims labels when adding a custom option', async () => {
    const { client, calls } = fakeClient({
      data: {
        id: 'o1',
        kind: 'symptom',
        label: 'Brain fog',
        hidden: false,
        created_at: '2026-10-28T07:00:00Z',
      },
      error: null,
    })
    const option = await createRepository(client).addCustomOption('symptom', '  Brain fog ')

    expect(calls).toContainEqual({
      method: 'insert',
      args: [{ kind: 'symptom', label: 'Brain fog' }],
    })
    expect(option.label).toBe('Brain fog')
  })
})
