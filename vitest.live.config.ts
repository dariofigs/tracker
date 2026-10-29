import { defineConfig } from 'vitest/config'

// Runs only the live tests against the Supabase test project, configured in .env.test.
export default defineConfig({
  // Also load TEST_* variables so the test login is readable. Only test code reads them.
  envPrefix: ['VITE_', 'TEST_'],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.live.test.ts'],
    testTimeout: 15_000,
  },
})
