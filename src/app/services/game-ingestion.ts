import {db} from '@/db';
import type {Game} from '../models/game';

export class GameIngestionService {
	async ingestGamesIfNeeded(games: Game[]): Promise<void> {
		if (games.length === 0) {
			return;
		}

		for (const game of games) {
			try {
				const existingGame = await db.rawGameData.findUnique({
					where: {
						firebaseKey: game.id,
					},
				});

				if (!existingGame) {
					await db.rawGameData.create({
						data: {
							firebaseKey: game.id,
							gameJson: game as any,
							createdAt: new Date(),
						},
					});
					console.log(`Ingested new game: ${game.id}`);
				}
			} catch (error) {
				console.error(`Failed to ingest game ${game.id}:`, error);
			}
		}

		const lastGameTime = games[0].timeCreated;
		try {
			await db.gameIngestionState.upsert({
				where: {id: 1},
				update: {
					lastIngestedGameTime: lastGameTime,
				},
				create: {
					id: 1,
					lastIngestedGameTime: lastGameTime,
				},
			});
		} catch (error) {
			console.error('Failed to update ingestion state:', error);
		}
	}
}

export const gameIngestionService = new GameIngestionService();
