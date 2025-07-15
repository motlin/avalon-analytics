import {env} from 'cloudflare:test';
import type {PrismaClient} from '@generated/prisma';
import {beforeEach, describe, expect, it} from 'vitest';
import {setupDb} from '../db';
import {GameIngestionService} from '../app/services/game-ingestion';
import type {Game} from '../app/models/game';

describe('Game Ingestion Service', () => {
	let db: PrismaClient;
	let service: GameIngestionService;

	beforeEach(async () => {
		await setupDb(env);
		db = (await import('../db')).db;
		service = new GameIngestionService();
	});

	it('should ingest new games', async () => {
		const mockGames: Game[] = [
			{
				id: '2025-01-15T12:00:00Z/test-game-1',
				timeCreated: new Date('2025-01-15T12:00:00Z'),
				timeFinished: new Date('2025-01-15T12:30:00Z'),
				players: [{uid: 'player1', name: 'Player 1'}],
				missions: [],
				outcome: {state: 'GOOD_WIN'},
			},
			{
				id: '2025-01-15T11:00:00Z/test-game-2',
				timeCreated: new Date('2025-01-15T11:00:00Z'),
				timeFinished: null,
				players: [{uid: 'player2', name: 'Player 2'}],
				missions: [],
				outcome: null,
			},
		] as Game[];

		await service.ingestGamesIfNeeded(mockGames);

		const ingestedGame1 = await db.rawGameData.findUnique({
			where: {firebaseKey: '2025-01-15T12:00:00Z/test-game-1'},
		});
		expect(ingestedGame1).toBeDefined();
		expect(ingestedGame1?.gameJson).toMatchObject({
			id: '2025-01-15T12:00:00Z/test-game-1',
			players: [{uid: 'player1', name: 'Player 1'}],
		});

		const ingestedGame2 = await db.rawGameData.findUnique({
			where: {firebaseKey: '2025-01-15T11:00:00Z/test-game-2'},
		});
		expect(ingestedGame2).toBeDefined();

		const ingestionState = await db.gameIngestionState.findUnique({
			where: {id: 1},
		});
		expect(ingestionState?.lastIngestedGameTime).toEqual(new Date('2025-01-15T12:00:00Z'));
	});

	it('should not re-ingest existing games', async () => {
		const existingGameKey = '2025-01-15T10:00:00Z/existing-game';
		await db.rawGameData.create({
			data: {
				firebaseKey: existingGameKey,
				gameJson: {id: existingGameKey, original: true},
			},
		});

		const mockGames: Game[] = [
			{
				id: existingGameKey,
				timeCreated: new Date('2025-01-15T10:00:00Z'),
				timeFinished: null,
				players: [{uid: 'player3', name: 'Player 3'}],
				missions: [],
				outcome: null,
				modified: true,
			},
		] as Game[];

		await service.ingestGamesIfNeeded(mockGames);

		const game = await db.rawGameData.findUnique({
			where: {firebaseKey: existingGameKey},
		});
		expect(game?.gameJson).toMatchObject({original: true});
		expect((game?.gameJson as any).modified).toBeUndefined();
	});

	it('should handle empty game list', async () => {
		await service.ingestGamesIfNeeded([]);

		const count = await db.rawGameData.count();
		expect(count).toBe(0);
	});

	it('should continue ingesting if one game fails', async () => {
		const mockGames: Game[] = [
			{
				id: null as any,
				timeCreated: new Date('2025-01-15T13:00:00Z'),
				timeFinished: null,
				players: [],
				missions: [],
				outcome: null,
			},
			{
				id: '2025-01-15T13:30:00Z/valid-game',
				timeCreated: new Date('2025-01-15T13:30:00Z'),
				timeFinished: null,
				players: [],
				missions: [],
				outcome: null,
			},
		] as Game[];

		await service.ingestGamesIfNeeded(mockGames);

		const validGame = await db.rawGameData.findUnique({
			where: {firebaseKey: '2025-01-15T13:30:00Z/valid-game'},
		});
		expect(validGame).toBeDefined();
	});
});
