/**
 * 🎯 Proposal Predicates
 *
 * TypeScript port of WeirdProposalPredicate from avalon-log-scraper.
 * Analyzes proposals to identify noteworthy team compositions and leader behaviors.
 */

import type {Annotation, GameContext, ProposalContext} from './annotations';
import {
	countSeenEvilOnTeam,
	gameIncludesRole,
	getHammerPlayer,
	getLeaderRole,
	getMaxTeamSize,
	getPlayerRole,
	getRoleEmoji,
	isAllGoodTeam,
	isEvilRole,
	isKnownEvil,
	teamIncludesPlayer,
	teamIncludesRole,
	alreadyFailedTwo,
} from './annotations';

// ============================================================================
// 🔧 Predicate Interface
// ============================================================================

export interface ProposalPredicate {
	name: string;
	isRelevant: (context: ProposalContext) => boolean;
	isWeird: (context: ProposalContext) => boolean;
	isWorthCommentary: (context: ProposalContext) => boolean;
	getCommentary: (context: ProposalContext) => string;
}

// ============================================================================
// 🎯 Helper Functions
// ============================================================================

/**
 * Checks if this is an "evil hammer win" scenario - where evil wins by
 * having all 5 proposals rejected (auto-fail). In this case, the hammer
 * proposal behavior is not noteworthy since evil already won.
 */
function isEvilHammerWin(context: ProposalContext): boolean {
	// If it's the hammer (5th proposal) and it was rejected, evil wins
	if (context.proposalNumber !== 4) return false;
	// Check if the proposal was rejected (no team was sent)
	return context.proposal.state === 'REJECTED';
}

function findFirstProposalMatching(
	context: GameContext,
	predicate: (proposalContext: ProposalContext) => boolean,
): {missionNumber: number; proposalNumber: number} | null {
	for (let missionIndex = 0; missionIndex < context.game.missions.length; missionIndex++) {
		const mission = context.game.missions[missionIndex];
		for (let proposalIndex = 0; proposalIndex < mission.proposals.length; proposalIndex++) {
			const proposal = mission.proposals[proposalIndex];
			const proposalContext: ProposalContext = {
				...context,
				mission,
				missionNumber: missionIndex,
				proposal,
				proposalNumber: proposalIndex,
			};
			if (predicate(proposalContext)) {
				return {missionNumber: missionIndex, proposalNumber: proposalIndex};
			}
		}
	}
	return null;
}

// ============================================================================
// 📋 Proposal Predicates
// ============================================================================

// 🌟 First All Good Team
export const FirstAllGoodTeamPredicate: ProposalPredicate = {
	name: 'FirstAllGoodTeamProposalPredicate',
	isRelevant: (context) => {
		if (!isAllGoodTeam(context)) return false;
		const first = findFirstProposalMatching(context, isAllGoodTeam);
		return first?.missionNumber === context.missionNumber && first?.proposalNumber === context.proposalNumber;
	},
	isWeird: () => true,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed the first all good team.`;
	},
};

// 🌟 First All Good Team of Max Size
export const FirstAllGoodTeamOfMaxSizePredicate: ProposalPredicate = {
	name: 'FirstAllGoodTeamOfMaxSizeProposalPredicate',
	isRelevant: (context) => {
		const maxSize = getMaxTeamSize(context.game);
		if (context.mission.teamSize !== maxSize) return false;
		if (!isAllGoodTeam(context)) return false;

		const first = findFirstProposalMatching(context, (ctx) => {
			return ctx.mission.teamSize === maxSize && isAllGoodTeam(ctx);
		});
		return first?.missionNumber === context.missionNumber && first?.proposalNumber === context.proposalNumber;
	},
	isWeird: () => true,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed an all good team of max size.`;
	},
};

/**
 * Percival correctly identified and proposed Merlin without also proposing Morgana.
 * This indicates Percival successfully distinguished between Merlin and Morgana.
 */
