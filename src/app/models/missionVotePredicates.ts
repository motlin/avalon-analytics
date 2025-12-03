/**
 * 🎖️ Mission Vote Predicates
 *
 * TypeScript port of WeirdMissionVotePredicate from avalon-log-scraper.
 * Analyzes mission votes (pass/fail) to identify noteworthy behaviors.
 */

import type {Annotation, MissionContext, MissionVoteContext} from './annotations';
import {
	alreadyFailedTwo,
	alreadySucceededTwo,
	getPlayerRole,
	getRoleEmoji,
	isEvilRole,
	isKnownEvil,
} from './annotations';

// ============================================================================
// 🔧 Predicate Interface
// ============================================================================

export interface MissionVotePredicate {
	name: string;
	isRelevant: (context: MissionVoteContext) => boolean;
	isWeird: (context: MissionVoteContext) => boolean;
	isWorthCommentary: (context: MissionVoteContext) => boolean;
	getCommentary: (context: MissionVoteContext) => string;
}

// ============================================================================
// 🎯 Helper Functions
// ============================================================================

interface MissionVoteInfo {
	playerName: string;
	playerRole: string | undefined;
	votedSuccess: boolean;
}

function getMissionVotes(context: MissionContext): MissionVoteInfo[] {
	const votes: MissionVoteInfo[] = [];
	const missionVotes = context.game.outcome?.votes?.[context.missionNumber];

	if (missionVotes) {
		for (const [playerName, votedSuccess] of Object.entries(missionVotes)) {
			votes.push({
				playerName,
				playerRole: getPlayerRole(context, playerName),
				votedSuccess,
			});
		}
	}

	return votes;
}

function getFailVotes(context: MissionContext): MissionVoteInfo[] {
	return getMissionVotes(context).filter((vote) => !vote.votedSuccess);
}

function getKnownEvilFailVotes(context: MissionContext): MissionVoteInfo[] {
	return getFailVotes(context).filter((vote) => isKnownEvil(vote.playerRole));
}

// ============================================================================
// 📋 Mission Vote Predicates
// ============================================================================

// 🦆 Ducking When Good Already Won Two (evil didn't fail)
export const DuckingWhenGoodWonTwoPredicate: MissionVotePredicate = {
	name: 'DuckingWhenGoodAlreadyWonTwoMissions',
	isRelevant: (context) => {
		const voterRole = getPlayerRole(context, context.voterName);
		return alreadySucceededTwo(context) && isEvilRole(voterRole);
	},
	isWeird: (context) => context.votedSuccess,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} ducked when good already won two missions.`;
	},
};

// 🦆 Ducking When Evil Already Won Two
export const DuckingWhenEvilWonTwoPredicate: MissionVotePredicate = {
	name: 'DuckingWhenEvilAlreadyWonTwoMissions',
	isRelevant: (context) => {
		const voterRole = getPlayerRole(context, context.voterName);
		return alreadyFailedTwo(context) && isEvilRole(voterRole);
	},
	isWeird: (context) => context.votedSuccess,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} ducked when evil already won two missions.`;
	},
};

// 👻 Oberon Ducked
export const OberonDuckedPredicate: MissionVotePredicate = {
	name: 'OberonDucked',
	isRelevant: (context) => {
		const voterRole = getPlayerRole(context, context.voterName);
		return voterRole === 'Oberon';
	},
	isWeird: (context) => context.votedSuccess,
	isWorthCommentary: (context) => {
		// Don't comment if already covered by more specific predicates
		const duckingGood =
			DuckingWhenGoodWonTwoPredicate.isRelevant(context) && DuckingWhenGoodWonTwoPredicate.isWeird(context);
		const duckingEvil =
			DuckingWhenEvilWonTwoPredicate.isRelevant(context) && DuckingWhenEvilWonTwoPredicate.isWeird(context);
		return !duckingGood && !duckingEvil;
	},
	getCommentary: (context) => {
		return `👻 Oberon ${context.voterName} ducked (did not fail a mission).`;
	},
};

