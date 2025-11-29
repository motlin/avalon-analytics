import gameData from './game-2025-07-16T19:54:25.962Z_VGZ.json';
import type {Game} from '../models/game';

// Convert JSON timestamps to Date objects for the Game type
function parseTimestamp(ts: any): Date {
	if (ts?.value) {
		return new Date(ts.value._seconds * 1000 + ts.value._nanoseconds / 1000000);
	}
	if (ts?._seconds) {
		return new Date(ts._seconds * 1000 + ts._nanoseconds / 1000000);
	}
	return new Date();
}

export const realGame: Game = {
	id: 'game-2025-07-16T19:54:25.962Z_VGZ',
	players: gameData.players,
	missions: gameData.missions as Game['missions'],
	outcome: gameData.outcome as Game['outcome'],
	options: gameData.options,
	timeCreated: parseTimestamp(gameData.timeCreated),
	timeFinished: parseTimestamp(gameData.timeFinished),
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
