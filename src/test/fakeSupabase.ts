import type { SupabaseClient } from '@supabase/supabase-js'

export interface Call {
  method: string
  args: unknown[]
}

const CHAIN_METHODS = [
  'from',
  'select',
  'upsert',
  'insert',
  'update',
  'delete',
  'eq',
  'gte',
  'lt',
  'lte',
  'order',
  'range',
  'limit',
  'single',
] as const

/** Records every query-builder call and resolves to the given result, like the real chainable client. */
export function fakeClient(result: { data: unknown; error: { message: string } | null }) {
  const calls: Call[] = []
  const builder: Record<string, unknown> = {}
  for (const method of CHAIN_METHODS) {
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
