// Domain types for check-ins. Mirrors supabase/schema.sql.

export type Period = 'AM' | 'PM';

/** Integer 0–10 scale used for pain and stress. */
export type Score0to10 = number;

/** Whole-number percentage, 0–100. */
export type Percent = number;

/** Sleep quality, 1 (unrestorative) to 5 (restful). */
export type SleepQuality = 1 | 2 | 3 | 4 | 5;

/** Exercise effort, 1 (very light) to 5 (very hard). */
export type Effort = 1 | 2 | 3 | 4 | 5;

/** `type` is the label of an `exercise_type` custom option. */
export interface Exercise {
  type: string;
  minutes: number;
  effort: Effort;
}

/** Morning (AM) fields. All optional until the user fills them in. */
export interface MorningFields {
  wakingPain: Score0to10 | null;
  sleepHours: number | null;
  sleepQuality: SleepQuality | null;
  startingCapacity: Percent | null;
}

/** Evening (PM) fields. All optional until the user fills them in. */
export interface EveningFields {
  endPain: Score0to10 | null;
  exercise: Exercise | null;
  activities: string[];
  symptoms: string[];
  /** Body areas that hurt during the day. Only filled in when end-of-day pain is above 0. */
  painAreas: string[];
  stress: Score0to10 | null;
  remainingCapacity: Percent | null;
}

/** One row per day per period. */
export interface Entry extends Partial<MorningFields>, Partial<EveningFields> {
  id: string;
  entryDate: string; // YYYY-MM-DD, local calendar day
  period: Period;
  note: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/** Payload for saving an entry. Only the day and period are required. Omitted fields are left unchanged. */
export type EntryInput = Pick<Entry, 'entryDate' | 'period'> &
  Partial<Omit<Entry, 'id' | 'entryDate' | 'period' | 'createdAt' | 'updatedAt'>>;

export type CustomOptionKind = 'symptom' | 'activity' | 'exercise_type' | 'pain_area';

/** A timed event logged between or alongside the daily check-ins. */
export type TimedKind = 'pain' | 'symptom' | 'activity' | 'exercise';

export interface TimedLog {
  id: string;
  occurredAt: string; // ISO timestamp of when it happened
  kind: TimedKind;
  pain: number | null; // pain kind only, 0–10
  label: string | null; // symptom, activity, or exercise type
  minutes: number | null; // exercise only
  effort: Effort | null; // exercise only
  note: string | null;
  createdAt: string;
}

export type TimedLogInput = Pick<TimedLog, 'occurredAt' | 'kind'> &
  Partial<Pick<TimedLog, 'pain' | 'label' | 'minutes' | 'effort' | 'note'>>;

export interface TimedLogRow {
  id: string;
  occurred_at: string;
  kind: TimedKind;
  pain: number | null;
  label: string | null;
  minutes: number | null;
  effort: number | null;
  note: string | null;
  created_at: string;
}

export interface CustomOption {
  id: string;
  kind: CustomOptionKind;
  label: string;
  hidden: boolean;
  createdAt: string;
}

/** Row shape as returned by Supabase (snake_case). Mapped to the camelCase types above in the repository. */
export interface EntryRow {
  id: string;
  entry_date: string;
  period: Period;
  waking_pain: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  starting_capacity: number | null;
  end_pain: number | null;
  exercise: Exercise | null;
  activities: string[];
  symptoms: string[];
  pain_areas?: string[] | null;
  stress: number | null;
  remaining_capacity: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomOptionRow {
  id: string;
  kind: CustomOptionKind;
  label: string;
  hidden: boolean;
  created_at: string;
}
