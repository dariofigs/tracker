export type Comparison = {
  n1: number
  n2: number
  mean1: number
  mean2: number
  /** mean1 - mean2, in the units of the values compared. */
  diff: number
  /** diff as a percent of mean2. Null when mean2 is 0, where a percent means nothing. */
  pctDiff: number | null
  /** Welch's t statistic. 0 when either group is too small or has no spread to measure. */
  t: number
}

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length

function sampleVariance(values: number[], m: number): number {
  return values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1)
}

/** Compares days with a factor (`withFactor`) against days without it. Knows nothing about days or entries. */
export function compareGroups(
  withFactor: number[],
  without: number[],
): Comparison | null {
  if (withFactor.length === 0 || without.length === 0) return null

  const mean1 = mean(withFactor)
  const mean2 = mean(without)
  const diff = mean1 - mean2

  let t = 0
  if (withFactor.length > 1 && without.length > 1) {
    const se = Math.sqrt(
      sampleVariance(withFactor, mean1) / withFactor.length +
        sampleVariance(without, mean2) / without.length,
    )
    t = se > 0 ? diff / se : 0
  }

  return {
    n1: withFactor.length,
    n2: without.length,
    mean1,
    mean2,
    diff,
    pctDiff: mean2 > 0 ? (diff / mean2) * 100 : null,
    t,
  }
}
