import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { cleanUp, db, entriesOn, seedEntries } from './db'

test.beforeEach(cleanUp)
test.afterEach(cleanUp)

test('the switch time decides which check-in the button opens', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 30, 13, 0))
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Evening check-in' })).toBeVisible()

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('button', { name: 'Settings' })
    .click()
  await page.getByLabel('Evening check-in starts at').fill('14:00')
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('button', { name: 'Today' })
    .click()
  await expect(page.getByRole('button', { name: 'Morning check-in' })).toBeVisible()

  // The choice survives a reload.
  await page.reload()
  await expect(page.getByRole('button', { name: 'Morning check-in' })).toBeVisible()
})

test('renaming an option updates past check-ins that used it', async ({ page }) => {
  const supabase = await db()
  await supabase.from('custom_options').insert({ kind: 'activity', label: 'e2e pool' })
  await seedEntries([
    {
      entry_date: '1998-08-01',
      period: 'PM',
      end_pain: 3,
      activities: ['e2e pool', 'Walk'],
    },
  ])

  await page.goto('/settings')
  await page.getByRole('radio', { name: 'Activities' }).click()
  await page.getByRole('button', { name: 'Rename e2e pool' }).click()

  const sheet = page.getByRole('dialog', { name: 'Rename activity' })
  await sheet.getByLabel('New name for e2e pool').fill('e2e swim')
  await sheet.getByRole('button', { name: 'Review' }).click()
  await expect(sheet).toContainText('on 1 check-in')
  await sheet.getByRole('button', { name: 'Rename', exact: true }).click()
  await expect(sheet).toBeHidden()

  await expect(page.getByText('e2e swim')).toBeVisible()
  const [entry] = await entriesOn('1998-08-01')
  expect(entry.activities).toEqual(['e2e swim', 'Walk'])
})

test('rejects a duplicate option name', async ({ page }) => {
  await page.goto('/settings')
  await page.getByRole('radio', { name: 'Activities' }).click()
  await page.getByLabel('New activity').fill('walk')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('already have')
})

test('export, delete and restore gives back the same data', async ({
  page,
}, testInfo) => {
  // Desktop Chromium can offer the share sheet; force the plain download this test captures.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: undefined })
  })
  await seedEntries([
    {
      entry_date: '1998-07-01',
      period: 'AM',
      waking_pain: 5,
      sleep_hours: 6.5,
      note: 'a, "quoted" note',
    },
    {
      entry_date: '1998-07-01',
      period: 'PM',
      end_pain: 6,
      exercise: { type: 'Walk', minutes: 20, effort: 2 },
      activities: ['Walk'],
    },
  ])
  const before = await entriesOn('1998-07-01')

  await page.goto('/settings')
  await expect(page.getByText('You haven’t backed up yet.')).toBeVisible()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export backup (JSON)' }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/^tracker-backup-\d{4}-\d{2}-\d{2}\.json$/)
  const file = testInfo.outputPath('backup.json')
  await download.saveAs(file)
  await expect(page.getByText(/Last backup:/)).toBeVisible()

  const saved = JSON.parse(readFileSync(file, 'utf8'))
  expect(
    saved.entries.filter((e: { entryDate: string }) => e.entryDate === '1998-07-01'),
  ).toHaveLength(2)

  // Wipe the two rows, then restore from the file.
  await cleanUp()
  expect(await entriesOn('1998-07-01')).toHaveLength(0)

  await page.getByLabel('Backup file').setInputFiles(file)
  const sheet = page.getByRole('dialog', { name: 'Restore from backup' })
  await expect(
    sheet.getByText('New check-ins').locator('xpath=following-sibling::dd'),
  ).toHaveText('2')
  await sheet.getByRole('button', { name: 'Import', exact: true }).click()
  await expect(sheet).toContainText('Done.')
  await sheet.getByRole('button', { name: 'Close' }).click()

  const after = await entriesOn('1998-07-01')
  const strip = (rows: Record<string, unknown>[]) =>
    rows.map((row) => {
      const copy = { ...row }
      for (const key of ['id', 'created_at', 'updated_at', 'user_id']) delete copy[key]
      return copy
    })
  expect(strip(after)).toEqual(strip(before))

  // Restoring the same file again has nothing to do.
  await page.getByLabel('Backup file').setInputFiles(file)
  await expect(page.getByRole('dialog', { name: 'Restore from backup' })).toContainText(
    'Nothing to import',
  )
})

test('rejects a file that is not a backup', async ({ page }) => {
  await page.goto('/settings')
  await page.getByLabel('Backup file').setInputFiles({
    name: 'nope.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"hello": 1}'),
  })
  await expect(
    page.getByRole('alert').filter({ hasText: 'isn’t a Tracker backup' }),
  ).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('the backup reminder appears when overdue and can be snoozed', async ({ page }) => {
  await page.addInitScript(() => {
    const key = 'tracker.preferences'
    if (localStorage.getItem(key)) return
    const lastExportAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    localStorage.setItem(key, JSON.stringify({ lastExportAt }))
  })
  await page.goto('/')
  const reminder = page.getByRole('complementary', { name: 'Backup reminder' })
  await expect(reminder).toContainText('30 days since your last backup')

  await reminder.getByRole('button', { name: 'Remind me later' }).click()
  await expect(reminder).toBeHidden()
  await page.reload()
  await expect(page.getByRole('navigation')).toBeVisible()
  await expect(reminder).toBeHidden()
})
