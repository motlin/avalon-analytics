/**
 * Predicate Rarity System
 *
 * Maps predicate names to their historical fire counts and rarity tiers.
 * Data generated from analysis of 12,910 historical games.
 *
 * Run `just analyze-predicates` to regenerate frequency data.
 * Run `just analyze-rarities` to see rarity distribution.
 */

// Historical fire counts per predicate (from analyze-predicates.ts)
export const PREDICATE_FIRE_COUNTS: Record<string, number> = {
	// Proposal Vote Predicates
	DidNotProtestVoteWhenGoodWasAboutToWinProposalVotePredicate: 385,
	ProtestVoteProposalVotePredicate: 836,
	ProtestVoteGoodTeamProposalVotePredicate: 836,
	ProtestVoteEvilTeamProposalVotePredicate: 2179,
	PercivalVotedForMerlinAndMorganaProposalVotePredicate: 2233,
	OffTeamApproveOneEvilProposalVotePredicate: 4449,
	EvilVotedAgainstEvilProposalVotePredicate: 7764,
	MerlinVotedForMorganaProposalVotePredicate: 8440,
	ApprovingProposalWithTeammatesFromFailedMissionProposalVotePredicate: 8521,
	VoteAgainstOwnProposalProposalVotePredicate: 8743,
	RiskingEvilLossProposalVotePredicate: 9238,
	MorganaVotedForMerlinProposalVotePredicate: 17089,
	SwitchedVoteProposalVotePredicate: 18381,
	RiskingGoodLossProposalVotePredicate: 21343,
	FirstAllGoodTeamOfMaxSizeVotePredicate: 24121,
	OffTeamApproveMaxSizeProposalVotePredicate: 25326,
	TrustedMoreThanMaxTeamSizePlayersOnLastMissionProposalVotePredicate: 25830,
	OffTeamApproveAllGoodTeamProposalVotePredicate: 38070,
	FirstAllGoodTeamVotePredicate: 43966,
	ApproveWhenNextLeaderProposalVotePredicate: 44433,

	// Proposal Predicates
	PercivalExcludingMerlinWithoutMorganaProposalPredicate: 109,
	FinalAllGoodTeamDoesNotIncludeMerlinProposalPredicate: 316,
	SameTeamFailedMissionProposalPredicate: 337,
	KnownEvilHammerProposalPredicate: 394,
	PercivalProposingMerlinAndMorganaProposalPredicate: 586,
	MerlinMorganaProposalPredicate: 765,
	FinalAllGoodTeamDoesNotIncludePercivalProposalPredicate: 864,
	OneEvilTeamProposalPredicate: 955,
	MerlinMorganaSelfProposalPredicate: 1001,
	ProposedMorganaProposalPredicate: 2257,
	OneEvilTeamFirstProposalPredicate: 2554,
	PercivalProposingMorganaProposalPredicate: 2701,
	EntirelyGoodTeamWithoutSelfProposalPredicate: 2930,
	ProposedTwoOtherPlayersProposalPredicate: 3268,
	NoDreamTeamProposalPredicate: 4123,
	MorganaProposingMerlinProposalPredicate: 4292,
	PercivalProposingMerlinProposalPredicate: 5043,
	SameTeamSucceededMissionProposalPredicate: 5080,
	RiskingLossProposalPredicate: 5487,
	FirstAllGoodTeamOfMaxSizeProposalPredicate: 6180,
	ProposalWithoutSelfProposalPredicate: 7261,
	SameTeamRejectedProposalPredicate: 8229,
	TooManyEvilPlayersProposalPredicate: 8230,
	NoDreamTeamPlusSelfProposalPredicate: 8786,
	FirstAllGoodTeamProposalPredicate: 10342,
	HammerPanderingProposalPredicate: 17389,

	// Mission Vote Predicates
	OberonDucked: 855,
	FailureToCoordinate: 918,
	DuckingWhenEvilAlreadyWonTwoMissions: 1103,
	DuckingWhenGoodAlreadyWonTwoMissions: 2239,
	EvilPlayerNotClosestToLeaderFailed: 4243,
	RoleDucked: 14814,
};

// Rarity tiers (based on World of Warcraft item rarity system)
// Thresholds based on historical fire counts across 12,910 games
export type Rarity = 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

const RARITY_THRESHOLDS: {max: number; rarity: Rarity}[] = [
	{max: 500, rarity: 'legendary'},
	{max: 1000, rarity: 'epic'},
	{max: 2500, rarity: 'rare'},
	{max: 6000, rarity: 'uncommon'},
	{max: Infinity, rarity: 'common'},
];

// CSS colors for each rarity level (WoW-style)
// These could be theme-dependent in the future (light/dark mode)
export const RARITY_CSS_COLORS: Record<Rarity, string> = {
	legendary: '#ff8000',
	epic: '#a335ee',
	rare: '#0070dd',
	uncommon: '#2ecc71',
	common: '#000000',
};

// Order for sorting (lower = rarer = more important)
export const RARITY_ORDER: Record<Rarity, number> = {
	legendary: 0,
	epic: 1,
	rare: 2,
	uncommon: 3,
	common: 4,
};

/**
 * Get the rarity tier for a predicate based on its historical fire count.
 * Used by analysis scripts to suggest rarity assignments for new predicates.
 */
export function getPredicateRarity(predicateName: string): Rarity {
	const fireCount = PREDICATE_FIRE_COUNTS[predicateName];
	if (fireCount === undefined) {
		return 'common';
	}

	for (const threshold of RARITY_THRESHOLDS) {
		if (fireCount < threshold.max) {
			return threshold.rarity;
		}
	}
	return 'common';
}

/**
 * Get the rarity tier for a given fire count.
 * Used by analysis scripts to determine rarity assignments.
 */
export function getRarityForFireCount(fireCount: number): Rarity {
	for (const threshold of RARITY_THRESHOLDS) {
		if (fireCount < threshold.max) {
			return threshold.rarity;
		}
	}
	return 'common';
}
