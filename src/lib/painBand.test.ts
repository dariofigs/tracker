import { describe, expect, it } from 'vitest'
import { painBand } from './painBand'

describe('painBand', () => {
  it('splits 0–10 into sage, clay and plum', () => {
    expect([0, 1, 3].map(painBand)).toEqual(['sage', 'sage', 'sage'])
    expect([4, 6].map(painBand)).toEqual(['clay', 'clay'])
    expect([7, 10].map(painBand)).toEqual(['plum', 'plum'])
  })
})
