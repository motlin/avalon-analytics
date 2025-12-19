/**
 * 🗳️ Proposal Vote Predicates
 *
 * TypeScript port of WeirdProposalVotePredicate from avalon-log-scraper.
 * Analyzes proposal votes to identify noteworthy voting behaviors.
 */

import type {Annotation, GameContext, ProposalContext, ProposalVoteContext} from './annotations';
import type {InterestingRoles, Rarity} from './predicateRarity';
import {
	alreadyFailedTwo,
	alreadySucceededTwo,
	countEvilOnTeam,
	countSeenEvilOnTeam,
	gameIncludesRole,
	getMaxTeamSize,
	getPlayerRole,
	getRoleEmoji,
	isAllGoodTeam,
	isEvilRole,
	isKnownEvil,
	isSeenEvil,
	teamIncludesPlayer,
	teamIncludesRole,
} from './annotations';

// ============================================================================
// 🔧 Predicate Interface
// ============================================================================

export interface ProposalVotePredicate {
	name: string;
	rarity: Rarity;
	isRelevant: (context: ProposalVoteContext) => boolean;
	isWeird: (context: ProposalVoteContext) => boolean;
	isWorthCommentary: (context: ProposalVoteContext) => boolean;
	getCommentary: (context: ProposalVoteContext) => string;
	/** Hidden predicates are tracked for stats but not rendered in the UI */
	hidden?: boolean;
	/** Which roles should have role-level breakdown analysis */
	interestingRoles: InterestingRoles;
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

interface EarlierProposalInfo {
	proposal: ProposalContext['proposal'];
	missionNumber: number;
	proposalNumber: number;
}

function getTrustedPlayersOnMission(context: ProposalVoteContext): string[] {
	const voterName = context.voterName;
	const mission = context.game.missions[context.missionNumber];

	// Get all proposals up to and including the current one
	const priorProposals = mission.proposals.slice(0, context.proposalNumber + 1);

	// Collect all team members from proposals where the voter voted yes
	const trustedPlayersSet = new Set<string>();
	for (const proposal of priorProposals) {
		const votedYes = proposal.votes.includes(voterName);
		if (votedYes) {
			for (const teamMember of proposal.team) {
				if (teamMember !== voterName) {
					trustedPlayersSet.add(teamMember);
				}
			}
		}
	}

	// Sort by player index (order in game)
	const playerOrder = context.game.players.map((p) => p.name);
	return [...trustedPlayersSet].sort((a, b) => playerOrder.indexOf(a) - playerOrder.indexOf(b));
}

/**
 * Checks if a player can see another player based on role visibility rules.
 * This is primarily used to determine if an evil player can see another evil player.
 * - Known evil players (Morgana, Assassin, Mordred, Evil Minion) can see each other
 * - Oberon cannot see other evil players and other evil cannot see Oberon
 */
function playerSeesPlayer(context: ProposalVoteContext, viewerName: string, targetName: string): boolean {
	const viewerRole = getPlayerRole(context, viewerName);
	const targetRole = getPlayerRole(context, targetName);

	if (!viewerRole || !targetRole) return false;

	// If viewer is Oberon, they cannot see anyone evil
	if (viewerRole === 'Oberon') return false;

	// If target is Oberon, other evil cannot see them
	if (targetRole === 'Oberon') return false;

	// Known evil can see other known evil
	return isKnownEvil(viewerRole) && isKnownEvil(targetRole);
}

/**
 * Checks if an evil player can see any evil players on the given team.
 */
function voterSeesAnyEvilOnTeam(context: ProposalVoteContext): boolean {
	return context.proposal.team.some((teamMember) => playerSeesPlayer(context, context.voterName, teamMember));
}

/**
 * Counts the number of evil players on the team that Merlin can see.
 * Merlin can see all evil players EXCEPT Mordred.
 * Uses isSeenEvil which returns true for Morgana, Assassin, Oberon, Evil, Evil Minion, Minion of Mordred.
 */
function countMerlinVisibleEvilOnTeam(context: ProposalVoteContext): number {
	return context.proposal.team.filter((name) => {
		const role = getPlayerRole(context, name);
		return isSeenEvil(role);
	}).length;
}

/**
 * Finds the player name with a given role in the game.
 */
function findPlayerWithRole(context: ProposalVoteContext, targetRole: string): string | null {
	for (const [playerName, role] of context.rolesByName.entries()) {
		if (role.toLowerCase() === targetRole.toLowerCase()) {
			return playerName;
		}
	}
	return null;
}

function getEarlierProposalWithSameTeam(context: ProposalVoteContext): EarlierProposalInfo | null {
	const currentTeamSorted = [...context.proposal.team].sort();

	// Search all previous proposals in reverse order (most recent first)
	for (let missionIndex = context.missionNumber; missionIndex >= 0; missionIndex--) {
		const mission = context.game.missions[missionIndex];
		const proposalLimit =
			missionIndex === context.missionNumber ? context.proposalNumber : mission.proposals.length;

		for (let proposalIndex = proposalLimit - 1; proposalIndex >= 0; proposalIndex--) {
			const proposal = mission.proposals[proposalIndex];
			const proposalTeamSorted = [...proposal.team].sort();

			if (
				currentTeamSorted.length === proposalTeamSorted.length &&
				currentTeamSorted.every((name, index) => name === proposalTeamSorted[index])
			) {
				return {
					proposal,
					missionNumber: missionIndex,
					proposalNumber: proposalIndex,
				};
			}
		}
	}

	return null;
}

// ============================================================================
// 📋 Proposal Vote Predicates
// ============================================================================

// 🗳️ Off-Team Approval (early game)
export const EarlyOffTeamApprovalPredicate: ProposalVotePredicate = {
	name: 'Voted for a team that did not include them',
	rarity: 'common',
	interestingRoles: 'all',
	isRelevant: (context) => context.proposalNumber <= 2 && context.missionNumber <= 3,
	isWeird: (context) => context.votedYes && !teamIncludesPlayer(context, context.voterName),
	isWorthCommentary: () => false, // Track but don't comment on every one
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} voted for a team that did not include them.`;
	},
};

// 🗳️ Off-Team Approval (4th proposal)
export const LateOffTeamApprovalPredicate: ProposalVotePredicate = {
	name: 'Voted for a team that did not include them (4th proposal)',
	rarity: 'common',
	interestingRoles: 'all',
	isRelevant: (context) => context.proposalNumber === 3 && context.missionNumber <= 3,
	isWeird: (context) => context.votedYes && !teamIncludesPlayer(context, context.voterName),
	isWorthCommentary: () => false, // Common enough to not comment
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} voted for a team that did not include them.`;
	},
};

