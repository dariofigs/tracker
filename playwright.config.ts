import { defineConfig } from '@playwright/test'

// The app runs in "test" mode, which loads .env.test, so every spec talks to the test Supabase
// project and never to real data. TEST_EMAIL and TEST_PASSWORD come from the same file.
process.loadEnvFile('.env.test')

const PORT = 5174
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
    reuseExistingServer: !process.env.CI,
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
