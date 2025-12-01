/**
 * 🎯 Game Annotator
 *
 * Combines all predicates to generate a fully annotated game log.
 * Creates structured data for display in the AnnotatedGameTimeline component.
 */

import type {Game, Mission, Proposal} from './game';
import type {
	AnnotatedGame,
	AnnotatedMission,
	AnnotatedPlayerRow,
	AnnotatedProposal,
	Annotation,
	GameContext,
	MissionContext,
	MissionVoteContext,
	ProposalContext,
	ProposalVoteContext,
} from './annotations';
import {createGameContext, getPlayerRole, getRoleEmoji, isEvilRole, isGoodRole} from './annotations';
import {evaluateProposal} from './proposalPredicates';
import {evaluateProposalVote} from './proposalVotePredicates';
import {evaluateMissionVote} from './missionVotePredicates';

// ============================================================================
// 🎯 Main Annotator
// ============================================================================

export function annotateGame(game: Game): AnnotatedGame {
	const context = createGameContext(game);

	const annotatedMissions: AnnotatedMission[] = game.missions.map((mission, missionIndex) => {
		return annotateMission(context, mission, missionIndex);
	});

	return {
		game,
		missions: annotatedMissions,
	};
}

function annotateMission(context: GameContext, mission: Mission, missionIndex: number): AnnotatedMission {
	const missionContext: MissionContext = {
		...context,
		mission,
		missionNumber: missionIndex,
	};

	const annotatedProposals: AnnotatedProposal[] = mission.proposals.map((proposal, proposalIndex) => {
		return annotateProposal(missionContext, proposal, proposalIndex);
	});

	// Evaluate mission votes (from outcome data)
	const missionVoteAnnotations = evaluateMissionVotes(missionContext);

	return {
		missionNumber: missionIndex + 1,
		mission,
		state: mission.state,
		failCount: mission.numFails ?? 0,
		proposals: annotatedProposals,
		missionVoteAnnotations,
	};
}

function annotateProposal(
	missionContext: MissionContext,
	proposal: Proposal,
	proposalIndex: number,
): AnnotatedProposal {
	const context: ProposalContext = {
		...missionContext,
		proposal,
		proposalNumber: proposalIndex,
	};

	// Evaluate proposal-level predicates
	const proposalAnnotations = evaluateProposal(context);

	// Build player rows with vote annotations
	const playerRows = buildPlayerRows(context);

	return {
		missionNumber: missionContext.missionNumber + 1,
		proposalNumber: proposalIndex + 1,
		proposal,
		proposerRole: getPlayerRole(context, proposal.proposer),
		annotations: proposalAnnotations,
		playerRows,
	};
}

function buildPlayerRows(context: ProposalContext): AnnotatedPlayerRow[] {
	const rows: AnnotatedPlayerRow[] = [];

	for (const player of context.game.players) {
		const votedYes = context.proposal.votes.includes(player.name);

		const voteContext: ProposalVoteContext = {
			...context,
			voterName: player.name,
			votedYes,
		};

		const voteAnnotations = evaluateProposalVote(voteContext);

		rows.push({
			playerName: player.name,
			playerRole: getPlayerRole(context, player.name),
			isLeader: context.proposal.proposer === player.name,
			isOnTeam: context.proposal.team.includes(player.name),
			votedYes,
			voteAnnotations,
		});
	}

	return rows;
}

function evaluateMissionVotes(context: MissionContext): Annotation[] {
	const annotations: Annotation[] = [];
	const missionVotes = context.game.outcome?.votes?.[context.missionNumber];

	if (!missionVotes) return annotations;

	for (const [playerName, votedSuccess] of Object.entries(missionVotes)) {
		const voteContext: MissionVoteContext = {
			...context,
			voterName: playerName,
			votedSuccess,
		};

		const voteAnnotations = evaluateMissionVote(voteContext);
		annotations.push(...voteAnnotations);
	}

	return annotations;
}

