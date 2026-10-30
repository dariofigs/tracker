import { PainGauge, PillChip } from '../../components/ui'
import type { CustomOptionKind } from '../../data/types'
import CapacityPicker from './CapacityPicker'
import CustomChipAdder from './CustomChipAdder'
import Field from './Field'
import type { CheckinForm } from './formModel'
import { withSelected, type CheckinOptions } from './options'

type EveningFormProps = {
  form: CheckinForm
  onChange: (changes: Partial<CheckinForm>) => void
  options: CheckinOptions
  /** Adds a new custom chip to the list for next time. */
  onAddOption: (kind: CustomOptionKind, label: string) => void
}

const toggle = (list: string[], label: string, on: boolean) =>
  on ? [...list, label] : list.filter((l) => l !== label)

function EveningForm({ form, onChange, options, onAddOption }: EveningFormProps) {
  /** Adds the label to the chip list and selects it for today. */
  const addAndSelect = (
    kind: 'activity' | 'symptom' | 'pain_area',
    field: 'activities' | 'symptoms' | 'painAreas',
  ) =>
    (label: string) => {
      onAddOption(kind, label)
      if (!form[field].includes(label)) onChange({ [field]: [...form[field], label] })
    }

  return (
    <div className="space-y-[3.2rem]">
      <Field
        label="End-of-day pain"
        hint="How you feel as the day winds down. Thanks for checking in."
      >
        <PainGauge
          label="End-of-day pain"
          value={form.endPain ?? 0}
          unset={form.endPain === null}
          onChange={(endPain) => onChange({ endPain })}
          valueText={(n) => `${n} out of 10`}
        />
      </Field>

      {(form.endPain ?? 0) > 0 && (
        <Field
          label="Where does it hurt?"
          hint="Tap every area that hurt today. It helps spot patterns over time."
        >
          <div className="flex flex-wrap gap-[0.8rem]">
            {withSelected(options.pain_area, form.painAreas).map((label) => (
              <PillChip
                key={label}
                label={label}
                selected={form.painAreas.includes(label)}
                onChange={(on) => onChange({ painAreas: toggle(form.painAreas, label, on) })}
              />
            ))}
            <CustomChipAdder noun="area" onAdd={addAndSelect('pain_area', 'painAreas')} />
          </div>
        </Field>
      )}

      <Field label="Stress" hint="Mental or emotional load today. Naming it is a good step.">
        <PainGauge
          label="Stress"
          value={form.stress ?? 0}
          unset={form.stress === null}
          rangeLabels={['0 Calm', 'Mild', 'Moderate', 'High']}
          onChange={(stress) => onChange({ stress })}
          valueText={(n) => `${n} out of 10`}
        />
      </Field>

      <Field
        label="Remaining capacity"
        hint="What is left in the tank. Rest is part of the plan."
      >
        <CapacityPicker
          label="Remaining capacity"
          value={form.remainingCapacity}
          onChange={(remainingCapacity) => onChange({ remainingCapacity })}
        />
      </Field>

      <Field
        label="Activities"
        hint="Tap what you did today, including rest. Every bit counts."
      >
        <div className="flex flex-wrap gap-[0.8rem]">
          {withSelected(options.activity, form.activities).map((label) => (
            <PillChip
              key={label}
              label={label}
              selected={form.activities.includes(label)}
              onChange={(on) => onChange({ activities: toggle(form.activities, label, on) })}
            />
          ))}
          <CustomChipAdder noun="activity" onAdd={addAndSelect('activity', 'activities')} />
        </div>
      </Field>

      <Field
        label="Symptoms"
        hint="Tap anything you noticed. Skip it if it was a quiet day."
      >
        <div className="flex flex-wrap gap-[0.8rem]">
          {withSelected(options.symptom, form.symptoms).map((label) => (
            <PillChip
              key={label}
              label={label}
              selected={form.symptoms.includes(label)}
              onChange={(on) => onChange({ symptoms: toggle(form.symptoms, label, on) })}
            />
          ))}
          <CustomChipAdder noun="symptom" onAdd={addAndSelect('symptom', 'symptoms')} />
        </div>
      </Field>
    </div>
  )
}

export default EveningForm
