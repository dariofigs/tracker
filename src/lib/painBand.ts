export type PainBand = 'sage' | 'clay' | 'plum'

/** Pain colour band shared by the calendar and the charts: sage 0–3, clay 4–6, plum 7–10 (a flare). */
export function painBand(pain: number): PainBand {
  if (pain >= 7) return 'plum'
  if (pain >= 4) return 'clay'
  return 'sage'
}

export const FLARE_PAIN = 7
