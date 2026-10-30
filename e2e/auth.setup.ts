import { expect, test as setup } from '@playwright/test'

// Signs in once and saves the session for every spec.
setup('sign in to the test project', async ({ page }) => {
  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD
  if (!email || !password)
    throw new Error('TEST_EMAIL and TEST_PASSWORD must be set in .env.test')

  await page.goto('/')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('navigation')).toBeVisible()

  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