export const PercivalProposingMerlinPredicate: ProposalPredicate = {
	name: 'PercivalProposingMerlinProposalPredicate',
	isRelevant: (context) => getLeaderRole(context) === 'Percival' && gameIncludesRole(context, 'Morgana'),
	isWeird: (context) => teamIncludesRole(context, 'Merlin') && !teamIncludesRole(context, 'Morgana'),
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `🧔 Percival ${context.proposal.proposer} proposed Merlin.`;
	},
};

/**
 * Percival incorrectly proposed Morgana without Merlin.
 * This indicates Percival was fooled by Morgana.
 */
export const PercivalProposingMorganaPredicate: ProposalPredicate = {
	name: 'PercivalProposingMorganaProposalPredicate',
	isRelevant: (context) => getLeaderRole(context) === 'Percival' && gameIncludesRole(context, 'Morgana'),
	isWeird: (context) => teamIncludesRole(context, 'Morgana') && !teamIncludesRole(context, 'Merlin'),
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `🧔 Percival ${context.proposal.proposer} proposed Morgana.`;
	},
};

/**
 * Percival proposed both Merlin and Morgana, hedging their bet.
 * This is notably safer than guessing wrong.
 */
export const PercivalProposingMerlinAndMorganaPredicate: ProposalPredicate = {
	name: 'PercivalProposingMerlinAndMorganaProposalPredicate',
	isRelevant: (context) => getLeaderRole(context) === 'Percival' && gameIncludesRole(context, 'Morgana'),
	isWeird: (context) => teamIncludesRole(context, 'Merlin') && teamIncludesRole(context, 'Morgana'),
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `🧔 Percival ${context.proposal.proposer} proposed both Merlin and Morgana.`;
	},
};

// 🧔 Percival Excluding Merlin (without Morgana in game)
export const PercivalExcludingMerlinWithoutMorganaPredicate: ProposalPredicate = {
	name: 'PercivalExcludingMerlinWithoutMorganaProposalPredicate',
	isRelevant: (context) => getLeaderRole(context) === 'Percival' && !gameIncludesRole(context, 'Morgana'),
	isWeird: (context) => !teamIncludesRole(context, 'Merlin'),
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `🧔 Percival ${context.proposal.proposer} excluded Merlin despite knowing who Merlin is.`;
	},
};

// 🧙 Merlin Proposing Morgana
export const MerlinProposingMorganaPredicate: ProposalPredicate = {
	name: 'ProposedMorganaProposalPredicate',
	isRelevant: (context) => {
		const role = getLeaderRole(context);
		return role === 'Merlin' || role === 'Percival';
	},
	isWeird: (context) => teamIncludesRole(context, 'Morgana'),
	isWorthCommentary: (context) => {
		// Don't double-report if Percival proposing Morgana
		if (
			PercivalProposingMorganaPredicate.isRelevant(context) &&
			PercivalProposingMorganaPredicate.isWeird(context)
		) {
			return false;
		}
		return true;
	},
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed a team with Morgana.`;
	},
};

/**
 * Morgana proposed Merlin on their team.
 * Morgana knows who Merlin is, so this is a deliberate inclusion.
 */
export const MorganaProposingMerlinPredicate: ProposalPredicate = {
	name: 'MorganaProposingMerlinProposalPredicate',
	isRelevant: (context) => getLeaderRole(context) === 'Morgana',
	isWeird: (context) => teamIncludesRole(context, 'Merlin'),
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `🧙 Morgana ${context.proposal.proposer} proposed a team with Merlin.`;
	},
};

// 🎭 Merlin-Morgana Two Person Team
export const MerlinMorganaTwoPredicate: ProposalPredicate = {
	name: 'MerlinMorganaProposalPredicate',
	isRelevant: (context) => context.mission.teamSize === 2,
	isWeird: (context) => teamIncludesRole(context, 'Merlin') && teamIncludesRole(context, 'Morgana'),
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed a team with just Merlin and Morgana.`;
	},
};

