import type {Game, Mission, Player} from '../models/game';

export interface RuntimeGame extends Game {
	currentProposer?: string;
	currentMissionIdx?: number;
	phase?: string;
	currentMission?: Mission;
	lastProposal?: {
		proposer: string;
		team: string[];
		votes: string[];
	};
	currentProposal?: {
		proposer: string;
		team: string[];
		votes: string[];
	};
	hammer?: string;
}
