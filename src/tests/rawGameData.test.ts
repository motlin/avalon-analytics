import {env} from 'cloudflare:test';
import type {PrismaClient} from '../../generated/prisma/client';
import {beforeEach, describe, expect, it} from 'vitest';
import {setupDb} from '../db';
import {suppressExpectedErrors} from './testUtils';
import gameLogSample from './fixtures/game-log-sample.json';

// ⚠️ Skipped due to upstream Prisma WASM incompatibility with vitest-pool-workers
// See: https://github.com/cloudflare/workers-sdk/issues/5685
describe.skip('Raw Game Data', () => {
	let db: PrismaClient;

	beforeEach(async () => {
		await setupDb(env);
		db = (await import('../db')).db;
	});

	it('should have a raw game data table', async () => {
		const result = await db.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='RawGameData'`;
		expect(result).toHaveLength(1);
	});

	it('should store raw game JSON with Firebase key', async () => {
		const firebaseKey = '2025-05-21T20:30:35.538Z/QDJ';

		// Use the imported game data
		const gameData = structuredClone(gameLogSample);

		await db.rawGameData.create({
			data: {
				firebaseKey,
				gameJson: gameData,
				createdAt: new Date(),
			},
		});

		const result = await db.rawGameData.findUnique({
			where: {firebaseKey},
		});

		expect(result).toBeDefined();
		expect(result?.firebaseKey).toBe(firebaseKey);

		// Verify the exact contents match by comparing with another clone
		const gameDataClone = structuredClone(gameLogSample);
		expect(result?.gameJson).toEqual(gameDataClone);
	});

	it('should handle large complex game JSON', async () => {
		const firebaseKey = '2025-01-15T11:00:00Z/complex-game';
		const complexGameData = {
			id: 'complex-game',
			timeCreated: '2025-01-15T11:00:00Z',
			timeFinished: '2025-01-15T11:45:00Z',
			players: Array.from({length: 10}, (_, i) => ({
				uid: `player${i}`,
				name: `Player ${i}`,
				role: i < 5 ? 'good' : 'evil',
			})),
			missions: Array.from({length: 5}, (_, i) => ({
				failsRequired: i < 3 ? 1 : 2,
				teamSize: i + 3,
				state: 'SUCCESS',
				proposals: [],
				team: [],
			})),
			outcome: {
				state: 'GOOD_WIN',
				message: 'All missions succeeded',
				roles: [],
			},
			__collections__: {
				nested: {data: 'structure'},
			},
		};

		await db.rawGameData.create({
			data: {
				firebaseKey,
				gameJson: complexGameData,
				createdAt: new Date(),
			},
		});

		const result = await db.rawGameData.findUnique({
			where: {firebaseKey},
		});

		expect(result?.gameJson).toEqual(complexGameData);
	});

	it('should prevent duplicate Firebase keys', async () => {
		const restore = suppressExpectedErrors();
		try {
			const firebaseKey = '2025-01-15T12:00:00Z/duplicate-test';
			const gameData = {id: 'game1'};

			await db.rawGameData.create({
				data: {
					firebaseKey,
					gameJson: gameData,
					createdAt: new Date(),
				},
			});

			await expect(
				db.rawGameData.create({
					data: {
						firebaseKey,
						gameJson: {id: 'game2'},
						createdAt: new Date(),
					},
				}),
			).rejects.toThrow();
		} finally {
			restore();
		}
	});

	it('should store raw JSON without processing', async () => {
		const firebaseKey = '2025-01-15T13:00:00Z/raw-test';
		const rawData = {
			weirdField: 'should be preserved',
			nestedWeirdness: {
				__proto__: 'preserved',
				'strange-key': true,
			},
			nullValue: null,
			undefinedHandling: undefined,
			emptyArray: [],
			emptyObject: {},
		};

		await db.rawGameData.create({
			data: {
				firebaseKey,
				gameJson: rawData,
				createdAt: new Date(),
			},
		});

		const result = await db.rawGameData.findUnique({
			where: {firebaseKey},
		});

		// Should preserve everything except undefined (which becomes null in JSON)
		expect(result?.gameJson).toMatchObject({
			weirdField: 'should be preserved',
			nestedWeirdness: {
				__proto__: 'preserved',
				'strange-key': true,
			},
			nullValue: null,
			emptyArray: [],
			emptyObject: {},
		});
	});
});
