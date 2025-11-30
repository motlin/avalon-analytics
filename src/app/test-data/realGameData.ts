import gameData from './game-2025-07-16T19:54:25.962Z_VGZ.json';
import sampleGameData from '../../tests/fixtures/game-log-sample.json';
import type {Game} from '../models/game';

// Convert JSON timestamps to Date objects for the Game type
function parseTimestamp(ts: {
	value?: {_seconds: number; _nanoseconds: number};
	_seconds?: number;
	_nanoseconds?: number;
}): Date {
	if (ts?.value) {
		return new Date(ts.value._seconds * 1000 + ts.value._nanoseconds / 1000000);
	}
	if (ts?._seconds !== undefined && ts?._nanoseconds !== undefined) {
		return new Date(ts._seconds * 1000 + ts._nanoseconds / 1000000);
	}
	return new Date();
}

export const realGame: Game = {
	id: 'game-2025-07-16T19:54:25.962Z_VGZ',
	players: gameData.players,
	missions: gameData.missions as Game['missions'],
	outcome: gameData.outcome as unknown as Game['outcome'],
	options: gameData.options,
	timeCreated: parseTimestamp(gameData.timeCreated),
	timeFinished: parseTimestamp(gameData.timeFinished),
};

// 6-player sample game from game-log-sample.json
export const sampleGame: Game = {
	id: 'sample-game-6-players',
	players: sampleGameData.players,
	missions: sampleGameData.missions as Game['missions'],
	outcome: sampleGameData.outcome as unknown as Game['outcome'],
	options: sampleGameData.options,
	timeCreated: parseTimestamp(sampleGameData.timeCreated),
	timeFinished: parseTimestamp(sampleGameData.timeFinished),
};

// Keep legacy exports for backwards compatibility
export const realGamePlayers = gameData.players.map((player: any) => player.name);

export const realGameRoles = gameData.outcome.roles.map((playerRole: any) => ({
	name: playerRole.name,
	role: playerRole.role,
}));

export const realGameMissions = gameData.missions;

export const realGameMissionVotes = gameData.outcome.votes.reduce((acc: any, vote: any, index: number) => {
	acc[index] = vote;
	return acc;
}, {});
