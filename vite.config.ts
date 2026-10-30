import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Live tests hit the real test project, so they run only through `npm run test:live`.
    exclude: [...configDefaults.exclude, '**/*.live.test.ts', 'e2e/**'],
  },
})
