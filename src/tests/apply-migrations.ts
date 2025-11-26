import {applyD1Migrations, env} from 'cloudflare:test';
import {beforeAll} from 'vitest';

beforeAll(async () => {
	if (env.DB && env.TEST_MIGRATIONS) {
		await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
	}
});
