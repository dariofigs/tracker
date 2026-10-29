import { useState } from 'react'

type CustomChipAdderProps = {
  /** Singular noun for labels, e.g. "activity". */
  noun: string
  onAdd: (label: string) => void
}

/** The last chip in a list: tap it, type a name, and it becomes a new chip. */
function CustomChipAdder({ noun, onAdd }: CustomChipAdderProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  function submit() {
    const label = text.trim()
    if (label) onAdd(label)
    setText('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`+ Add new ${noun}`}
        className="min-touch text-body text-brand-sage border-brand-sage focus-visible:outline-brand-sage inline-flex items-center rounded-full border border-dashed px-[1.6rem] focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        + Add new
      </button>
    )
  }
  return (
    <div className="flex w-full items-center gap-[0.8rem]">
      <input
        autoFocus
        type="text"
        aria-label={`New ${noun}`}
        value={text}
        maxLength={40}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          } else if (e.key === 'Escape') {
            e.stopPropagation()
            setText('')
            setOpen(false)
          }
        }}
        className="min-touch bg-surface-subtle text-body text-text-primary focus-visible:outline-brand-sage min-w-0 flex-1 rounded-full px-[1.6rem] focus-visible:outline-2"
      />
      <button
        type="button"
        onClick={submit}
        className="min-touch text-body bg-brand-sage text-surface-card rounded-full px-[1.6rem] font-bold"
      >
        Add
      </button>
    </div>
  )
}

export default CustomChipAdder
