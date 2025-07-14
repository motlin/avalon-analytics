// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import type {Linter} from 'eslint';
import globals from 'globals';

const config: Linter.Config[] = [
	{
		ignores: [
			'dist/**/*',
			'generated/**/*',
			'node_modules/**/*',
			'.wrangler/**/*',
			'worker-configuration.d.ts',
			'.storybook/**/*',
		],
	},
	{
		files: ['**/*.{js,mjs,cjs}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		rules: {
			...js.configs.recommended.rules,
			'no-unused-vars': ['error', {varsIgnorePattern: '^[A-Z_]'}],
			'no-undef': 'error',
		},
	},
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.browser,
				...globals.node,
			},
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 'latest',
				ecmaFeatures: {jsx: true},
				sourceType: 'module',
				project: './tsconfig.json',
			},
		},
		plugins: {
			'@typescript-eslint': tseslint as any,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['error', {varsIgnorePattern: '^[A-Z_]'}],
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		files: ['**/*.test.{js,ts,tsx}', '**/*.spec.{js,ts,tsx}'],
		languageOptions: {
			globals: {
				...globals.vitest,
				vi: 'readonly',
				expect: 'readonly',
				it: 'readonly',
				describe: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
			},
		},
	},
	...storybook.configs['flat/recommended'],
];

export default config;
