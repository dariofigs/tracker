import { SegmentedControl } from '../../components/ui'

const CAPACITY_PRESETS = [25, 50, 75, 100]

type CapacityPickerProps = {
  value: number | null
  onChange: (value: number) => void
  label: string
}

/** One-tap capacity: four presets, plus the saved value when editing an entry that isn't one of them. */
function CapacityPicker({ value, onChange, label }: CapacityPickerProps) {
  const values =
    value !== null && !CAPACITY_PRESETS.includes(value)
      ? [...CAPACITY_PRESETS, value].sort((a, b) => a - b)
      : CAPACITY_PRESETS
  return (
    <SegmentedControl
      label={label}
      value={value}
      onChange={onChange}
      options={values.map((v) => ({ value: v, label: `${v}%` }))}
    />
  )
}

export default CapacityPicker
