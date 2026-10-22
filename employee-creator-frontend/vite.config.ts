import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // react() is typed against this project's (rolldown-based) Vite, while
  // vitest/config carries its own bundled Vite types; the cast bridges that
  // version gap without affecting runtime behaviour.
  plugins: [react() as never],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    // Leave CSS unprocessed: *.module.scss imports resolve to a stub, so tests
    // query by role / text / accessible name, never by generated class name.
    css: false,
  },
})
