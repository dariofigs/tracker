import { describe, expect, it, vi } from 'vitest'
import type { Entry } from '../../data/types'
import { hideOption, renameOption } from './optionsActions'

const entry = (over: Partial<Entry>): Entry => ({
  id: 'e',
  entryDate: '2026-10-01',
  period: 'PM',
  note: null,
  createdAt: '',
  updatedAt: '',
  ...over,
})

function fakeRepo(entries: Entry[] = []) {
  return {
    addCustomOption: vi.fn().mockResolvedValue({}),
    updateCustomOption: vi.fn().mockResolvedValue({}),
    getAllEntries: vi.fn().mockResolvedValue(entries),
    listAllTimedLogs: vi.fn().mockResolvedValue([
      { id: 't1', kind: 'activity', label: 'Walk' },
      { id: 't2', kind: 'symptom', label: 'Walk' },
    ]),
    upsertEntries: vi.fn().mockResolvedValue([]),
    updateTimedLog: vi.fn().mockResolvedValue({}),
  }
}

describe('hideOption', () => {
  it('hides a custom option in place', async () => {
    const repo = fakeRepo()
    await hideOption(repo, 'activity', {
      label: 'Pool',
      source: 'custom',
      hidden: false,
      id: 'o1',
    })
    expect(repo.updateCustomOption).toHaveBeenCalledWith('o1', { hidden: true })
  })

  it('hides a built-in by adding a hidden custom row', async () => {
    const repo = fakeRepo()
    await hideOption(repo, 'activity', {
      label: 'Walk',
      source: 'default',
      hidden: false,
      id: null,
    })
    expect(repo.addCustomOption).toHaveBeenCalledWith('activity', 'Walk', true)
  })
})

describe('renameOption', () => {
  it('renames a custom option and rewrites history with progress', async () => {
    const repo = fakeRepo([
      entry({ id: 'a', activities: ['Walk'] }),
      entry({ id: 'b', entryDate: '2026-10-02', activities: ['Rest'] }),
    ])
    const progress = vi.fn()
    await renameOption(
      repo,
      'activity',
      { label: 'Walk', source: 'custom', hidden: false, id: 'o1' },
      ' Stroll ',
      progress,
    )

    expect(repo.updateCustomOption).toHaveBeenCalledWith('o1', { label: 'Stroll' })
    expect(repo.upsertEntries).toHaveBeenCalledTimes(1)
    expect(repo.upsertEntries).toHaveBeenCalledWith([
      { entryDate: '2026-10-01', period: 'PM', activities: ['Stroll'] },
    ])
    expect(repo.updateTimedLog).toHaveBeenCalledTimes(1)
    expect(repo.updateTimedLog).toHaveBeenCalledWith('t1', { label: 'Stroll' })
    expect(progress).toHaveBeenLastCalledWith(2, 2)
  })

  it('renames a built-in by adding the new name and hiding the old one', async () => {
    const repo = fakeRepo()
    await renameOption(
      repo,
      'activity',
      { label: 'Walk', source: 'default', hidden: false, id: null },
      'Stroll',
    )
    expect(repo.addCustomOption).toHaveBeenCalledWith('activity', 'Stroll')
    expect(repo.addCustomOption).toHaveBeenCalledWith('activity', 'Walk', true)
  })
})
