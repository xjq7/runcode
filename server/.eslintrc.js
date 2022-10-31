module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: ['.eslintrc.js', '/sh'],
  extends: ['standard-with-typescript', 'prettier'],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/no-misused-promises': 0,
    '@typescript-eslint/promise-function-async': 0,
    '@typescript-eslint/no-floating-promises': 0,
    '@typescript-eslint/restrict-template-expressions': 0,
    '@typescript-eslint/prefer-ts-expect-error': 0,
    '@typescript-eslint/no-var-requires': 0,
  },
};
