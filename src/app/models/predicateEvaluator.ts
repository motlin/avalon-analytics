/**
 * Predicate Evaluation with Opportunity Tracking
 *
 * Evaluates predicates and tracks both:
 * - isRelevant (opportunity/denominator): when the predicate could have fired
 * - fired (numerator): isRelevant && isWeird && isWorthCommentary
 *
 * This enables calculating rates like "how often does player X do behavior Y when given the opportunity?"
 */

import type {Game, Mission, Proposal} from './game';
import type {
	GameContext,
	MissionContext,
	MissionVoteContext,
	ProposalContext,
	ProposalVoteContext,
} from './annotations';
import {createGameContext, getPlayerRole, isEvilRole, isGoodRole} from './annotations';
import type {ProposalPredicate} from './proposalPredicates';
import {PROPOSAL_PREDICATES} from './proposalPredicates';
import type {ProposalVotePredicate} from './proposalVotePredicates';
import {PROPOSAL_VOTE_PREDICATES} from './proposalVotePredicates';
import type {MissionVotePredicate} from './missionVotePredicates';
import {MISSION_VOTE_PREDICATES} from './missionVotePredicates';

// ============================================================================
// Evaluation Result Types
// ============================================================================

export type Alignment = 'good' | 'evil' | 'unknown';

export interface PredicateEvaluationResult {
	predicateName: string;
	playerName: string;
	playerRole: string | undefined;
	alignment: Alignment;
	/** When the predicate could have fired (denominator) */
	isRelevant: boolean;
	/** isRelevant && isWeird && isWorthCommentary (numerator) */
	fired: boolean;
}

export interface GamePredicateResults {
	game: Game;
	proposalResults: PredicateEvaluationResult[];
	proposalVoteResults: PredicateEvaluationResult[];
	missionVoteResults: PredicateEvaluationResult[];
}

// ============================================================================
// Alignment Helper
// ============================================================================

function getAlignment(role: string | undefined): Alignment {
	if (!role) return 'unknown';
	if (isGoodRole(role)) return 'good';
	if (isEvilRole(role)) return 'evil';
	return 'unknown';
}

// ============================================================================
// Proposal Predicate Evaluation
// ============================================================================

function evaluateProposalPredicate(predicate: ProposalPredicate, context: ProposalContext): PredicateEvaluationResult {
	const playerName = context.proposal.proposer;
	const playerRole = getPlayerRole(context, playerName);
	const isRelevant = predicate.isRelevant(context);
	const fired = isRelevant && predicate.isWeird(context) && predicate.isWorthCommentary(context);

	return {
		predicateName: predicate.name,
		playerName,
		playerRole,
		alignment: getAlignment(playerRole),
		isRelevant,
		fired,
	};
}

function evaluateAllProposalPredicates(context: ProposalContext): PredicateEvaluationResult[] {
	return PROPOSAL_PREDICATES.map((predicate) => evaluateProposalPredicate(predicate, context));
}

// ============================================================================
// Proposal Vote Predicate Evaluation
// ============================================================================

function evaluateProposalVotePredicate(
	predicate: ProposalVotePredicate,
	context: ProposalVoteContext,
): PredicateEvaluationResult {
	const playerName = context.voterName;
	const playerRole = getPlayerRole(context, playerName);
	const isRelevant = predicate.isRelevant(context);
	const fired = isRelevant && predicate.isWeird(context) && predicate.isWorthCommentary(context);

	return {
		predicateName: predicate.name,
		playerName,
		playerRole,
		alignment: getAlignment(playerRole),
		isRelevant,
		fired,
	};
}

function evaluateAllProposalVotePredicates(context: ProposalVoteContext): PredicateEvaluationResult[] {
	return PROPOSAL_VOTE_PREDICATES.map((predicate) => evaluateProposalVotePredicate(predicate, context));
}

// ============================================================================
// Mission Vote Predicate Evaluation
// ============================================================================