// ============================================================================
// 📊 Summary Statistics
// ============================================================================

export interface GameStats {
	totalAnnotations: number;
	proposalAnnotations: number;
	proposalVoteAnnotations: number;
	missionVoteAnnotations: number;
	annotationsByPredicate: Map<string, number>;
	annotationsByPlayer: Map<string, number>;
}

export function getGameStats(annotatedGame: AnnotatedGame): GameStats {
	const stats: GameStats = {
		totalAnnotations: 0,
		proposalAnnotations: 0,
		proposalVoteAnnotations: 0,
		missionVoteAnnotations: 0,
		annotationsByPredicate: new Map(),
		annotationsByPlayer: new Map(),
	};

	for (const mission of annotatedGame.missions) {
		for (const proposal of mission.proposals) {
			// Count proposal annotations
			for (const annotation of proposal.annotations) {
				stats.totalAnnotations++;
				stats.proposalAnnotations++;
				incrementMap(stats.annotationsByPredicate, annotation.predicateName);
				incrementMap(stats.annotationsByPlayer, annotation.playerName);
			}

			// Count vote annotations
			for (const row of proposal.playerRows) {
				for (const annotation of row.voteAnnotations) {
					stats.totalAnnotations++;
					stats.proposalVoteAnnotations++;
					incrementMap(stats.annotationsByPredicate, annotation.predicateName);
					incrementMap(stats.annotationsByPlayer, annotation.playerName);
				}
			}
		}

		// Count mission vote annotations
		for (const annotation of mission.missionVoteAnnotations) {
			stats.totalAnnotations++;
			stats.missionVoteAnnotations++;
			incrementMap(stats.annotationsByPredicate, annotation.predicateName);
			incrementMap(stats.annotationsByPlayer, annotation.playerName);
		}
	}

	return stats;
}

function incrementMap(map: Map<string, number>, key: string): void {
	map.set(key, (map.get(key) ?? 0) + 1);
}

// ============================================================================
// 🎨 Display Helpers
// ============================================================================

export function formatRoleWithEmoji(role: string | undefined): string {
	if (!role) return '❓Unknown';
	return `${getRoleEmoji(role)}${role}`;
}

export function formatTeamIndicator(isLeader: boolean, isOnTeam: boolean): string {
	if (isLeader && isOnTeam) return '👑☑️';
	if (isLeader) return '👑⬜';
	if (isOnTeam) return '⬜☑️';
	return '⬜⬜';
}

export function formatVoteIndicator(votedYes: boolean): string {
	return votedYes ? '✅' : '❌';
}

export function formatMissionOutcome(state: 'SUCCESS' | 'FAIL' | 'PENDING', failCount: number): string {
	if (state === 'PENDING') return 'Pending';
	if (state === 'SUCCESS')
		return failCount > 0 ? `Success (${failCount} fail${failCount > 1 ? 's' : ''})` : 'Success';
	return `Failed with ${failCount} fail${failCount !== 1 ? 's' : ''}`;
}

export function formatProposalOutcome(
	state: 'APPROVED' | 'REJECTED' | 'PENDING',
	yesVotes: number,
	totalPlayers: number,
): string {
	if (state === 'PENDING') return 'Pending';
	return `${state === 'APPROVED' ? 'Approved' : 'Rejected'} with ${yesVotes}/${totalPlayers}`;
}

export function getTeamComposition(playerRows: AnnotatedPlayerRow[]): {good: number; evil: number; unknown: number} {
	const teamMembers = playerRows.filter((row) => row.isOnTeam);
	return {
		good: teamMembers.filter((row) => isGoodRole(row.playerRole)).length,
		evil: teamMembers.filter((row) => isEvilRole(row.playerRole)).length,
		unknown: teamMembers.filter(
			(row) => !row.playerRole || (!isGoodRole(row.playerRole) && !isEvilRole(row.playerRole)),
		).length,
	};
}
