import { describe, expect, it } from 'vitest'
import { createRepository } from './repository'
import { timedLogFromRow, timedLogToRow } from './mappers'
import type { TimedLogRow } from './types'
import { fakeClient } from '../test/fakeSupabase'
import { generateTimedSeed } from '../dev/seedData'

const row: TimedLogRow = {
  id: 't1',
  occurred_at: '2026-10-28T14:30:00.000Z',
  kind: 'exercise',
  pain: null,
  label: 'Walk',
  minutes: 40,
  effort: 3,
  note: null,
  created_at: '2026-10-28T14:31:00.000Z',
}

describe('timed log mappers', () => {
  it('maps a row to camelCase', () => {
    expect(timedLogFromRow(row)).toMatchObject({
      occurredAt: '2026-10-28T14:30:00.000Z',
      kind: 'exercise',
      label: 'Walk',
      minutes: 40,
      effort: 3,
      pain: null,
    })
  })

  it('leaves out fields that were not supplied', () => {
    expect(timedLogToRow({ occurredAt: '2026-10-28T14:30:00.000Z', kind: 'pain', pain: 6 })).toEqual({
      occurred_at: '2026-10-28T14:30:00.000Z',
      kind: 'pain',
      pain: 6,
    })
  })
})

describe('timed log repository', () => {
  it('inserts only the supplied fields and returns the saved log', async () => {
    const { client, calls } = fakeClient({ data: row, error: null })
    const saved = await createRepository(client).addTimedLog({
      occurredAt: '2026-10-28T14:30:00.000Z',
      kind: 'exercise',
      label: 'Walk',
      minutes: 40,
      effort: 3,
    })

    expect(calls).toContainEqual({
      method: 'insert',
      args: [
        {
          occurred_at: '2026-10-28T14:30:00.000Z',
          kind: 'exercise',
          label: 'Walk',
          minutes: 40,
          effort: 3,
        },
      ],
    })
    expect(saved.id).toBe('t1')
  })

  it('lists logs from the start of the range up to, not including, the end', async () => {
    const { client, calls } = fakeClient({ data: [row], error: null })
    const from = new Date(2026, 9, 28)
    const to = new Date(2026, 9, 29)
    await createRepository(client).listTimedLogs(from, to)

    expect(calls).toContainEqual({ method: 'gte', args: ['occurred_at', from.toISOString()] })
    expect(calls).toContainEqual({ method: 'lt', args: ['occurred_at', to.toISOString()] })
  })

  it('updates only the fields that changed', async () => {
    const { client, calls } = fakeClient({ data: row, error: null })
    await createRepository(client).updateTimedLog('t1', { minutes: 50 })

    expect(calls).toContainEqual({ method: 'update', args: [{ minutes: 50 }] })
  })
})

describe('generateTimedSeed', () => {
  const END = '2026-10-28'
  const latest = new Date(2026, 9, 30)
  const logs = generateTimedSeed(END, 60, undefined, latest)
  const hours = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000

  it('plants a pain rise 18–24 hours after hard sessions', () => {
    const exercises = logs.filter((l) => l.kind === 'exercise')
    const pains = logs.filter((l) => l.kind === 'pain')

    const after = (session: (typeof exercises)[number]) =>
      pains.find((p) => {
        const gap = hours(session.occurredAt, p.occurredAt)
        return gap >= 18 && gap <= 24
      })

    const average = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length
    const hard: number[] = []
    const light: number[] = []
    for (const session of exercises) {
      const reading = after(session)
      if (!reading?.pain) continue
      const isHard = (session.minutes ?? 0) >= 30 && (session.effort ?? 0) >= 3
      ;(isHard ? hard : light).push(reading.pain)
    }

    expect(hard.length).toBeGreaterThan(5)
    expect(light.length).toBeGreaterThan(5)
    expect(average(hard) - average(light)).toBeGreaterThan(1.5)
  })

  it('never dates a log after the latest allowed time', () => {
    expect(logs.every((l) => new Date(l.occurredAt) <= latest)).toBe(true)
  })
})
