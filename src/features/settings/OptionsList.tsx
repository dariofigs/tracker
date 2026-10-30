import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui'
import type { CustomOptionKind } from '../../data/types'
import { KIND_NOUN, validateLabel, type OptionRow } from './optionsModel'

type OptionsListProps = {
  kind: CustomOptionKind
  rows: OptionRow[]
  /** Disables the buttons while a change is being saved. */
  busy?: boolean
  onAdd: (label: string) => void
  onRename: (row: OptionRow) => void
  onToggleHidden: (row: OptionRow) => void
}

const smallButton =
  'min-touch text-caption text-brand-sage focus-visible:outline-brand-sage rounded-full px-[1.2rem] font-semibold focus-visible:outline-2 disabled:text-text-muted'

/** One kind's choices with rename and hide, plus a field to add another. */
function OptionsList({
  kind,
  rows,
  busy = false,
  onAdd,
  onRename,
  onToggleHidden,
}: OptionsListProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const noun = KIND_NOUN[kind]

  function submit(event: FormEvent) {
    event.preventDefault()
    const problem = validateLabel(kind, text, rows)
    setError(problem)
    if (problem) return
    onAdd(text.trim())
    setText('')
  }

  return (
    <div className="flex flex-col gap-[1.2rem]">
      <ul className="divide-border-subtle flex flex-col divide-y">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-[0.8rem] py-[0.4rem]"
          >
            <div className="min-w-0">
              <p
                className={`text-body truncate ${row.hidden ? 'text-text-muted line-through' : ''}`}
              >
                {row.label}
              </p>
              {row.hidden && <p className="text-caption text-text-muted">Hidden</p>}
            </div>
            <div className="flex shrink-0">
              <button
                type="button"
                className={smallButton}
                disabled={busy}
                aria-label={`Rename ${row.label}`}
                onClick={() => onRename(row)}
              >
                Rename
              </button>
              <button
                type="button"
                className={smallButton}
                disabled={busy}
                aria-label={`${row.hidden ? 'Show' : 'Hide'} ${row.label}`}
                onClick={() => onToggleHidden(row)}
              >
                {row.hidden ? 'Show' : 'Hide'}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="flex flex-col gap-[0.8rem]" noValidate>
        <div className="flex items-center gap-[0.8rem]">
          <input
            type="text"
            aria-label={`New ${noun}`}
            placeholder={`New ${noun}`}
            value={text}
            maxLength={40}
            onChange={(e) => setText(e.target.value)}
            className="min-touch bg-surface-subtle text-body text-text-primary focus-visible:outline-brand-sage min-w-0 flex-1 rounded-full px-[1.6rem] focus-visible:outline-2"
          />
          <Button type="submit" variant="secondary" disabled={busy}>
            Add
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-caption text-flare-plum">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}

export default OptionsList
