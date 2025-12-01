/**
 * 🗳️ Proposal Vote Predicates
 *
 * TypeScript port of WeirdProposalVotePredicate from avalon-log-scraper.
 * Analyzes proposal votes to identify noteworthy voting behaviors.
 */

import type {Annotation, GameContext, ProposalContext, ProposalVoteContext} from './annotations';
import {
	alreadyFailedTwo,
	alreadySucceededTwo,
	countSeenEvilOnTeam,
	getMaxTeamSize,
	getPlayerRole,
	getRoleEmoji,
	isAllGoodTeam,
	isEvilRole,
	isGoodRole,
	isKnownEvil,
	teamIncludesPlayer,
	teamIncludesRole,
} from './annotations';

// ============================================================================
// 🔧 Predicate Interface
// ============================================================================

export interface ProposalVotePredicate {
	name: string;
	isRelevant: (context: ProposalVoteContext) => boolean;
	isWeird: (context: ProposalVoteContext) => boolean;
	isWorthCommentary: (context: ProposalVoteContext) => boolean;
	getCommentary: (context: ProposalVoteContext) => string;
}

// ============================================================================
// 🎯 Helper Functions
// ============================================================================

function isHammer(context: ProposalContext): boolean {
	return context.proposalNumber === 4; // 0-indexed
}

function isEvilHammerWin(context: ProposalContext): boolean {
	// This occurs when evil wins by forcing 5 rejected proposals
	// In practice, we check if it's the 5th proposal and if it would result in evil winning
	return context.proposalNumber === 4 && context.proposal.state === 'REJECTED';
}

// ============================================================================
// 📋 Proposal Vote Predicates
// ============================================================================

// 🗳️ Off-Team Approval (early game)
export const EarlyOffTeamApprovalPredicate: ProposalVotePredicate = {
	name: 'EarlyOffTeamApprovalProposalVotePredicate',
	isRelevant: (context) => context.proposalNumber <= 2 && context.missionNumber <= 3,
	isWeird: (context) => context.votedYes && !teamIncludesPlayer(context, context.voterName),
	isWorthCommentary: () => false, // Track but don't comment on every one
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)}${role} ${context.voterName} voted for a team that did not include them.`;
	},
};

// 🗳️ Off-Team Approval (4th proposal)
export const LateOffTeamApprovalPredicate: ProposalVotePredicate = {
	name: 'LateOffTeamApprovalProposalVotePredicate',
	isRelevant: (context) => context.proposalNumber === 3 && context.missionNumber <= 3,
	isWeird: (context) => context.votedYes && !teamIncludesPlayer(context, context.voterName),
	isWorthCommentary: () => false, // Common enough to not comment
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)}${role} ${context.voterName} voted for a team that did not include them.`;
	},
};

// ✋ Protest Vote (voting no on 5th proposal)
export const ProtestVotePredicate: ProposalVotePredicate = {
	name: 'ProtestVoteProposalVotePredicate',
	isRelevant: (context) => {
		if (isHammer(context) && context.missionNumber === 4) return false;
		return isHammer(context);
	},
	isWeird: (context) => !context.votedYes,
	isWorthCommentary: (context) => isAllGoodTeam(context),
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)}${role} ${context.voterName} protest voted (voted no on the 5th proposal).`;
	},
};

// ✋ Protest Vote on Evil Team
export const ProtestVoteEvilTeamPredicate: ProposalVotePredicate = {
	name: 'ProtestVoteEvilTeamProposalVotePredicate',
	isRelevant: (context) => {
		if (isHammer(context) && context.missionNumber === 4) return false;
		return isHammer(context);
	},
	isWeird: (context) => {
		if (context.votedYes) return false;
		return context.proposal.team.some((name) => {
			const role = getPlayerRole(context, name);
			return isEvilRole(role);
		});
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)}${role} ${context.voterName} protest voted when the team included seen evil players.`;
	},
};

