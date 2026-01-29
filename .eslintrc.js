module.exports = {
  root: true,
  extends: [
    '@react-native',
    'prettier',
  ],
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-interface': 'warn',

    // React rules
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unstable-nested-components': 'warn',
    'react/prop-types': 'off',

    // Best practices
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-alert': 'warn',

    // Style rules
    'prettier/prettier': 'error',
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],

    // Ignore patterns
    'no-restricted-globals': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
    },
  ],
};