// ✋ Protest Vote (voting no on 5th proposal)
export const ProtestVotePredicate: ProposalVotePredicate = {
	name: 'Protest voted on the 5th proposal',
	rarity: 'epic',
	interestingRoles: 'all',
	isRelevant: (context) => {
		if (isHammer(context) && context.missionNumber === 4) return false;
		return isHammer(context);
	},
	isWeird: (context) => !context.votedYes,
	isWorthCommentary: (context) => isAllGoodTeam(context),
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} protest voted (voted no on the 5th proposal).`;
	},
};

// ✋ Protest Vote on Evil Team
export const ProtestVoteEvilTeamPredicate: ProposalVotePredicate = {
	name: 'Protest voted when team included seen evil',
	rarity: 'rare',
	interestingRoles: 'good',
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
		return `${getRoleEmoji(role)} ${role} ${context.voterName} protest voted when the team included seen evil players.`;
	},
};

// ✋ Protest Vote on Good Team
export const ProtestVoteGoodTeamPredicate: ProposalVotePredicate = {
	name: 'Protest voted when team was all good',
	rarity: 'epic',
	interestingRoles: 'all',
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
		return `${getRoleEmoji(role)} ${role} ${context.voterName} protest voted when the team did not include seen evil players.`;
	},
};

// 🧙 Merlin Voted for Morgana
export const MerlinVotedForMorganaPredicate: ProposalVotePredicate = {
	name: 'Merlin voted for a team including Morgana',
	rarity: 'common',
	interestingRoles: ['Merlin'],
	isRelevant: (context) => {
		if (isEvilHammerWin(context)) return false;
		if (isHammer(context)) return false;
		const voterRole = getPlayerRole(context, context.voterName);
		return voterRole === 'Merlin' && teamIncludesRole(context, 'Morgana');
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `🧙 Merlin ${context.voterName} voted for a team including Morgana.`;
	},
};

// 🧙 Merlin Approved Team With Multiple Visible Evil
export const MerlinApprovedMultipleVisibleEvilPredicate: ProposalVotePredicate = {
	name: 'Merlin approved a team with multiple visible evil',
	rarity: 'uncommon',
	interestingRoles: ['Merlin'],
	isRelevant: (context) => {
		if (isEvilHammerWin(context)) return false;
		if (isHammer(context)) return false;
		const voterRole = getPlayerRole(context, context.voterName);
		if (voterRole !== 'Merlin') return false;
		// Team must have 2+ evil players visible to Merlin (excludes Mordred)
		return countMerlinVisibleEvilOnTeam(context) >= 2;
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const visibleEvilCount = countMerlinVisibleEvilOnTeam(context);
		return `🧙 Merlin ${context.voterName} approved a team with ${visibleEvilCount} visible evil players.`;
	},
};

// 😈 Morgana Voted for Merlin
export const MorganaVotedForMerlinPredicate: ProposalVotePredicate = {
	name: 'Morgana voted for a team including Merlin',
	rarity: 'common',
	interestingRoles: ['Morgana'],
	isRelevant: (context) => {
		if (isEvilHammerWin(context)) return false;
		if (isHammer(context)) return false;
		const voterRole = getPlayerRole(context, context.voterName);
		return voterRole === 'Morgana' && teamIncludesRole(context, 'Merlin');
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `😈 Morgana ${context.voterName} voted for a team including Merlin.`;
	},
};

// 🧔 Percival Voted for Both Merlin and Morgana
export const PercivalVotedForBothPredicate: ProposalVotePredicate = {
	name: 'Percival voted for a team including both Merlin and Morgana',
	rarity: 'rare',
	interestingRoles: ['Percival'],
	isRelevant: (context) => {
		if (isEvilHammerWin(context)) return false;
		if (isHammer(context)) return false;
		const voterRole = getPlayerRole(context, context.voterName);
		return voterRole === 'Percival' && teamIncludesRole(context, 'Merlin') && teamIncludesRole(context, 'Morgana');
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `🧔 Percival ${context.voterName} voted for a team including both Merlin and Morgana.`;
	},
};

// 🧔 Percival Protest Voted Multiple Evil Team
export const PercivalProtestVotedMultipleEvilPredicate: ProposalVotePredicate = {
	name: 'Percival protest voted knowing multiple evil on team',
	rarity: 'uncommon',
	interestingRoles: ['Percival'],
	isRelevant: (context) => {
		// Voter must be Percival
		const voterRole = getPlayerRole(context, context.voterName);
		if (voterRole !== 'Percival') return false;

		// No Morgana in the game (so Percival knows Merlin with certainty)
		if (gameIncludesRole(context, 'Morgana')) return false;

		// Find Merlin
		const merlinName = findPlayerWithRole(context, 'Merlin');
		if (!merlinName) return false;

		// Neither Merlin nor Percival is on the team
		if (teamIncludesPlayer(context, context.voterName)) return false;
		if (teamIncludesPlayer(context, merlinName)) return false;

		// Team size equals (total players - 2), meaning everyone except Merlin and Percival
		// Therefore both evil players must be on the team
		const totalPlayers = context.game.players.length;
		const teamSize = context.mission.teamSize;
		return teamSize === totalPlayers - 2;
	},
	isWeird: (context) => !context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		return `🧔 Percival ${context.voterName} protest voted knowing multiple evil players must be on the team through arithmetic deduction.`;
	},
};

// ❌ Vote Against Own Proposal
export const VoteAgainstOwnProposalPredicate: ProposalVotePredicate = {
	name: 'Voted against their own proposal',
	rarity: 'common',
	interestingRoles: 'all',
	isRelevant: (context) => context.proposal.proposer === context.voterName,
	isWeird: (context) => !context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} voted against their own proposal.`;
	},
};