// 🎯 Proposed Two Other Players (not including self)
export const ProposedTwoOtherPlayersPredicate: ProposalPredicate = {
	name: 'ProposedTwoOtherPlayersProposalPredicate',
	isRelevant: (context) => context.mission.teamSize === 2,
	isWeird: (context) => !teamIncludesPlayer(context, context.proposal.proposer),
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed a team with two other players.`;
	},
};

// 🎭 Merlin-Morgana-Self Three Person Team
export const MerlinMorganaSelfPredicate: ProposalPredicate = {
	name: 'MerlinMorganaSelfProposalPredicate',
	isRelevant: (context) => {
		const leaderRole = getLeaderRole(context);
		return (
			context.mission.teamSize === 3 &&
			teamIncludesPlayer(context, context.proposal.proposer) &&
			leaderRole !== 'Merlin' &&
			leaderRole !== 'Morgana'
		);
	},
	isWeird: (context) => teamIncludesRole(context, 'Merlin') && teamIncludesRole(context, 'Morgana'),
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed a team with both Merlin and Morgana.`;
	},
};

// 🚫 Proposal Without Self
export const ProposalWithoutSelfPredicate: ProposalPredicate = {
	name: 'ProposalWithoutSelfProposalPredicate',
	isRelevant: () => true,
	isWeird: (context) => !teamIncludesPlayer(context, context.proposal.proposer),
	isWorthCommentary: (context) => {
		// Don't comment if it's an all-good team without self (more specific predicate)
		if (isAllGoodTeam(context) && !teamIncludesPlayer(context, context.proposal.proposer)) {
			return false;
		}
		return true;
	},
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed a team without self.`;
	},
};

// 😇 All Good Team Without Self
export const AllGoodTeamWithoutSelfPredicate: ProposalPredicate = {
	name: 'EntirelyGoodTeamWithoutSelfProposalPredicate',
	isRelevant: () => true,
	isWeird: (context) => isAllGoodTeam(context) && !teamIncludesPlayer(context, context.proposal.proposer),
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed an all good team without self.`;
	},
};

// ⚠️ Risking Loss (proposing evil when 2 have already failed)
export const RiskingLossPredicate: ProposalPredicate = {
	name: 'RiskingLossProposalPredicate',
	isRelevant: (context) => alreadyFailedTwo(context),
	isWeird: (context) => countSeenEvilOnTeam(context) > 0,
	isWorthCommentary: (context) => {
		const leaderRole = getLeaderRole(context);
		// Not weird if evil leader puts self on team
		if (teamIncludesPlayer(context, context.proposal.proposer) && isEvilRole(leaderRole)) {
			return false;
		}
		return true;
	},
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		const evilCount = countSeenEvilOnTeam(context);
		const failsRequired = context.mission.failsRequired;
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} risked losing by proposing a team with ${evilCount} seen evil players when ${failsRequired} fails were required and two missions had already failed.`;
	},
};

// 🎯 One Evil Team when 2 Fails Required (first occurrence)
export const OneEvilTeamFirstPredicate: ProposalPredicate = {
	name: 'OneEvilTeamFirstProposalPredicate',
	isRelevant: (context) => {
		if (context.mission.failsRequired !== 2) return false;
		if (countSeenEvilOnTeam(context) !== 1) return false;

		const first = findFirstProposalMatching(context, (ctx) => {
			return ctx.mission.failsRequired === 2 && countSeenEvilOnTeam(ctx) === 1;
		});
		return first?.missionNumber === context.missionNumber && first?.proposalNumber === context.proposalNumber;
	},
	isWeird: () => true,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed the first team with just one evil player when 2 fails are required.`;
	},
};

