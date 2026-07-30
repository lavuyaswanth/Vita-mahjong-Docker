import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json' with { type: 'json' }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // The in-app version badge exists to confirm which build is live, so it is
    // stamped from package.json rather than a literal someone has to remember
    // to bump. Bump the package version to move the badge.
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