// ⚠️ Risking Good Loss
export const RiskingGoodLossPredicate: ProposalVotePredicate = {
	name: 'Risked losing by voting for seen evil',
	rarity: 'common',
	interestingRoles: 'all',
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
		return `${getRoleEmoji(role)} ${role} ${context.voterName} risked losing by voting for a team with ${evilCount} seen evil players when ${failsRequired} fails were required and two missions had already failed.`;
	},
};

// ⚠️ Risking Evil Loss (evil approving a winning good team)
export const RiskingEvilLossPredicate: ProposalVotePredicate = {
	name: 'Off-team approved a winning good team',
	rarity: 'common',
	interestingRoles: 'all',
	isRelevant: (context) => {
		if (isEvilHammerWin(context)) return false;
		// Use countEvilOnTeam (not countSeenEvilOnTeam) because Mordred can still fail the mission
		return alreadySucceededTwo(context) && countEvilOnTeam(context) === 0;
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: (context) => {
		// Not weird if voter is on the team - they're not "off-team"
		if (teamIncludesPlayer(context, context.voterName)) {
			return false;
		}
		return true;
	},
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} off-team approved a team that would win for good.`;
	},
};

// 🗳️ Off-Team Approve All Good Team
export const OffTeamApproveAllGoodTeamPredicate: ProposalVotePredicate = {
	name: 'Approved an all good team that did not include them',
	rarity: 'common',
	interestingRoles: 'all',
	isRelevant: (context) => {
		if (isHammer(context)) return false;
		if (teamIncludesPlayer(context, context.voterName)) return false;
		return isAllGoodTeam(context);
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} approved an all good team that did not include them.`;
	},
};

