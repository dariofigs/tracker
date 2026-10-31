import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Entry } from '../../data/types'
import ImportPreview from './backup/ImportPreview'
import type { ImportPlan } from './backup/importPlan'
import CredentialForm from './CredentialForm'
import OptionsList from './OptionsList'
import { buildOptionRows } from './optionsModel'
import TimeSetting from './TimeSetting'

const entry = (day: string): Entry => ({
  id: day,
  entryDate: day,
  period: 'AM',
  note: null,
  createdAt: '',
  updatedAt: '',
})

const none = { added: [], unchanged: [], changed: [] }
const plan: ImportPlan = {
  entries: {
    added: [entry('2026-10-01')],
    unchanged: [entry('2026-10-02')],
    changed: [
      { incoming: entry('2026-10-03'), existing: { ...entry('2026-10-03'), note: 'x' } },
    ],
  },
  timedLogs: none,
  options: { added: [], hiddenChanged: [] },
  morningCutoff: '',
}

describe('ImportPreview', () => {
  it('offers to replace different days or import new ones only', async () => {
    const onImport = vi.fn()
    render(
      <ImportPreview
        plan={plan}
        stage={{ step: 'preview' }}
        onClose={() => {}}
        onImport={onImport}
        onRetry={() => {}}
      />,
    )
    expect(screen.getByText('2026-10-03 AM')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Import new only' }))
    expect(onImport).toHaveBeenLastCalledWith(false)

    await userEvent.click(
      screen.getByRole('button', { name: /Import and replace 1 check-in/ }),
    )
    expect(onImport).toHaveBeenLastCalledWith(true)
  })

  it('says so when the file adds nothing', () => {
    render(
      <ImportPreview
        plan={{
          ...plan,
          entries: { added: [], unchanged: plan.entries.unchanged, changed: [] },
        }}
        stage={{ step: 'preview' }}
        onClose={() => {}}
        onImport={() => {}}
        onRetry={() => {}}
      />,
    )
    expect(screen.getByText(/Nothing to import/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Import/ })).not.toBeInTheDocument()
  })
})

describe('CredentialForm', () => {
  it('rejects a short or mismatched password before submitting', async () => {
    const onSubmit = vi.fn()
    render(
      <CredentialForm kind="password" status={{ state: 'idle' }} onSubmit={onSubmit} />,
    )

    await userEvent.type(screen.getByLabelText('New password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }))
    expect(screen.getByRole('alert')).toHaveTextContent('at least 8')

    await userEvent.clear(screen.getByLabelText('New password'))
    await userEvent.type(screen.getByLabelText('New password'), 'long enough pw')
    await userEvent.type(screen.getByLabelText('Repeat new password'), 'different pw')
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }))
    expect(screen.getByRole('alert')).toHaveTextContent('don’t match')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a trimmed email', async () => {
    const onSubmit = vi.fn()
    render(<CredentialForm kind="email" status={{ state: 'idle' }} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('New email'), ' me@example.com ')
    await userEvent.click(screen.getByRole('button', { name: 'Change email' }))
    expect(onSubmit).toHaveBeenCalledWith('me@example.com')
  })
})

describe('OptionsList', () => {
  it('blocks a duplicate name and passes a new one up', async () => {
    const onAdd = vi.fn()
    render(
      <OptionsList
        kind="activity"
        rows={buildOptionRows('activity', [])}
        onAdd={onAdd}
        onRename={() => {}}
        onToggleHidden={() => {}}
      />,
    )
    await userEvent.type(screen.getByLabelText('New activity'), 'walk')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByRole('alert')).toHaveTextContent('already have')
    expect(onAdd).not.toHaveBeenCalled()

    await userEvent.clear(screen.getByLabelText('New activity'))
    await userEvent.type(screen.getByLabelText('New activity'), 'Pool')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(onAdd).toHaveBeenCalledWith('Pool')
  })

  it('puts a Hidden row last in the list that reveals the hidden options with a Restore button', async () => {
    render(
      <OptionsList
        kind="activity"
        rows={buildOptionRows('activity', [
          { id: 'h', kind: 'activity', label: 'Walk', hidden: true, createdAt: '' },
        ])}
        onAdd={() => {}}
        onRename={() => {}}
        onToggleHidden={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Hide Strength' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show Walk' })).not.toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: /Hidden \(1\)/ })
    expect(screen.getAllByRole('listitem').at(-1)).toContainElement(toggle)
    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Show Walk' })).toHaveTextContent('Restore')
  })
})

describe('TimeSetting', () => {
  it('offers a reset only when the time was changed', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<TimeSetting value="12:00" onChange={onChange} />)
    expect(screen.queryByRole('button', { name: /Reset/ })).not.toBeInTheDocument()

    rerender(<TimeSetting value="14:00" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Reset to 12:00' }))
    expect(onChange).toHaveBeenCalledWith('12:00')
  })
})
