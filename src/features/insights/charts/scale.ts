/** Maps a value in [d0, d1] to [r0, r1]. A flat domain maps to the middle of the range. */
export function linear(d0: number, d1: number, r0: number, r1: number) {
  return (value: number) =>
    d1 === d0 ? (r0 + r1) / 2 : r0 + ((value - d0) / (d1 - d0)) * (r1 - r0)
}
