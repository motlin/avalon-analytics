import {defineConfig} from 'vitest/config';
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import path from 'path';

export default defineConfig({
	plugins: [
		storybookTest({
			storybookScript: 'npm run storybook -- --ci',
			tags: {
				include: ['test'],
			},
		}),
	],
	resolve: {
		alias: {
			'@generated': path.resolve(__dirname, './generated'),
			'@': path.resolve(__dirname, './src'),
		},
		conditions: ['browser'],
	},
	define: {
		'process.env.NODE_ENV': '"test"',
	},
	test: {
		name: 'storybook',
		browser: {
			enabled: true,
			provider: 'playwright',
			headless: true,
			instances: [
				{
					browser: 'chromium',
				},
			],
		},
		setupFiles: ['./.storybook/vitest.setup.ts'],
		exclude: ['**/node_modules/**', '**/dist/**', '**/.wrangler/**', '**/migrations/**', '**/scripts/**'],
	},
});
