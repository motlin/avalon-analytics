import type {Game as BaseGame, Mission as BaseMission, Player, GameOutcome} from '../models/game';

export interface Mission extends Omit<BaseMission, 'team'> {
	team: string[];
	votes: string[];
	evilOnTeam?: string[];
}

export interface Proposal {
	proposer: string;
	team: string[];
	votes: string[];
	state: 'APPROVED' | 'REJECTED' | 'PENDING';
}

export interface Game extends BaseGame {
	missions: Mission[];
	phase?: string;
	currentProposer?: string;
	currentProposalIdx?: number;
	currentMission?: Partial<Mission>;
	currentProposal?: Proposal;
	lastProposal?: Proposal | null;
	hammer?: string;
	roles?: string[];
	missionVotes?: Record<string, boolean>[];
	currentMissionIdx?: number;
}

export interface User {
	name: string;
	stats?: {
		games: number;
	};
}

export interface Role {
	name: string;
	team: 'good' | 'evil';
	description: string;
	selected?: boolean;
}

export interface Config {
	roleMap: Record<string, Role>;
	playerList?: string[];
	selectableRoles?: Role[];
	sortList?: (newList: string[]) => void;
}

export interface Lobby {
	name?: string;
	role?: any;
	game: Game & {
		currentMissionIdx?: number;
		currentMission?: Mission;
		currentProposal?: {
			team: string[];
			votes: string[];
			state: string;
		};
		currentProposer?: string;
		currentProposalIdx?: number;
		phase?: string;
		roles?: string[];
		missionVotes?: Record<string, boolean>[];
		players?: (string | Player)[];
	};
	admin?: {
		name: string;
		playersKicked?: string[];
	};
}

export interface AvalonApi {
	game: Game;
	user: User;
	lobby: Lobby;
	config: Config;
	isAdmin?: boolean;
	isGameInProgress?: boolean;
	proposeTeam?: (playerList: string[]) => void;
	voteTeam?: (vote: boolean) => Promise<void>;
	doMission?: (vote: boolean) => void;
	assassinate?: (target: string) => Promise<void>;
	startGame?: (options: {inGameLog: boolean}) => void;
	kickPlayer?: (player: string) => Promise<void>;
	onEvent?: (callback: (event: string, ...args: any[]) => void) => () => void;
}

export type AvalonData = AvalonApi;
