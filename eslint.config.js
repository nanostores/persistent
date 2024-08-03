import loguxTsConfig from '@logux/eslint-config/ts'
import globals from 'globals'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { ignores: ['**/errors.ts', 'test/demo/dist'] },
  ...loguxTsConfig,
  {
    languageOptions: {
      globals: globals.browser
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'n/no-unsupported-features/node-builtins': 'off'
    }
  },
  {
    files: ['test/demo/*.ts'],
    rules: {
      'no-console': 'off'
    }
  }
]
