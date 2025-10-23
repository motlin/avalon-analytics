import gameData from './game-2025-07-16T19:54:25.962Z_VGZ.json';
import type {Mission} from '../models/game';

interface PlayerRole {
	name: string;
	role: string;
}

export const realGamePlayers = gameData.players.map((player: any) => player.name);

export const realGameRoles: PlayerRole[] = gameData.outcome.roles.map((playerRole: any) => ({
	name: playerRole.name,
	role: playerRole.role,
}));

export const realGameMissions: Mission[] = gameData.missions.map((mission: any) => ({
	...mission,
	state: mission.state as 'SUCCESS' | 'FAIL' | 'PENDING',
	proposals: mission.proposals.map((proposal: any) => ({
		...proposal,
		state: proposal.state as 'APPROVED' | 'REJECTED' | 'PENDING',
	})),
}));

export const realGameMissionVotes: Record<number, Record<string, boolean>> = gameData.outcome.votes.reduce(
	(acc: any, vote: any, index: number) => {
		acc[index] = vote;
		return acc;
	},
	{},
);
