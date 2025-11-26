import path from 'node:path';
import {defineWorkersConfig, readD1Migrations} from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig(async () => {
	const migrationsPath = path.join(__dirname, 'migrations');
	const migrations = await readD1Migrations(migrationsPath);

	return {
		test: {
			setupFiles: ['./src/tests/apply-migrations.ts'],
			poolOptions: {
				workers: {
					wrangler: {configPath: './wrangler.test.jsonc'},
					miniflare: {
						compatibilityFlags: ['nodejs_compat'],
						d1Databases: ['DB'],
						bindings: {
							TEST_MIGRATIONS: migrations,
						},
					},
				},
			},
		},
		resolve: {
			alias: {
				'@generated': path.resolve(__dirname, './generated'),
				'@': path.resolve(__dirname, './src'),
			},
			conditions: ['react-server', 'worker', 'workerd', 'browser'],
		},
	};
});