// 🗳️ Off-Team Approve Max Size Team
export const OffTeamApproveMaxSizePredicate: ProposalVotePredicate = {
	name: 'Approved a max size team that did not include them',
	rarity: 'common',
	interestingRoles: 'all',
	isRelevant: (context) => {
		if (isHammer(context)) return false;
		if (teamIncludesPlayer(context, context.voterName)) return false;
		return context.mission.teamSize === getMaxTeamSize(context.game);
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} approved a proposal of max size that did not include them.`;
	},
};

// 😈 Evil Voted Against Evil
export const EvilVotedAgainstEvilPredicate: ProposalVotePredicate = {
	name: 'Evil voted against a proposal with two known evil',
	rarity: 'common',
	interestingRoles: 'evil',
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
		return `${getRoleEmoji(role)} ${role} ${context.voterName} voted against a proposal that included two known evil players.`;
	},
};

// 🗳️ Approve When Next Leader
export const ApproveWhenNextLeaderProposalVotePredicate: ProposalVotePredicate = {
	name: 'Approved when they are the next leader',
	rarity: 'common',
	interestingRoles: 'all',
	hidden: true,
	isRelevant: (context) => {
		if (isHammer(context)) return false;

		const playerNames = context.game.players.map((p) => p.name);
		const numPlayers = playerNames.length;
		const leaderIndex = playerNames.indexOf(context.proposal.proposer);
		const voterIndex = playerNames.indexOf(context.voterName);

		if (leaderIndex === -1 || voterIndex === -1) return false;

		// Check if voter is the next leader (one position after current leader, wrapping around)
		return voterIndex === (leaderIndex + 1) % numPlayers;
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} approved the proposal when they are the next leader anyway.`;
	},
};

