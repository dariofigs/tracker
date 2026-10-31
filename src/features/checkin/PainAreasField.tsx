import { PillChip } from '../../components/ui'
import CustomChipAdder from './CustomChipAdder'
import Field from './Field'
import { withSelected } from './options'

type PainAreasFieldProps = {
  hint: string
  /** Every area on offer, built-in and custom. */
  areas: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  /** Adds a new custom area to the list for next time. */
  onAdd: (label: string) => void
}

/** "Where does it hurt?" chips, shown by both check-ins once pain is above 0. */
function PainAreasField({ hint, areas, selected, onChange, onAdd }: PainAreasFieldProps) {
  return (
    <Field label="Where does it hurt?" hint={hint}>
      <div className="flex flex-wrap gap-[0.8rem]">
        {withSelected(areas, selected).map((label) => (
          <PillChip
            key={label}
            label={label}
            selected={selected.includes(label)}
            onChange={(on) =>
              onChange(on ? [...selected, label] : selected.filter((l) => l !== label))
            }
          />
        ))}
        <CustomChipAdder
          noun="area"
          onAdd={(label) => {
            onAdd(label)
            if (!selected.includes(label)) onChange([...selected, label])
          }}
        />
      </div>
    </Field>
  )
}

export default PainAreasField