// 🦆 General Evil Ducked (non-Oberon)
export const EvilDuckedPredicate: MissionVotePredicate = {
	name: 'RoleDucked',
	isRelevant: (context) => {
		const voterRole = getPlayerRole(context, context.voterName);
		return isEvilRole(voterRole) && voterRole !== 'Oberon';
	},
	isWeird: (context) => context.votedSuccess,
	isWorthCommentary: (context) => {
		// Don't comment if already covered by more specific predicates
		const duckingGood =
			DuckingWhenGoodWonTwoPredicate.isRelevant(context) && DuckingWhenGoodWonTwoPredicate.isWeird(context);
		const duckingEvil =
			DuckingWhenEvilWonTwoPredicate.isRelevant(context) && DuckingWhenEvilWonTwoPredicate.isWeird(context);
		return !duckingGood && !duckingEvil;
	},
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} ducked.`;
	},
};

// ⚔️ Failure to Coordinate (multiple evil failed when not needed)
export const FailureToCoordinatePredicate: MissionVotePredicate = {
	name: 'FailureToCoordinate',
	isRelevant: (context) => {
		if (context.votedSuccess) return false;
		if (alreadyFailedTwo(context)) return false;

		const knownEvilFails = getKnownEvilFailVotes(context);
		const failsRequired = context.mission.failsRequired;
		return knownEvilFails.length > failsRequired;
	},
	isWeird: (context) => {
		// Determine who should have been the one to fail based on hammer distance
		const allFailVotes = getFailVotes(context);
		const lastProposal = context.mission.proposals[context.mission.proposals.length - 1];
		const hammerIndex = getHammerIndex(context, lastProposal.proposer);

		// Find the player who should have been the coordinated fail
		const coordinatedVote = allFailVotes.reduce((closest, vote) => {
			const closestDistance = getDistanceFromHammer(context, closest.playerName, hammerIndex);
			const voteDistance = getDistanceFromHammer(context, vote.playerName, hammerIndex);
			return voteDistance < closestDistance ? vote : closest;
		});

		return context.voterName !== coordinatedVote.playerName;
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		const knownEvilFails = getKnownEvilFailVotes(context);
		const failsRequired = context.mission.failsRequired;
		return `${getRoleEmoji(role)} ${role} ${context.voterName} failed to coordinate. ${knownEvilFails.length} known evil players voted fail, but only ${failsRequired} fails were required.`;
	},
};

// 🎯 Evil Player Not Closest to Leader Failed
export const EvilNotClosestFailedPredicate: MissionVotePredicate = {
	name: 'EvilPlayerNotClosestToLeaderFailed',
	isRelevant: (context) => {
		if (context.votedSuccess) return false;
		const voterRole = getPlayerRole(context, context.voterName);
		if (!isKnownEvil(voterRole)) return false;

		// Count known evil on mission
		const missionVotes = getMissionVotes(context);
		const knownEvilOnMission = missionVotes.filter((v) => isKnownEvil(v.playerRole));
		return knownEvilOnMission.length >= 2;
	},
	isWeird: (context) => {
		const lastProposal = context.mission.proposals[context.mission.proposals.length - 1];
		const leader = lastProposal.proposer;

		// Get all known evil on mission
		const missionVotes = getMissionVotes(context);
		const knownEvilOnMission = missionVotes.filter((v) => isKnownEvil(v.playerRole));

		// Find closest to leader
		const closest = knownEvilOnMission.reduce((min, vote) => {
			const minDistance = getDistanceFromLeader(context, min.playerName, leader);
			const voteDistance = getDistanceFromLeader(context, vote.playerName, leader);
			return voteDistance < minDistance ? vote : min;
		});

		return context.voterName !== closest.playerName && !context.votedSuccess;
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} failed the mission despite not being the evil player closest to the leader.`;
	},
};

// ============================================================================
// 🎯 Distance Calculations
// ============================================================================

function getHammerIndex(context: MissionContext, proposerName: string): number {
	const playerIndex = context.game.players.findIndex((p) => p.name === proposerName);
	const numPlayers = context.game.players.length;
	return (playerIndex + 4) % numPlayers; // 5th person after current leader
}

function getDistanceFromHammer(context: MissionContext, playerName: string, hammerIndex: number): number {
	const playerIndex = context.game.players.findIndex((p) => p.name === playerName);
	const numPlayers = context.game.players.length;
	return (hammerIndex - playerIndex + numPlayers) % numPlayers;
}

function getDistanceFromLeader(context: MissionContext, playerName: string, leaderName: string): number {
	const playerIndex = context.game.players.findIndex((p) => p.name === playerName);
	const leaderIndex = context.game.players.findIndex((p) => p.name === leaderName);
	const numPlayers = context.game.players.length;
	return (playerIndex - leaderIndex + numPlayers) % numPlayers;
}

// ============================================================================
// 📋 All Mission Vote Predicates
// ============================================================================

// Ordered by rarity (rarest first = most interesting)
// Run `npx tsx src/scripts/analyze-predicates.ts` to regenerate frequency data
export const MISSION_VOTE_PREDICATES: MissionVotePredicate[] = [
	OberonDuckedPredicate, // 855 fires
	FailureToCoordinatePredicate, // 918 fires
	DuckingWhenEvilWonTwoPredicate, // 1103 fires
	DuckingWhenGoodWonTwoPredicate, // 2239 fires
	EvilNotClosestFailedPredicate, // 4243 fires
	EvilDuckedPredicate, // 14814 fires
];

// ============================================================================
// 🎯 Evaluate Mission Vote
// ============================================================================

export function evaluateMissionVote(context: MissionVoteContext): Annotation[] {
	const annotations: Annotation[] = [];

	for (const predicate of MISSION_VOTE_PREDICATES) {
		if (predicate.isRelevant(context) && predicate.isWeird(context) && predicate.isWorthCommentary(context)) {
			annotations.push({
				type: 'missionVote',
				predicateName: predicate.name,
				commentary: predicate.getCommentary(context),
				playerName: context.voterName,
				playerRole: getPlayerRole(context, context.voterName),
			});
		}
	}

	return annotations;
}
