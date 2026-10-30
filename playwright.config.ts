import { defineConfig } from '@playwright/test'

// The app runs in "test" mode, which loads .env.test, so every spec talks to the test Supabase
// project and never to real data. TEST_EMAIL and TEST_PASSWORD come from the same file.
process.loadEnvFile('.env.test')

// Not Vite's default range (5173+), so a dev server left running can never be picked up by mistake.
const PORT = 5190
const AUTH_FILE = 'e2e/.auth/user.json'

export default defineConfig({
  testDir: 'e2e',
  // One shared test account, so specs run one at a time.
  workers: 1,
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 375, height: 812 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx vite --mode test --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    // Never reuse a server: a plain `npm run dev` talks to the real project, and these specs
    // write rows. Playwright fails if the port is taken, which is the safe outcome.
    reuseExistingServer: false,
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      testMatch: /.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { storageState: AUTH_FILE },
    },
  ],
})
