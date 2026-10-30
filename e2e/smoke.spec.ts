import { expect, test, type Page } from '@playwright/test'
import { cleanUp, entriesOn } from './db'

// One logged day, end to end. The clock is pinned to a 1998 date so cleanUp removes what is saved.
const DAY = '1998-07-01'

test.beforeEach(cleanUp)
test.afterEach(cleanUp)

async function setPain(page: Page, name: string, steps: number) {
  const slider = page.getByRole('slider', { name })
  await slider.focus()
  for (let i = 0; i < steps; i++) await page.keyboard.press('ArrowRight')
}

test('log morning and evening, then see the day on Today, Calendar and Insights', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(1998, 6, 1, 8, 0))
  await page.goto('/')
  await page.getByRole('button', { name: 'Morning check-in' }).click()
  const morning = page.getByRole('dialog')
  await setPain(page, 'Waking pain', 3)
  await morning.getByRole('button', { name: 'Save Entry' }).click()
  await expect(morning).toBeHidden()
  await expect.poll(async () => (await entriesOn(DAY)).length).toBe(1)

  await page.clock.setFixedTime(new Date(1998, 6, 1, 19, 0))
  await page.reload()
  await page.getByRole('button', { name: 'Evening check-in' }).click()
  const evening = page.getByRole('dialog')
  await setPain(page, 'End-of-day pain', 5)
  await evening.getByRole('button', { name: 'Save Entry' }).click()
  await expect(evening).toBeHidden()
  await expect.poll(async () => (await entriesOn(DAY)).length).toBe(2)

  const rows = await entriesOn(DAY)
  expect(rows.map((r) => [r.period, r.waking_pain ?? r.end_pain])).toEqual([
    ['AM', 3],
    ['PM', 5],
  ])

  // Today shows both check-ins as done.
  await expect(page.getByText(/Pain 3\/10/)).toBeVisible()
  await expect(page.getByText(/Pain 5\/10/)).toBeVisible()

  // Calendar shows the day with both pain readings.
  const nav = page.getByRole('navigation', { name: 'Main' })
  await nav.getByRole('button', { name: 'Insights' }).click()
  await page.getByRole('radio', { name: 'Calendar' }).click()
  await expect(
    page.getByRole('gridcell', {
      name: 'July 1: morning pain 3, evening pain 5',
    }),
  ).toBeVisible()

  // Insights is honest that one day is not enough.
  await page.getByRole('radio', { name: 'Trends' }).click()
  await expect(page.getByText(/1 of \d+ days so far/).first()).toBeVisible()
})

test('a save made without a connection waits, then goes through when it returns', async ({
  page,
  context,
}) => {
  await page.clock.setFixedTime(new Date(1998, 6, 2, 8, 0))
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Morning check-in' })).toBeVisible()

  await context.setOffline(true)
  await expect(page.getByText(/You’re offline/)).toBeVisible()
  await page.getByRole('button', { name: 'Morning check-in' }).click()
  const sheet = page.getByRole('dialog')
  await setPain(page, 'Waking pain', 2)
  await sheet.getByRole('button', { name: 'Save Entry' }).click()
  await expect(sheet).toBeHidden()
  await expect(page.getByText(/not saved yet/i).first()).toBeVisible()
  expect(await entriesOn('1998-07-02')).toHaveLength(0)

  await context.setOffline(false)
  await expect.poll(async () => (await entriesOn('1998-07-02')).length).toBe(1)
  await expect(page.getByText(/not saved yet/i)).toHaveCount(0)
})
