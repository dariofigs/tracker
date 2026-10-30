/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Vitest runs from the project root.
const css = readFileSync('src/index.css', 'utf8')

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))
  if (!match) throw new Error(`Token --color-${name} not found in index.css`)
  return match[1]
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(token(a)), luminance(token(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Foreground on background pairs that the app actually renders as text (WCAG AA, 4.5:1).
const textPairs: [string, string][] = [
  ['text-primary', 'canvas-bg'],
  ['text-primary', 'surface-card'],
  ['text-primary', 'surface-subtle'],
  ['text-primary', 'clay-tint'],
  ['text-muted', 'canvas-bg'],
  ['text-muted', 'surface-card'],
  ['text-muted', 'surface-subtle'],
  ['text-muted', 'sage-tint'],
  ['text-muted', 'clay-tint'],
  ['brand-sage', 'canvas-bg'],
  ['brand-sage', 'surface-card'],
  ['brand-sage', 'surface-subtle'],
  ['brand-sage', 'sage-tint'],
  ['surface-card', 'brand-sage'],
  ['flare-plum', 'canvas-bg'],
  ['flare-plum', 'surface-card'],
  ['flare-plum', 'surface-subtle'],
  ['flare-plum', 'plum-tint'],
  ['surface-card', 'flare-plum'],
  ['clay-text', 'surface-card'],
  ['clay-text', 'canvas-bg'],
  ['clay-text', 'clay-tint'],
]

// Graphics and control edges that must stay distinguishable (WCAG 1.4.11, 3:1).
// bead-stone is left out on purpose: the inactive gauge beads and empty dots are decorative, since
// the handle position and the number carry the value. Accent-clay is for fills only; clay text uses clay-text.
const graphicPairs: [string, string][] = [
  ['brand-sage', 'canvas-bg'],
  ['accent-clay', 'canvas-bg'],
  ['flare-plum', 'canvas-bg'],
]

describe('colour contrast', () => {
  it.each(textPairs)('text %s on %s meets 4.5:1', (fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(graphicPairs)('graphic %s against %s meets 3:1', (fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3)
  })
})
