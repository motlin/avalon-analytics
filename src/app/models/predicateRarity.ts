/**
 * Predicate Rarity Colors
 *
 * Maps predicate names to their historical fire counts and rarity colors.
 * Data generated from analysis of 12,910 historical games.
 *
 * Run `just analyze-predicates` to regenerate frequency data.
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

// Rarity color thresholds (log-scale buckets)
export type RarityColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'indigo' | 'violet';

const RARITY_THRESHOLDS: {max: number; color: RarityColor}[] = [
	{max: 500, color: 'red'},
	{max: 1000, color: 'orange'},
	{max: 2500, color: 'yellow'},
	{max: 6000, color: 'green'},
	{max: 15000, color: 'blue'},
	{max: 30000, color: 'indigo'},
	{max: Infinity, color: 'violet'},
];

// CSS colors for each rarity level
export const RARITY_CSS_COLORS: Record<RarityColor, string> = {
	red: '#dc2626',
	orange: '#ea580c',
	yellow: '#ca8a04',
	green: '#16a34a',
	blue: '#2563eb',
	indigo: '#4f46e5',
	violet: '#7c3aed',
};

/**
 * Get the rarity color for a predicate based on its historical fire count.
 */
export function getPredicateRarityColor(predicateName: string): RarityColor {
	const fireCount = PREDICATE_FIRE_COUNTS[predicateName];
	if (fireCount === undefined) {
		return 'violet'; // Default to most common for unknown predicates
	}

	for (const threshold of RARITY_THRESHOLDS) {
		if (fireCount < threshold.max) {
			return threshold.color;
		}
	}
	return 'violet';
}

/**
 * Get the CSS color for a predicate based on its rarity.
 */
export function getPredicateRarityCssColor(predicateName: string): string {
	const rarityColor = getPredicateRarityColor(predicateName);
	return RARITY_CSS_COLORS[rarityColor];
}
