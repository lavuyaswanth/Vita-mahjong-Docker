import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Finder/iCloud on this Mac keeps regenerating "name 2.ext" copies inside the
  // repo. .gitignore keeps them out of commits and tsconfig.app.json keeps them
  // out of the typecheck; keep them out of lint too, so a stale drifted copy
  // can't fail the build.
  globalIgnores(['dist', '**/* 2.*', '**/* 3.*']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
