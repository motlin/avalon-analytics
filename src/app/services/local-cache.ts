import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type {Game} from '../models/game';

export class LocalCacheService {
	private cacheDirectory: string;

	constructor(cacheDirectory?: string) {
		const defaultCacheDir = process.env.XDG_CACHE_HOME
			? path.join(process.env.XDG_CACHE_HOME, 'avalon-analytics', 'games')
			: path.join(os.homedir(), '.cache', 'avalon-analytics', 'games');
		this.cacheDirectory = cacheDirectory || defaultCacheDir;
	}

	private getFilePathForGame(gameId: string, timeCreated?: Date): string {
		if (timeCreated) {
			const timestamp = timeCreated.toISOString();
			return path.join(this.cacheDirectory, `${timestamp}_${gameId}`);
		}

		const files = this.getAllCachedFiles();
		const matchingFile = files.find((file) => file.endsWith(`_${gameId}`));

		if (matchingFile) {
			return path.join(this.cacheDirectory, matchingFile);
		}

		throw new Error(`No cached file found for game ${gameId}`);
	}

	private getAllCachedFiles(): string[] {
		try {
			return fs.readdirSync(this.cacheDirectory);
		} catch {
			return [];
		}
	}

	public hasGameCached(gameId: string): boolean {
		try {
			this.getFilePathForGame(gameId);
			return true;
		} catch {
			return false;
		}
	}

	public getCachedGame(gameId: string): Game | null {
		try {
			const filePath = this.getFilePathForGame(gameId);
			const content = fs.readFileSync(filePath, 'utf-8');
			return JSON.parse(content) as Game;
		} catch {
			return null;
		}
	}

	public cacheGame(game: Game): void {
		try {
			if (!fs.existsSync(this.cacheDirectory)) {
				fs.mkdirSync(this.cacheDirectory, {recursive: true});
			}

			const filePath = this.getFilePathForGame(game.id, game.timeCreated);
			const content = JSON.stringify(game, null, 1);
			fs.writeFileSync(filePath, content, 'utf-8');
		} catch (error) {
			console.error(`Failed to cache game ${game.id}:`, error);
		}
	}

	public cacheGames(games: Game[]): void {
		for (const game of games) {
			this.cacheGame(game);
		}
	}
}

let localCacheService: LocalCacheService;

export function getLocalCacheService(): LocalCacheService {
	if (!localCacheService) {
		localCacheService = new LocalCacheService();
	}
	return localCacheService;
}
