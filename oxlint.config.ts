import loguxOxlintConfig from '@logux/oxc-configs/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [loguxOxlintConfig],
  ignorePatterns: ['*/errors.ts'],
  rules: {
    'typescript/unbound-method': 'off'
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
      rules: {
        'typescript/no-explicit-any': 'off'
      }
    },
    {
      files: ['test/demo/*.ts'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
})
