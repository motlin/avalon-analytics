import path from 'node:path';
import {cloudflareTest, readD1Migrations} from '@cloudflare/vitest-pool-workers';
import {defineConfig} from 'vitest/config';

const migrationsPath = path.join(__dirname, 'migrations');

export default defineConfig({
	plugins: [
		cloudflareTest(async () => {
			const migrations = await readD1Migrations(migrationsPath);
			return {
				wrangler: {configPath: './wrangler.test.jsonc'},
				miniflare: {
					compatibilityFlags: ['nodejs_compat'],
					d1Databases: ['DB'],
					bindings: {
						TEST_MIGRATIONS: migrations,
					},
				},
			};
		}),
	],
	test: {
		setupFiles: ['./src/tests/apply-migrations.ts'],
	},
	resolve: {
		alias: {
			'@generated': path.resolve(__dirname, './generated'),
			'@': path.resolve(__dirname, './src'),
		},
		conditions: ['react-server', 'worker', 'workerd', 'browser'],
	},
});