// ✋ Protest Vote on Good Team
export const ProtestVoteGoodTeamPredicate: ProposalVotePredicate = {
	name: 'ProtestVoteGoodTeamProposalVotePredicate',
	isRelevant: (context) => {
		if (isHammer(context) && context.missionNumber === 4) return false;
		return isHammer(context);
	},
	isWeird: (context) => {
		if (context.votedYes) return false;
		return context.proposal.team.every((name) => {
			const role = getPlayerRole(context, name);
			return !isEvilRole(role);
		});
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)}${role} ${context.voterName} protest voted when the team did not include seen evil players.`;
	},
};

// 🧙 Merlin Voted for Morgana
export const MerlinVotedForMorganaPredicate: ProposalVotePredicate = {
	name: 'MerlinVotedForMorganaProposalVotePredicate',
	isRelevant: (context) => {
		if (isEvilHammerWin(context)) return false;
		if (isHammer(context)) return false;
		const voterRole = getPlayerRole(context, context.voterName);
		return voterRole === 'Merlin' && teamIncludesRole(context, 'Morgana');
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `🧙Merlin ${context.voterName} voted for a team including Morgana.`;
	},
};

// 😈 Morgana Voted for Merlin
export const MorganaVotedForMerlinPredicate: ProposalVotePredicate = {
	name: 'MorganaVotedForMerlinProposalVotePredicate',
	isRelevant: (context) => {
		if (isEvilHammerWin(context)) return false;
		if (isHammer(context)) return false;
		const voterRole = getPlayerRole(context, context.voterName);
		return voterRole === 'Morgana' && teamIncludesRole(context, 'Merlin');
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `😈Morgana ${context.voterName} voted for a team including Merlin.`;
	},
};

// 🧔 Percival Voted for Both Merlin and Morgana
export const PercivalVotedForBothPredicate: ProposalVotePredicate = {
	name: 'PercivalVotedForMerlinAndMorganaProposalVotePredicate',
	isRelevant: (context) => {
		if (isEvilHammerWin(context)) return false;
		if (isHammer(context)) return false;
		const voterRole = getPlayerRole(context, context.voterName);
		return voterRole === 'Percival' && teamIncludesRole(context, 'Merlin') && teamIncludesRole(context, 'Morgana');
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `🧔Percival ${context.voterName} voted for a team including both Merlin and Morgana.`;
	},
};

// ❌ Vote Against Own Proposal
export const VoteAgainstOwnProposalPredicate: ProposalVotePredicate = {
	name: 'VoteAgainstOwnProposalProposalVotePredicate',
	isRelevant: (context) => context.proposal.proposer === context.voterName,
	isWeird: (context) => !context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)}${role} ${context.voterName} voted against their own proposal.`;
	},
};

// ⚠️ Risking Good Loss
export const RiskingGoodLossPredicate: ProposalVotePredicate = {
	name: 'RiskingGoodLossProposalVotePredicate',
	isRelevant: (context) => {
		if (isEvilHammerWin(context)) return false;
		return alreadyFailedTwo(context) && countSeenEvilOnTeam(context) > 0;
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: (context) => {
		const voterRole = getPlayerRole(context, context.voterName);
		// Not weird if evil voter is on the team
		if (teamIncludesPlayer(context, context.voterName) && isEvilRole(voterRole)) {
			return false;
		}
		return true;
	},
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		const evilCount = countSeenEvilOnTeam(context);
		const failsRequired = context.mission.failsRequired;
		return `${getRoleEmoji(role)}${role} ${context.voterName} risked losing by voting for a team with ${evilCount} seen evil players when ${failsRequired} fails were required and two missions had already failed.`;
	},
};

// ⚠️ Risking Evil Loss (evil approving a winning good team)
export const RiskingEvilLossPredicate: ProposalVotePredicate = {
	name: 'RiskingEvilLossProposalVotePredicate',
	isRelevant: (context) => {
		if (isEvilHammerWin(context)) return false;
		return alreadySucceededTwo(context) && countSeenEvilOnTeam(context) === 0;
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: (context) => {
		const voterRole = getPlayerRole(context, context.voterName);
		// Not weird if good voter is on the team
		if (teamIncludesPlayer(context, context.voterName) && isGoodRole(voterRole)) {
			return false;
		}
		return true;
	},
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		const evilCount = countSeenEvilOnTeam(context);
		const failsRequired = context.mission.failsRequired;
		return `${getRoleEmoji(role)}${role} ${context.voterName} off-team approved a team that would win for good, with ${evilCount} seen evil players when ${failsRequired} fails were required.`;
	},
};

