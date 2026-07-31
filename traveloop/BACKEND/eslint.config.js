const js = require('@eslint/js');
const globals = require('globals');
const { defineConfig, globalIgnores } = require('eslint/config');

module.exports = defineConfig([
  globalIgnores(['node_modules', 'migrate-mongo-config.js']),
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: { ecmaVersion: 'latest' },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-console': 'off',
    },
  },
]);