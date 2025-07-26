import gameData from './game-2025-07-16T19:54:25.962Z_VGZ.json';

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
