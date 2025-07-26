import type {StorybookConfig} from '@storybook/react-vite';
import path from 'node:path';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-onboarding', '@storybook/addon-vitest'],
	framework: {
		name: '@storybook/react-vite',
		options: {},
	},
	features: {
		interactionsDebugger: true,
	},
	async viteFinal(config) {
		return {
			...config,
			resolve: {
				...config.resolve,
				alias: {
					...config.resolve?.alias,
					'@': path.resolve(__dirname, '../src'),
					'@generated': path.resolve(__dirname, '../generated'),
				},
				dedupe: ['react', 'react-dom'],
			},
			optimizeDeps: {
				...config.optimizeDeps,
				include: [
					...(config.optimizeDeps?.include || []),
					'react',
					'react-dom',
					'react/jsx-runtime',
					'react/jsx-dev-runtime',
				],
				exclude: [...(config.optimizeDeps?.exclude || []), '@storybook/react-vite'],
			},
		};
	},
};
export default config;