// 🗳️ On Proposal But Didn't Vote For It (early game)
export const OnProposalButDidntVoteForItEarlyGameProposalVotePredicate: ProposalVotePredicate = {
	name: 'Voted against an early proposal that included them',
	rarity: 'common',
	interestingRoles: 'all',
	isRelevant: (context) => {
		// Early game: proposals 1-3 (0-indexed: 0-2), missions 1-2 (0-indexed: 0-1)
		if (context.proposalNumber > 2) return false;
		if (context.missionNumber >= 2) return false;
		if (!teamIncludesPlayer(context, context.voterName)) return false;
		// Leader must also be on the team
		return teamIncludesPlayer(context, context.proposal.proposer);
	},
	isWeird: (context) => !context.votedYes,
	isWorthCommentary: () => false, // Track but don't comment on every one
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} voted against an early proposal that included them.`;
	},
};

// 🔄 Switched Vote From Identical Earlier Proposal
export const SwitchedVoteProposalVotePredicate: ProposalVotePredicate = {
	name: 'Switched vote from an identical earlier proposal',
	rarity: 'common',
	interestingRoles: 'all',
	isRelevant: (context) => {
		if (isHammer(context)) return false;
		return getEarlierProposalWithSameTeam(context) !== null;
	},
	isWeird: (context) => {
		const earlierProposal = getEarlierProposalWithSameTeam(context);
		if (!earlierProposal) return false;
		const earlierVotedYes = earlierProposal.proposal.votes.includes(context.voterName);
		return earlierVotedYes !== context.votedYes;
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		const earlierProposal = getEarlierProposalWithSameTeam(context);
		if (!earlierProposal) return '';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} switched their vote from an identical earlier proposal on mission ${earlierProposal.missionNumber + 1} proposal ${earlierProposal.proposalNumber + 1}.`;
	},
};

// 🔢 Trusted More Than Max Team Size Players On Last Mission
export const TrustedMoreThanMaxTeamSizePlayersOnLastMissionProposalVotePredicate: ProposalVotePredicate = {
	name: 'Trusted too many players on a late mission',
	rarity: 'common',
	interestingRoles: 'all',
	isRelevant: (context) => {
		if (isHammer(context)) return false;
		// Mission number >= 3 (0-indexed: >= 2, so missions 3, 4, 5)
		return context.missionNumber >= 2;
	},
	isWeird: (context) => {
		if (!context.votedYes) return false;

		const trustedPlayers = getTrustedPlayersOnMission(context);
		const maxTeamSize = getMaxTeamSize(context.game);
		const failsRequired = context.mission.failsRequired;
		const twoFailsAdjustment = failsRequired === 2 ? 1 : 0;
		const reasonableNumberToTrust = maxTeamSize - 1 + twoFailsAdjustment;

		return trustedPlayers.length > reasonableNumberToTrust;
	},
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		const trustedPlayers = getTrustedPlayersOnMission(context);
		const trustedNames = trustedPlayers.join(', ');
		return `${getRoleEmoji(role)} ${role} ${context.voterName} trusted ${trustedPlayers.length} players on mission ${context.missionNumber + 1}. Trusted: ${trustedNames}.`;
	},
};

