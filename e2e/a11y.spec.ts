import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { cleanUp } from './db'

test.beforeEach(cleanUp)
test.afterEach(cleanUp)

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(
    violations.map(
      (v) =>
        `${v.id} x${v.nodes.length}: ${v.nodes[0].html.slice(0, 160)} -- ${v.nodes[0].failureSummary?.split('\n').slice(0, 3).join(' ')}`,
    ),
  ).toEqual([])
}

/** Visible buttons, links and form controls narrower or shorter than 48px. */
async function smallTargets(page: Page) {
  return page.evaluate(() => {
    const selector =
      'button, a[href], input:not([type=hidden]), select, textarea, [role=slider]'
    return [...document.querySelectorAll<HTMLElement>(selector)]
      .map((el) => ({ el, box: el.getBoundingClientRect() }))
      .filter(({ el, box }) => {
        // The visually hidden file input is opened by a visible 48px button.
        if (box.width <= 1 || box.height <= 1) return false
        // Inputs inside a labelled row are measured by their row.
        if (el.closest('label')) return false
        // The sheet's drag handle is decorative and the scrim is dismissed by Escape.
        if (el.getAttribute('aria-hidden') === 'true') return false
        return box.width < 47.5 || box.height < 47.5
      })
      .map(
        ({ el, box }) =>
          `${el.tagName.toLowerCase()} "${el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 30)}" ${Math.round(box.width)}x${Math.round(box.height)}`,
      )
  })
}

const screens = [
  { name: 'Today', path: '/', ready: 'Morning check-in|Evening check-in' },
  { name: 'Insights', path: '/insights', ready: 'Insights' },
  { name: 'Calendar', path: '/calendar', ready: 'Calendar' },
  { name: 'Settings', path: '/settings', ready: 'Settings' },
]

for (const screen of screens) {
  test(`${screen.name} has no axe violations and 48px targets`, async ({ page }) => {
    await page.goto(screen.path)
    await expect(page.getByText(new RegExp(screen.ready)).first()).toBeVisible()
    await expectNoViolations(page)
    expect(await smallTargets(page)).toEqual([])
  })
}

test('the Calendar view has no axe violations', async ({ page }) => {
  await page.goto('/calendar')
  await expect(
    page
      .getByRole('grid')
      .or(page.getByText(/No entries/i))
      .first(),
  ).toBeVisible()
  await expectNoViolations(page)
})

test('the check-in sheet has no axe violations and traps focus', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /check-in$/ }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toBeVisible()
  await expectNoViolations(page)
  await expect(page.locator('#root')).toHaveAttribute('inert', '')

  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab')
    expect(await sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(page.locator('#root')).not.toHaveAttribute('inert')
})

test('motion is switched off when the phone asks for reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: /check-in$/ }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toBeVisible()
  const animations = await sheet.evaluate((el) =>
    el
      .getAnimations({ subtree: true })
      .map((a) => a.effect?.getComputedTiming().duration),
  )
  expect(animations.every((d) => d === 0 || d === undefined)).toBe(true)
})