function evaluateMissionVotePredicate(
	predicate: MissionVotePredicate,
	context: MissionVoteContext,
): PredicateEvaluationResult {
	const playerName = context.voterName;
	const playerRole = getPlayerRole(context, playerName);
	const isRelevant = predicate.isRelevant(context);
	const fired = isRelevant && predicate.isWeird(context) && predicate.isWorthCommentary(context);

	return {
		predicateName: predicate.name,
		playerName,
		playerRole,
		alignment: getAlignment(playerRole),
		isRelevant,
		fired,
	};
}

function evaluateAllMissionVotePredicates(context: MissionVoteContext): PredicateEvaluationResult[] {
	return MISSION_VOTE_PREDICATES.map((predicate) => evaluateMissionVotePredicate(predicate, context));
}

// ============================================================================
// Full Game Evaluation
// ============================================================================

/**
 * Evaluates all predicates for an entire game and returns opportunity tracking data.
 * This is the main entry point for generating annotation statistics.
 */
export function evaluateGamePredicates(game: Game): GamePredicateResults {
	const context = createGameContext(game);
	const proposalResults: PredicateEvaluationResult[] = [];
	const proposalVoteResults: PredicateEvaluationResult[] = [];
	const missionVoteResults: PredicateEvaluationResult[] = [];

	for (let missionIndex = 0; missionIndex < game.missions.length; missionIndex++) {
		const mission = game.missions[missionIndex];
		const missionContext: MissionContext = {
			...context,
			mission,
			missionNumber: missionIndex,
		};

		// Evaluate each proposal in the mission
		for (let proposalIndex = 0; proposalIndex < mission.proposals.length; proposalIndex++) {
			const proposal = mission.proposals[proposalIndex];
			const proposalContext: ProposalContext = {
				...missionContext,
				proposal,
				proposalNumber: proposalIndex,
			};

			// Evaluate proposal predicates (for the proposer)
			proposalResults.push(...evaluateAllProposalPredicates(proposalContext));

			// Evaluate proposal vote predicates (for each voter)
			for (const player of game.players) {
				const votedYes = proposal.votes.includes(player.name);
				const voteContext: ProposalVoteContext = {
					...proposalContext,
					voterName: player.name,
					votedYes,
				};
				proposalVoteResults.push(...evaluateAllProposalVotePredicates(voteContext));
			}
		}

		// Evaluate mission vote predicates (from outcome data)
		const missionVotes = game.outcome?.votes?.[missionIndex];
		if (missionVotes) {
			for (const [playerName, votedSuccess] of Object.entries(missionVotes)) {
				const voteContext: MissionVoteContext = {
					...missionContext,
					voterName: playerName,
					votedSuccess,
				};
				missionVoteResults.push(...evaluateAllMissionVotePredicates(voteContext));
			}
		}
	}

	return {
		game,
		proposalResults,
		proposalVoteResults,
		missionVoteResults,
	};
}

// ============================================================================
// Utility Functions for Aggregating Results
// ============================================================================

export interface PredicateOpportunitySummary {
	predicateName: string;
	playerName: string;
	playerRole: string | undefined;
	alignment: Alignment;
	opportunities: number;
	fires: number;
}

/**
 * Aggregates evaluation results by player and predicate.
 * Returns a map keyed by "${playerName}:${predicateName}".
 */
export function aggregateResultsByPlayerAndPredicate(
	results: PredicateEvaluationResult[],
): Map<string, PredicateOpportunitySummary> {
	const summaries = new Map<string, PredicateOpportunitySummary>();

	for (const result of results) {
		const key = `${result.playerName}:${result.predicateName}`;
		let summary = summaries.get(key);

		if (!summary) {
			summary = {
				predicateName: result.predicateName,
				playerName: result.playerName,
				playerRole: result.playerRole,
				alignment: result.alignment,
				opportunities: 0,
				fires: 0,
			};
			summaries.set(key, summary);
		}

		if (result.isRelevant) {
			summary.opportunities++;
		}
		if (result.fired) {
			summary.fires++;
		}
	}

	return summaries;
}

/**
 * Gets all results from a GamePredicateResults as a flat array.
 */
export function getAllResults(gameResults: GamePredicateResults): PredicateEvaluationResult[] {
	return [...gameResults.proposalResults, ...gameResults.proposalVoteResults, ...gameResults.missionVoteResults];
}
