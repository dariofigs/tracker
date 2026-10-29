import { PainGauge, SegmentedControl, Stepper } from '../../components/ui'
import type { SleepQuality } from '../../data/types'
import CapacityPicker from './CapacityPicker'
import Field from './Field'
import { DEFAULT_SLEEP_HOURS, type CheckinForm } from './formModel'

type MorningFormProps = {
  form: CheckinForm
  onChange: (changes: Partial<CheckinForm>) => void
}

const QUALITY: { value: SleepQuality; label: string }[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
]

function MorningForm({ form, onChange }: MorningFormProps) {
  return (
    <div className="space-y-[3.2rem]">
      <Field
        label="Waking pain"
        hint="How your body feels right now. There are no wrong answers."
      >
        <PainGauge
          label="Waking pain"
          value={form.wakingPain ?? 0}
          unset={form.wakingPain === null}
          onChange={(wakingPain) => onChange({ wakingPain })}
          valueText={(n) => `${n} out of 10`}
        />
      </Field>
      <Field label="Hours slept" hint="Roughly is fine. A best guess helps.">
        <Stepper
          label="Sleep hours"
          value={form.sleepHours ?? DEFAULT_SLEEP_HOURS}
          step={0.5}
          min={0}
          max={14}
          unit="h"
          onChange={(sleepHours) => onChange({ sleepHours })}
        />
      </Field>
      <Field label="Sleep quality" hint="1 is unrestful, 5 is deeply restful. Go with your gut.">
        <SegmentedControl
          label="Sleep quality"
          options={QUALITY}
          value={form.sleepQuality}
          onChange={(sleepQuality) => onChange({ sleepQuality })}
        />
      </Field>
      <Field
        label="Starting capacity"
        hint="How much energy you have to spend today. Honest is helpful."
      >
        <CapacityPicker
          label="Starting capacity"
          value={form.startingCapacity}
          onChange={(startingCapacity) => onChange({ startingCapacity })}
        />
      </Field>
    </div>
  )
}

export default MorningForm