// 🗳️ Off-Team Approve One Evil (when two fails required)
export const OffTeamApproveOneEvilProposalVotePredicate: ProposalVotePredicate = {
	name: 'Off-team approved one evil when two fails required',
	rarity: 'uncommon',
	interestingRoles: 'all',
	isRelevant: (context) => {
		// Must be off-team
		if (teamIncludesPlayer(context, context.voterName)) return false;
		// Mission must require 2 fails
		if (context.mission.failsRequired !== 2) return false;
		// Team must have exactly 1 seen evil player
		return countSeenEvilOnTeam(context) === 1;
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} off-team approved a proposal with 1 seen evil player when two fails are required.`;
	},
};

// ✅ First All Good Team Vote
export const FirstAllGoodTeamVotePredicate: ProposalVotePredicate = {
	name: 'Voted for the first all good team',
	rarity: 'common',
	interestingRoles: 'all',
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
		return `${getRoleEmoji(role)} ${role} ${context.voterName} voted for the first all good team.`;
	},
};

// 🔄 Approving Proposal With Teammates From Failed Mission
export const ApprovingProposalWithTeammatesFromFailedMissionProposalVotePredicate: ProposalVotePredicate = {
	name: 'Approved a team with players from a failed mission',
	rarity: 'common',
	interestingRoles: 'all',
	isRelevant: (context) => {
		// Not relevant if evil hammer win
		if (isHammer(context) && context.proposal.state === 'REJECTED') return false;

		// Not relevant if 2 fails required (since 1 evil can't fail the mission alone)
		if (context.mission.failsRequired === 2) return false;

		// Check if there are previous failed missions with the same players (excluding the voter)
		return getPreviousFailedMissionsWithSamePlayers(context).length > 0;
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		const failedMissions = getPreviousFailedMissionsWithSamePlayers(context);
		const missionDetails = failedMissions.map((m) => `Mission ${m.missionNumber + 1}`).join(', ');
		return `${getRoleEmoji(role)} ${role} ${context.voterName} approved a proposal with the same players as a previous failed mission. ${missionDetails}.`;
	},
};

interface FailedMissionInfo {
	mission: ProposalVoteContext['mission'];
	missionNumber: number;
}

function getPreviousFailedMissionsWithSamePlayers(context: ProposalVoteContext): FailedMissionInfo[] {
	const voterName = context.voterName;
	const currentTeamWithoutVoter = context.proposal.team.filter((name) => name !== voterName);

	const failedMissions: FailedMissionInfo[] = [];

	// Check all previous missions
	for (let missionIndex = 0; missionIndex < context.missionNumber; missionIndex++) {
		const mission = context.game.missions[missionIndex];

		// Only consider failed missions
		if (mission.state !== 'FAIL') continue;

		// Get the team from the last (approved) proposal of the failed mission
		const lastProposal = mission.proposals[mission.proposals.length - 1];
		if (!lastProposal || lastProposal.state !== 'APPROVED') continue;

		const failedTeamWithoutVoter = lastProposal.team.filter((name) => name !== voterName);

		// Check if current team (without voter) contains all players from the failed team (without voter)
		const containsAllFailedPlayers = failedTeamWithoutVoter.every((name) => currentTeamWithoutVoter.includes(name));

		if (containsAllFailedPlayers) {
			failedMissions.push({mission, missionNumber: missionIndex});
		}
	}

	return failedMissions;
}

// ✋ Did Not Protest Vote When Good Was About To Win
export const DidNotProtestVoteWhenGoodWasAboutToWinProposalVotePredicate: ProposalVotePredicate = {
	name: 'Did not protest vote when good was about to win',
	rarity: 'legendary',
	interestingRoles: 'evil',
	isRelevant: (context) => {
		// Not relevant if evil hammer win (5th proposal rejected)
		if (isHammer(context) && context.proposal.state === 'REJECTED') return false;

		// Must be hammer (5th proposal)
		if (!isHammer(context)) return false;

		// Voter must be evil
		const voterRole = getPlayerRole(context, context.voterName);
		if (!isEvilRole(voterRole)) return false;

		// Good must have already succeeded two missions (about to win)
		if (!alreadySucceededTwo(context)) return false;

		// Voter doesn't see anyone on the team
		// This isn't actually so weird when Oberon is in play.
		// The player might be hoping an evil player that they cannot see is on the team.
		return !voterSeesAnyEvilOnTeam(context);
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} did not protest vote when good was about to win.`;
	},
};