// 🗳️ Off-Team Approve All Good Team
export const OffTeamApproveAllGoodTeamPredicate: ProposalVotePredicate = {
	name: 'OffTeamApproveAllGoodTeamProposalVotePredicate',
	isRelevant: (context) => {
		if (isHammer(context)) return false;
		if (teamIncludesPlayer(context, context.voterName)) return false;
		return isAllGoodTeam(context);
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)}${role} ${context.voterName} approved an all good team that did not include them.`;
	},
};

// 🗳️ Off-Team Approve Max Size Team
export const OffTeamApproveMaxSizePredicate: ProposalVotePredicate = {
	name: 'OffTeamApproveMaxSizeProposalVotePredicate',
	isRelevant: (context) => {
		if (isHammer(context)) return false;
		if (teamIncludesPlayer(context, context.voterName)) return false;
		return context.mission.teamSize === getMaxTeamSize(context.game);
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)}${role} ${context.voterName} approved a proposal of max size that did not include them.`;
	},
};

// 😈 Evil Voted Against Evil
export const EvilVotedAgainstEvilPredicate: ProposalVotePredicate = {
	name: 'EvilVotedAgainstEvilProposalVotePredicate',
	isRelevant: (context) => {
		const voterRole = getPlayerRole(context, context.voterName);
		if (!isKnownEvil(voterRole)) return false;
		if (!teamIncludesPlayer(context, context.voterName)) return false;

		// Check if there are 2+ known evil on the team
		const knownEvilCount = context.proposal.team.filter((name) => isKnownEvil(getPlayerRole(context, name))).length;
		return knownEvilCount >= 2;
	},
	isWeird: (context) => !context.votedYes,
	isWorthCommentary: (context) => context.proposal.proposer !== context.voterName,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)}${role} ${context.voterName} voted against a proposal that included two known evil players.`;
	},
};

// ✅ First All Good Team Vote
export const FirstAllGoodTeamVotePredicate: ProposalVotePredicate = {
	name: 'FirstAllGoodTeamVotePredicate',
	isRelevant: (context) => {
		if (isHammer(context)) return false;
		if (!isAllGoodTeam(context)) return false;

		// Check if this is the first all good team proposal
		for (let missionIndex = 0; missionIndex <= context.missionNumber; missionIndex++) {
			const mission = context.game.missions[missionIndex];
			const proposalLimit =
				missionIndex === context.missionNumber ? context.proposalNumber : mission.proposals.length;

			for (let proposalIndex = 0; proposalIndex < proposalLimit; proposalIndex++) {
				const proposal = mission.proposals[proposalIndex];
				const proposalContext: ProposalContext = {
					...context,
					mission,
					missionNumber: missionIndex,
					proposal,
					proposalNumber: proposalIndex,
				};
				if (isAllGoodTeam(proposalContext)) {
					return false; // There was an earlier all good team
				}
			}
		}
		return true;
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)}${role} ${context.voterName} voted for the first all good team.`;
	},
};

// ============================================================================
// 📋 All Proposal Vote Predicates
// ============================================================================

export const PROPOSAL_VOTE_PREDICATES: ProposalVotePredicate[] = [
	EarlyOffTeamApprovalPredicate,
	LateOffTeamApprovalPredicate,
	ProtestVotePredicate,
	ProtestVoteEvilTeamPredicate,
	ProtestVoteGoodTeamPredicate,
	MerlinVotedForMorganaPredicate,
	MorganaVotedForMerlinPredicate,
	PercivalVotedForBothPredicate,
	VoteAgainstOwnProposalPredicate,
	RiskingGoodLossPredicate,
	RiskingEvilLossPredicate,
	OffTeamApproveAllGoodTeamPredicate,
	OffTeamApproveMaxSizePredicate,
	EvilVotedAgainstEvilPredicate,
	FirstAllGoodTeamVotePredicate,
];

// ============================================================================
// 🎯 Evaluate Proposal Vote
// ============================================================================

export function evaluateProposalVote(context: ProposalVoteContext): Annotation[] {
	const annotations: Annotation[] = [];

	for (const predicate of PROPOSAL_VOTE_PREDICATES) {
		if (predicate.isRelevant(context) && predicate.isWeird(context) && predicate.isWorthCommentary(context)) {
			annotations.push({
				type: 'proposalVote',
				predicateName: predicate.name,
				commentary: predicate.getCommentary(context),
				playerName: context.voterName,
				playerRole: getPlayerRole(context, context.voterName),
			});
		}
	}

	return annotations;
}
