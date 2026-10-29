import { useCallback, useEffect, useState } from 'react'
import { repository } from '../../data/repository'
import type { CustomOptionKind } from '../../data/types'

/** Built-in choices, always offered. Custom options from Settings are added after them. */
export const DEFAULT_OPTIONS: Record<CustomOptionKind, string[]> = {
  symptom: ['Fatigue', 'Brain fog', 'Headache', 'Nausea'],
  activity: ['Walk', 'Strength', 'Stretch', 'Chores', 'Rest', 'Work'],
  exercise_type: ['Walk', 'Stretch', 'Strength'],
  pain_area: [
    'Head',
    'Jaw',
    'Neck',
    'Shoulders',
    'Chest',
    'Upper back',
    'Lower back',
    'Stomach',
    'Arms',
    'Hands',
    'Hips',
    'Legs',
    'Knees',
    'Feet',
  ],
}

export type CheckinOptions = Record<CustomOptionKind, string[]>

type Custom = { label: string; hidden: boolean }

/** Defaults plus visible custom options. A hidden custom option also hides a default of the same name. */
export function mergeOptions(defaults: string[], custom: Custom[]): string[] {
  const hidden = new Set(custom.filter((o) => o.hidden).map((o) => o.label))
  const merged = [...defaults, ...custom.filter((o) => !o.hidden).map((o) => o.label)]
  return [...new Set(merged)].filter((label) => !hidden.has(label))
}

/** Chips to offer, plus any label already on the entry being edited so old data never disappears. */
export function withSelected(options: string[], selected: string[]): string[] {
  return [...options, ...selected.filter((s) => !options.includes(s))]
}

/** Chip lists for the forms. Shows the built-ins at once and adds custom ones when they arrive. */
export function useCheckinOptions(): {
  options: CheckinOptions
  /** Adds a chip now and saves it as a custom option; if saving fails the chip still works for this check-in. */
  addOption: (kind: CustomOptionKind, label: string) => void
} {
  const [options, setOptions] = useState<CheckinOptions>(DEFAULT_OPTIONS)

  useEffect(() => {
    let active = true
    const kinds = Object.keys(DEFAULT_OPTIONS) as CustomOptionKind[]
    Promise.all(kinds.map((k) => repository.listCustomOptions(k)))
      .then((lists) => {
        if (!active) return
        setOptions(
          Object.fromEntries(
            kinds.map((k, i) => [k, mergeOptions(DEFAULT_OPTIONS[k], lists[i])]),
          ) as CheckinOptions,
        )
      })
      .catch(() => {
        // Offline or signed out: the built-in choices are enough to keep logging.
      })
    return () => {
      active = false
    }
  }, [])

  const addOption = useCallback(
    (kind: CustomOptionKind, label: string) => {
      if (options[kind].includes(label)) return
      setOptions((o) => ({ ...o, [kind]: [...o[kind], label] }))
      repository.addCustomOption(kind, label).catch(() => {
        // Offline: the label is kept on the entry itself, and can be added to the list later.
      })
    },
    [options],
  )

  return { options, addOption }
}