// ✅ First All Good Team of Max Size Vote
export const FirstAllGoodTeamOfMaxSizeVotePredicate: ProposalVotePredicate = {
	name: 'Voted for the first all good team of max size',
	rarity: 'common',
	interestingRoles: 'all',
	isRelevant: (context) => {
		const maxTeamSize = getMaxTeamSize(context.game);

		// Team size must be max size
		if (context.mission.teamSize !== maxTeamSize) return false;

		// Must be an all good team
		if (!isAllGoodTeam(context)) return false;

		// Check if this is the first all good team of max size
		for (let missionIndex = 0; missionIndex <= context.missionNumber; missionIndex++) {
			const mission = context.game.missions[missionIndex];

			// Only consider missions with max team size
			if (mission.teamSize !== maxTeamSize) continue;

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
					return false; // There was an earlier all good team of max size
				}
			}
		}
		return true;
	},
	isWeird: (context) => context.votedYes,
	isWorthCommentary: () => true,
	getCommentary: (context) => {
		const role = getPlayerRole(context, context.voterName) ?? 'Unknown';
		return `${getRoleEmoji(role)} ${role} ${context.voterName} voted for an all good team of max size.`;
	},
};

// ============================================================================
// 📋 All Proposal Vote Predicates
// ============================================================================

// Ordered by rarity (rarest first = most interesting)
// Run `npx tsx src/scripts/analyze-predicates.ts` to regenerate frequency data
export const PROPOSAL_VOTE_PREDICATES: ProposalVotePredicate[] = [
	// Tracking only (isWorthCommentary returns false)
	EarlyOffTeamApprovalPredicate,
	LateOffTeamApprovalPredicate,
	OnProposalButDidntVoteForItEarlyGameProposalVotePredicate,
	// Rarest first (based on historical analysis of 12,910 games)
	DidNotProtestVoteWhenGoodWasAboutToWinProposalVotePredicate, // 385 fires
	ProtestVotePredicate, // 836 fires
	ProtestVoteGoodTeamPredicate, // 836 fires
	ProtestVoteEvilTeamPredicate, // 2179 fires
	PercivalVotedForBothPredicate, // 2233 fires
	PercivalProtestVotedMultipleEvilPredicate, // new - no fire count data yet
	MerlinApprovedMultipleVisibleEvilPredicate, // new - no fire count data yet
	OffTeamApproveOneEvilProposalVotePredicate, // 4449 fires
	EvilVotedAgainstEvilPredicate, // 7764 fires
	MerlinVotedForMorganaPredicate, // 8440 fires
	ApprovingProposalWithTeammatesFromFailedMissionProposalVotePredicate, // 8521 fires
	VoteAgainstOwnProposalPredicate, // 8743 fires
	RiskingEvilLossPredicate, // 9238 fires
	MorganaVotedForMerlinPredicate, // 17089 fires
	SwitchedVoteProposalVotePredicate, // 18381 fires
	RiskingGoodLossPredicate, // 21343 fires
	FirstAllGoodTeamOfMaxSizeVotePredicate, // 24121 fires
	OffTeamApproveMaxSizePredicate, // 25326 fires
	TrustedMoreThanMaxTeamSizePlayersOnLastMissionProposalVotePredicate, // 25830 fires
	OffTeamApproveAllGoodTeamPredicate, // 38070 fires
	FirstAllGoodTeamVotePredicate, // 43966 fires
	ApproveWhenNextLeaderProposalVotePredicate, // 44433 fires
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
				rarity: predicate.rarity,
				commentary: predicate.getCommentary(context),
				playerName: context.voterName,
				playerRole: getPlayerRole(context, context.voterName),
				hidden: predicate.hidden,
			});
		}
	}

	return annotations;
}
