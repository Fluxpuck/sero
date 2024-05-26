import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  // Base configuration for all JS files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^(err|error)$' }],
    },
  },
  // Configuration specific for commonjs sourceType
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
  // Plugin's recommended configuration
  pluginJs.configs.recommended,
  // Configuration for ECMAScript modules
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module',
    },
    rules: {
      // your custom rules
    },
  },
];
