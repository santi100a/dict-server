const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const jest = require('eslint-plugin-jest');

module.exports = [
	{
		ignores: [
			'.github',
			'.vscode',
			'dist',
			'node_modules',
			'scripts',
			'coverage'
		]
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'commonjs'
			},
			globals: {
				// Node.js globals
				__dirname: 'readonly',
				__filename: 'readonly',
				exports: 'writable',
				module: 'readonly',
				require: 'readonly',
				process: 'readonly',
				console: 'readonly',
				Buffer: 'readonly',
				// Browser globals
				window: 'readonly',
				document: 'readonly',
				navigator: 'readonly',
				// ES2021 globals
				Promise: 'readonly',
				Symbol: 'readonly',
				WeakMap: 'readonly',
				WeakSet: 'readonly',
				Map: 'readonly',
				Set: 'readonly'
			}
		},
		plugins: {
			'@typescript-eslint': typescriptEslint,
			jest: jest
		},
		rules: {
			// ESLint recommended rules
			...require('eslint/use-at-your-own-risk').builtinRules,

			// TypeScript rules
			...typescriptEslint.configs.recommended.rules,
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',

			// Jest rules
			...jest.configs.recommended.rules,

			// Custom rules
			'no-console': 'off',
			'no-constant-condition': 'off'
		}
	}
];
