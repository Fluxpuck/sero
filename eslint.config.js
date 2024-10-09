// eslint.config.js

import js from '@eslint/js';

export default [
    {
        files: ['**/*.js'], // Adjust if using different file extensions
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest', // Supports modern ECMAScript features
                sourceType: 'module',
            },
        },
        rules: {
            // Best Practices
            'no-unused-vars': 'off',  // Disable warnings or errors for unused variables
            'no-console': 'warn',     // Warn about console logs
            'no-debugger': 'warn',    // Warn if debugger is used

            // Stylistic Choices
            'quotes': ['error', 'single'], // Enforce single quotes
            'semi': ['error', 'always'],   // Require semicolons
            'indent': ['error', 2],        // Enforce 2-space indentation
            'no-multiple-empty-lines': ['warn', { max: 1 }], // Limit empty lines

            // ECMAScript 6
            'prefer-const': 'error',    // Enforce using const when variables are not reassigned
            'arrow-spacing': ['error', { before: true, after: true }], // Enforce spacing around arrow functions
        },
    },
];