// 🎯 One Evil Team when 2 Fails Required (general case, not first)
export const OneEvilTeamPredicate: ProposalPredicate = {
	name: 'OneEvilTeamProposalPredicate',
	isRelevant: (context) => context.mission.failsRequired === 2,
	isWeird: (context) => countSeenEvilOnTeam(context) === 1,
	isWorthCommentary: (context) => !OneEvilTeamFirstPredicate.isRelevant(context),
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed a team with just one evil player when 2 fails are required.`;
	},
};

// 📋 Same Team as Previously Approved Proposal
export const SameTeamApprovedProposalPredicate: ProposalPredicate = {
	name: 'SameTeamApprovedProposalPredicate',
	isRelevant: () => true,
	isWeird: (context) => {
		const currentTeam = [...context.proposal.team].sort();

		// Look through all previous proposals for approved ones
		for (let missionIndex = 0; missionIndex <= context.missionNumber; missionIndex++) {
			const mission = context.game.missions[missionIndex];
			const proposalLimit =
				missionIndex === context.missionNumber ? context.proposalNumber : mission.proposals.length;

			for (let proposalIndex = 0; proposalIndex < proposalLimit; proposalIndex++) {
				const previousProposal = mission.proposals[proposalIndex];
				if (previousProposal.state !== 'APPROVED') continue;
				const previousTeam = [...previousProposal.team].sort();
				if (JSON.stringify(currentTeam) === JSON.stringify(previousTeam)) {
					return true;
				}
			}
		}
		return false;
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		const currentTeam = [...context.proposal.team].sort();

		// Find the previous matching approved proposal
		for (let missionIndex = 0; missionIndex <= context.missionNumber; missionIndex++) {
			const mission = context.game.missions[missionIndex];
			const proposalLimit =
				missionIndex === context.missionNumber ? context.proposalNumber : mission.proposals.length;

			for (let proposalIndex = 0; proposalIndex < proposalLimit; proposalIndex++) {
				const previousProposal = mission.proposals[proposalIndex];
				if (previousProposal.state !== 'APPROVED') continue;
				const previousTeam = [...previousProposal.team].sort();
				if (JSON.stringify(currentTeam) === JSON.stringify(previousTeam)) {
					return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} copied the approved team from mission ${missionIndex + 1}.`;
				}
			}
		}
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} copied a previously approved team.`;
	},
};

// 📋 Same Team as Previously Rejected Proposal
export const SameTeamRejectedProposalPredicate: ProposalPredicate = {
	name: 'SameTeamRejectedProposalPredicate',
	isRelevant: () => true,
	isWeird: (context) => {
		const currentTeam = [...context.proposal.team].sort();

		// Look through all previous proposals for rejected ones
		for (let missionIndex = 0; missionIndex <= context.missionNumber; missionIndex++) {
			const mission = context.game.missions[missionIndex];
			const proposalLimit =
				missionIndex === context.missionNumber ? context.proposalNumber : mission.proposals.length;

			for (let proposalIndex = 0; proposalIndex < proposalLimit; proposalIndex++) {
				const previousProposal = mission.proposals[proposalIndex];
				if (previousProposal.state !== 'REJECTED') continue;
				const previousTeam = [...previousProposal.team].sort();
				if (JSON.stringify(currentTeam) === JSON.stringify(previousTeam)) {
					return true;
				}
			}
		}
		return false;
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		const currentTeam = [...context.proposal.team].sort();

		// Find the previous matching rejected proposal
		for (let missionIndex = 0; missionIndex <= context.missionNumber; missionIndex++) {
			const mission = context.game.missions[missionIndex];
			const proposalLimit =
				missionIndex === context.missionNumber ? context.proposalNumber : mission.proposals.length;

			for (let proposalIndex = 0; proposalIndex < proposalLimit; proposalIndex++) {
				const previousProposal = mission.proposals[proposalIndex];
				if (previousProposal.state !== 'REJECTED') continue;
				const previousTeam = [...previousProposal.team].sort();
				if (JSON.stringify(currentTeam) === JSON.stringify(previousTeam)) {
					return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} re-proposed the rejected team from mission ${missionIndex + 1} proposal ${proposalIndex + 1}.`;
				}
			}
		}
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} re-proposed a previously rejected team.`;
	},
};

// 😈 Too Many Evil Players on Team
export const TooManyEvilPlayersPredicate: ProposalPredicate = {
	name: 'TooManyEvilPlayersProposalPredicate',
	isRelevant: (context) => {
		const leaderRole = getLeaderRole(context);
		return isKnownEvil(leaderRole);
	},
	isWeird: (context) => {
		const knownEvilCount = context.proposal.team.filter((name) => isKnownEvil(getPlayerRole(context, name))).length;
		return knownEvilCount > context.mission.failsRequired;
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed a team with more evil players than fails required.`;
	},
};

