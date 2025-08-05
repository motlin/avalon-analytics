import gameData from './game-2025-07-16T19:54:25.962Z_VGZ.json';
import type {Mission} from '../models/game';

interface GamePlayer {
	name: string;
}

interface GamePlayerRole {
	name: string;
	role: string;
}

interface GameProposal {
	proposer: string;
	state: string;
	team: string[];
	votes: string[];
}

interface GameMission {
	state: string;
	teamSize: number;
	failsRequired: number;
	team: string[];
	proposals: GameProposal[];
	numFails: number;
}

interface GameData {
	players: GamePlayer[];
	missions: GameMission[];
	outcome: {
		roles: GamePlayerRole[];
		votes: any[];
	};
}

const typedGameData = gameData as GameData;

export const realGamePlayers = typedGameData.players.map((player) => player.name);

export const realGameRoles = typedGameData.outcome.roles.map((playerRole) => ({
	name: playerRole.name,
	role: playerRole.role,
}));

export const realGameMissions: Mission[] = typedGameData.missions.map((mission) => ({
	...mission,
	state: mission.state as 'SUCCESS' | 'FAIL' | 'PENDING',
	proposals: mission.proposals.map((proposal) => ({
		...proposal,
		state: proposal.state as 'APPROVED' | 'REJECTED' | 'PENDING',
	})),
}));

export const realGameMissionVotes: Record<number, Record<string, boolean>> = typedGameData.outcome.votes.reduce(
	(acc, vote, index) => {
		acc[index] = vote;
		return acc;
	},
	{} as Record<number, Record<string, boolean>>,
);
