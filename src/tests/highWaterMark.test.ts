import {env} from 'cloudflare:test';
import type {PrismaClient} from '../../generated/prisma/client';
import {beforeEach, describe, expect, it} from 'vitest';
import {setupDb} from '../db';
import {suppressExpectedErrors} from './testUtils';

describe('High Water Mark', () => {
	let db: PrismaClient;

	beforeEach(async () => {
		await setupDb(env);
		db = (await import('../db')).db;
	});

	it('should have a high water mark table', async () => {
		// Check that the table exists by attempting a query
		const result =
			await db.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='GameIngestionState'`;
		expect(result).toHaveLength(1);
	});

	it('should initialize with Unix epoch when no data exists', async () => {
		const result = await db.gameIngestionState.findUnique({
			where: {id: 1},
		});

		expect(result).toBeDefined();
		expect(result?.lastIngestedGameTime).toEqual(new Date('1970-01-01T00:00:00Z'));
	});

	it('should update the high water mark', async () => {
		// Update to a new date
		const newDate = new Date('2025-01-15T10:30:00Z');
		await db.gameIngestionState.update({
			where: {id: 1},
			data: {lastIngestedGameTime: newDate},
		});

		const result = await db.gameIngestionState.findUnique({
			where: {id: 1},
		});

		expect(result?.lastIngestedGameTime).toEqual(newDate);
	});

	it('should only allow a single row', async () => {
		const restore = suppressExpectedErrors();
		try {
			// Attempt to create another row with same ID should fail
			await expect(
				db.gameIngestionState.create({
					data: {
						id: 1,
						lastIngestedGameTime: new Date(),
					},
				}),
			).rejects.toThrow();

			// Verify only one row exists
			const count = await db.gameIngestionState.count();
			expect(count).toBe(1);
		} finally {
			restore();
		}
	});
});