// 🔨 Hammer Pandering (including the hammer player on proposals 1-4)
export const HammerPanderingPredicate: ProposalPredicate = {
	name: 'HammerPanderingProposalPredicate',
	isRelevant: (context) => {
		// Not relevant for the 5th proposal (hammer proposal)
		if (context.proposalNumber >= 4) return false;
		// Not relevant at maximum team size - limited player choices make including hammer less noteworthy
		if (context.mission.teamSize === getMaxTeamSize(context.game)) return false;
		return true;
	},
	isWeird: (context) => {
		const hammer = getHammerPlayer(context);
		return hammer !== null && teamIncludesPlayer(context, hammer);
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		const hammer = getHammerPlayer(context);
		const hammerRole = hammer ? (getPlayerRole(context, hammer) ?? 'Unknown') : 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} pandered to the hammer ${getRoleEmoji(hammerRole)} ${hammerRole} ${hammer}.`;
	},
};

// 🔨 Is Hammer (5th proposal - always noted)
export const IsHammerPredicate: ProposalPredicate = {
	name: 'FirstHammerProposalPredicate',
	isRelevant: (context) => context.proposalNumber === 4, // 0-indexed, so 4 = 5th proposal
	isWeird: () => true,
	isWorthCommentary: () => false, // Just for tracking, not commentary
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} was the hammer.`;
	},
};

// 🔨 Known Evil Hammer Adding Known Evil
export const KnownEvilHammerPredicate: ProposalPredicate = {
	name: 'KnownEvilHammerProposalPredicate',
	isRelevant: (context) => {
		// Skip if this is an evil hammer win (auto-fail scenario)
		if (isEvilHammerWin(context)) return false;
		// Only relevant for hammer proposals (5th proposal) by known evil leaders
		return context.proposalNumber === 4 && isKnownEvil(getLeaderRole(context));
	},
	isWeird: (context) => {
		// Weird if team has 2 or more known evil players (leader + another)
		const knownEvilCount = context.proposal.team.filter((name) => isKnownEvil(getPlayerRole(context, name))).length;
		return knownEvilCount >= 2;
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed a team with an additional known evil.`;
	},
};

// 💭 No Dream Team Plus Self (didn't propose dream team + self when team size increased by 1)
export const NoDreamTeamPlusSelfPredicate: ProposalPredicate = {
	name: 'NoDreamTeamPlusSelfProposalPredicate',
	isRelevant: (context) => {
		// Skip if this is an evil hammer win (auto-fail scenario)
		if (isEvilHammerWin(context)) return false;

		// Not relevant for first mission
		if (context.missionNumber === 0) return false;

		const previousMission = context.game.missions[context.missionNumber - 1];

		// Only relevant if team size increased by exactly 1
		if (previousMission.teamSize + 1 !== context.mission.teamSize) return false;

		// Only relevant if previous mission succeeded
		if (previousMission.state !== 'SUCCESS') return false;

		// Only relevant if leader was NOT on the dream team (so they should add themselves)
		const lastProposalIndex = previousMission.proposals.length - 1;
		const dreamTeam = previousMission.proposals[lastProposalIndex].team;
		return !dreamTeam.includes(context.proposal.proposer);
	},
	isWeird: (context) => {
		if (context.missionNumber === 0) return false;

		const previousMission = context.game.missions[context.missionNumber - 1];
		const lastProposalIndex = previousMission.proposals.length - 1;
		const dreamTeam = previousMission.proposals[lastProposalIndex].team;

		// Weird if leader didn't include themselves OR didn't include the entire dream team
		return (
			!teamIncludesPlayer(context, context.proposal.proposer) ||
			!dreamTeam.every((player) => context.proposal.team.includes(player))
		);
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} didn't propose the dream team plus self.`;
	},
};

