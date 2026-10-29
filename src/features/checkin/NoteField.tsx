import { useState } from 'react'

type NoteFieldProps = { value: string; onChange: (value: string) => void }

/** Optional note, collapsed until asked for. Opens by itself when editing an entry that has one. */
function NoteField({ value, onChange }: NoteFieldProps) {
  const [open, setOpen] = useState(value !== '')

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-touch text-body text-brand-sage focus-visible:outline-brand-sage rounded-full font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        + Add a note
      </button>
    )
  }
  return (
    <label className="block space-y-[0.8rem]">
      <span className="text-body text-text-primary font-semibold">Note</span>
      <textarea
        autoFocus
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-subtle text-body text-text-primary focus-visible:outline-brand-sage rounded-tile w-full resize-none p-[1.2rem] focus-visible:outline-2"
      />
    </label>
  )
}

export default NoteField
