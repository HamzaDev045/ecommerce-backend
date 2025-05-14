module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module', // Enable module syntax
  },
  rules: {
    // Add your own rules here
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="require"]',
        message: 'Use import/export syntax instead of require()',
      },
    ],
  },
};