// 🧙 Final All Good Team Does Not Include Merlin
export const FinalAllGoodTeamDoesNotIncludeMerlinPredicate: ProposalPredicate = {
	name: 'FinalAllGoodTeamDoesNotIncludeMerlinProposalPredicate',
	isRelevant: (context) => context.missionNumber === 4 && isAllGoodTeam(context),
	isWeird: (context) => !teamIncludesRole(context, 'Merlin'),
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed an all good team without Merlin.`;
	},
};

// 🧔 Final All Good Team Does Not Include Percival
export const FinalAllGoodTeamDoesNotIncludePercivalPredicate: ProposalPredicate = {
	name: 'FinalAllGoodTeamDoesNotIncludePercivalProposalPredicate',
	isRelevant: (context) => context.missionNumber === 4 && isAllGoodTeam(context),
	isWeird: (context) => !teamIncludesRole(context, 'Percival'),
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} proposed an all good team without Percival.`;
	},
};

// 💭 No Dream Team (didn't propose the team that succeeded on previous mission of same size)
export const NoDreamTeamPredicate: ProposalPredicate = {
	name: 'NoDreamTeamProposalPredicate',
	isRelevant: (context) => {
		// Skip if this is an evil hammer win (auto-fail scenario)
		if (isEvilHammerWin(context)) return false;

		// Not relevant for first mission
		if (context.missionNumber === 0) return false;

		const previousMission = context.game.missions[context.missionNumber - 1];

		// Only relevant if previous mission had same team size AND succeeded
		return previousMission.teamSize === context.mission.teamSize && previousMission.state === 'SUCCESS';
	},
	isWeird: (context) => {
		if (context.missionNumber === 0) return false;

		const previousMission = context.game.missions[context.missionNumber - 1];
		const lastProposalIndex = previousMission.proposals.length - 1;
		const dreamTeam = previousMission.proposals[lastProposalIndex].team;

		// Weird if current team doesn't contain all players from the dream team
		return !dreamTeam.every((player) => context.proposal.team.includes(player));
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getLeaderRole(context) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.proposal.proposer} didn't propose the dream team.`;
	},
};

// ============================================================================
// 📋 All Proposal Predicates
// ============================================================================

export const PROPOSAL_PREDICATES: ProposalPredicate[] = [
	FirstAllGoodTeamPredicate,
	FirstAllGoodTeamOfMaxSizePredicate,
	PercivalProposingMerlinPredicate,
	PercivalProposingMorganaPredicate,
	PercivalProposingMerlinAndMorganaPredicate,
	PercivalExcludingMerlinWithoutMorganaPredicate,
	MerlinProposingMorganaPredicate,
	MorganaProposingMerlinPredicate,
	MerlinMorganaTwoPredicate,
	MerlinMorganaSelfPredicate,
	ProposedTwoOtherPlayersPredicate,
	AllGoodTeamWithoutSelfPredicate,
	ProposalWithoutSelfPredicate,
	RiskingLossPredicate,
	OneEvilTeamFirstPredicate,
	OneEvilTeamPredicate,
	SameTeamApprovedProposalPredicate,
	SameTeamRejectedProposalPredicate,
	NoDreamTeamPlusSelfPredicate,
	NoDreamTeamPredicate,
	FinalAllGoodTeamDoesNotIncludeMerlinPredicate,
	FinalAllGoodTeamDoesNotIncludePercivalPredicate,
	TooManyEvilPlayersPredicate,
	HammerPanderingPredicate,
	KnownEvilHammerPredicate,
	IsHammerPredicate,
];

// ============================================================================
// 🎯 Evaluate Proposal
// ============================================================================

export function evaluateProposal(context: ProposalContext): Annotation[] {
	const annotations: Annotation[] = [];

	for (const predicate of PROPOSAL_PREDICATES) {
		if (predicate.isRelevant(context) && predicate.isWeird(context) && predicate.isWorthCommentary(context)) {
			annotations.push({
				type: 'proposal',
				predicateName: predicate.name,
				commentary: predicate.getCommentary(context),
				playerName: context.proposal.proposer,
				playerRole: getLeaderRole(context),
			});
		}
	}

	return annotations;
}
