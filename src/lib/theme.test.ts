/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resolveTheme, scheduledTheme } from './theme'

function at(hours: number, minutes = 0): Date {
  return new Date(2026, 9, 31, hours, minutes)
}

describe('scheduledTheme', () => {
  it('is dark from the dark time until the light time, across midnight', () => {
    expect(scheduledTheme(at(18, 59), '19:00', '07:00')).toBe('light')
    expect(scheduledTheme(at(19), '19:00', '07:00')).toBe('dark')
    expect(scheduledTheme(at(2), '19:00', '07:00')).toBe('dark')
    expect(scheduledTheme(at(6, 59), '19:00', '07:00')).toBe('dark')
    expect(scheduledTheme(at(7), '19:00', '07:00')).toBe('light')
    expect(scheduledTheme(at(12), '19:00', '07:00')).toBe('light')
  })

  it('handles a dark window that stays within one day', () => {
    expect(scheduledTheme(at(13), '12:00', '15:00')).toBe('dark')
    expect(scheduledTheme(at(16), '12:00', '15:00')).toBe('light')
    expect(scheduledTheme(at(8), '12:00', '15:00')).toBe('light')
  })

  it('stays light when both times are the same', () => {
    expect(scheduledTheme(at(3), '07:00', '07:00')).toBe('light')
  })
})

describe('resolveTheme', () => {
  const times = { darkFrom: '19:00', lightFrom: '07:00' }

  it('keeps an explicit choice whatever the device or clock says', () => {
    expect(resolveTheme({ theme: 'light', ...times }, at(23), true)).toBe('light')
    expect(resolveTheme({ theme: 'dark', ...times }, at(12), false)).toBe('dark')
  })

  it('follows the device for system', () => {
    expect(resolveTheme({ theme: 'system', ...times }, at(12), true)).toBe('dark')
    expect(resolveTheme({ theme: 'system', ...times }, at(23), false)).toBe('light')
  })

  it('follows the clock for schedule, ignoring the device', () => {
    expect(resolveTheme({ theme: 'schedule', ...times }, at(23), false)).toBe('dark')
    expect(resolveTheme({ theme: 'schedule', ...times }, at(12), true)).toBe('light')
  })
})

describe('dark tokens in index.css', () => {
  const css = readFileSync('src/index.css', 'utf8')

  function tokens(block: string): string[] {
    return [...block.matchAll(/--color-[\w-]+:\s*#[0-9a-f]{6}/g)].map((m) => m[0])
  }

  it('match between the media fallback and the data-theme block', () => {
    const media = css.slice(
      css.indexOf('@media (prefers-color-scheme: dark)'),
      css.indexOf(":root[data-theme='dark'] {"),
    )
    const attribute = css.slice(css.indexOf(":root[data-theme='dark'] {"))
    expect(tokens(media).length).toBeGreaterThan(10)
    expect(tokens(media)).toEqual(tokens(attribute).slice(0, tokens(media).length))
  })
})
