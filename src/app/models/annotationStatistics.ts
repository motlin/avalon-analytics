/**
 * Annotation Statistics Computation Layer
 *
 * Computes derived statistics for a person's annotation behavior by comparing
 * their raw counts (fires, opportunities) to population baselines.
 *
 * This is computed at view time from pre-stored counts, not pre-stored computed stats.
 */

import type {MissionVotePredicate} from './missionVotePredicates';
import {MISSION_VOTE_PREDICATES} from './missionVotePredicates';
import {type Rarity, RARITY_ORDER, getPredicateRarity, type InterestingRoles} from './predicateRarity';
import type {ProposalPredicate} from './proposalPredicates';
import {PROPOSAL_PREDICATES} from './proposalPredicates';
import type {ProposalVotePredicate} from './proposalVotePredicates';
import {PROPOSAL_VOTE_PREDICATES} from './proposalVotePredicates';
import {twoProportionZScore, zScoreToConfidence} from './statisticalFunctions';

// ============================================================================
// Predicate Lookup
// ============================================================================

type AnyPredicate = ProposalPredicate | ProposalVotePredicate | MissionVotePredicate;

/** Build lookup map from predicate name to predicate definition */
function buildPredicateLookup(): Map<string, AnyPredicate> {
	const lookup = new Map<string, AnyPredicate>();
	for (const pred of PROPOSAL_PREDICATES) {
		lookup.set(pred.name, pred);
	}
	for (const pred of PROPOSAL_VOTE_PREDICATES) {
		lookup.set(pred.name, pred);
	}
	for (const pred of MISSION_VOTE_PREDICATES) {
		lookup.set(pred.name, pred);
	}
	return lookup;
}

const PREDICATE_LOOKUP = buildPredicateLookup();

// ============================================================================
// Types
// ============================================================================

/** Which alignment does exhibiting this behavior suggest? */
export type AlignmentIndicator = 'good' | 'evil' | 'neither';

export interface PersonAnnotationStatistic {
	/** The predicate being measured */
	predicateName: string;
	/** Rarity tier based on historical fire counts */
	rarity: Rarity;

	// Player's overall stats
	/** Number of times the behavior occurred */
	fires: number;
	/** Number of opportunities to exhibit the behavior */
	opportunities: number;
	/** Raw rate = fires / opportunities */
	rawRate: number;

	// Global alignment baselines
	/** Rate for all good players globally */
	goodBaselineRate: number;
	/** Rate for all evil players globally */
	evilBaselineRate: number;
	/** Sample size for good baseline */
	goodBaselineSample: number;
	/** Sample size for evil baseline */
	evilBaselineSample: number;

	// Population diagnostic value - does this behavior distinguish good from evil globally?
	/** Which alignment does doing this behavior suggest? */
	popSuggestsAlignment: AlignmentIndicator;
	/** Confidence percentage (0-100) for population diagnostic value */
	popConfidence: number;
	/** True if good and evil rates are significantly different */
	popHasDiagnosticValue: boolean;
	/** Likelihood ratio - how much more likely is one alignment to do this behavior */
	popLikelihoodRatio: number;
	/** Total fires for good baseline (for tooltip) */
	goodBaselineFires: number;
	/** Total fires for evil baseline (for tooltip) */
	evilBaselineFires: number;

	// Player's alignment-specific stats
	/** Player's rate when playing good roles */
	playerGoodRate: number | null;
	/** Player's fires when good */
	playerGoodFires: number;
	/** Player's opportunities when good */
	playerGoodOpportunities: number;
	/** Player's rate when playing evil roles */
	playerEvilRate: number | null;
	/** Player's fires when evil */
	playerEvilFires: number;
	/** Player's opportunities when evil */
	playerEvilOpportunities: number;

	// Player's personal tell - does THIS player behave differently when good vs evil?
	/** Which alignment does this player's behavior suggest? */
	playerSuggestsAlignment: AlignmentIndicator;
	/** Confidence percentage (0-100) for player's personal tell */
	playerConfidence: number;
	/** True if player's good and evil rates are significantly different */
	playerHasTell: boolean;
	/** Likelihood ratio for this player - how much more likely when one alignment */
	playerLikelihoodRatio: number;

	// Legacy fields (kept for backwards compatibility)
	/** Population baseline rate for comparison (overall) */
	baselineRate: number;

	// Behavior classification
	/** Which roles should have role-level breakdown analysis (from predicate definition) */
	interestingRoles: InterestingRoles;
	/** Role-specific statistics for this behavior */
	roleStats: RoleStatistic[];
}

export interface PersonAnnotationProfile {
	/** Sorted list of annotation statistics (rarest first) */
	annotations: PersonAnnotationStatistic[];
	/** Summary statistics across all predicates */
	summary: {
		/** Total number of predicates with any opportunities */
		totalPredicates: number;
		/** Number of behaviors with population diagnostic value (≥95% confidence) */
		popTellCount: number;
		/** Number of behaviors where this player has a personal tell (≥95% confidence) */
		playerTellCount: number;
	};
}

/** Alignment-specific breakdown */
export interface AlignmentBreakdown {
	fires: number;
	opportunities: number;
}

/** Role-specific breakdown */
export interface RoleBreakdown {
	role: string;
	fires: number;
	opportunities: number;
}

/** Role-specific statistics for a person's behavior when playing a specific role */
export interface RoleStatistic {
	role: string;
	/** Player's fires when playing this role */
	playerFires: number;
	/** Player's opportunities when playing this role */
	playerOpportunities: number;
	/** Player's rate when playing this role */
	playerRate: number | null;
	/** Population fires for this role */
	populationFires: number;
	/** Population opportunities for this role */
	populationOpportunities: number;
	/** Population rate for this role */
	populationRate: number;
	/** Deviation from population (player rate - population rate) */
	deviation: number | null;
}

/** Raw database stats for a person's predicate behavior */
export interface RawPersonAnnotationStat {
	predicateName: string;
	fires: number;
	opportunities: number;
	goodStats: AlignmentBreakdown | null;
	evilStats: AlignmentBreakdown | null;
	roleStats: RoleBreakdown[];
}

/** Baseline statistics for a predicate across all mapped people */
export interface PredicateBaseline {
	predicateName: string;
	totalFires: number;
	totalOpportunities: number;
	goodFires: number;
	goodOpportunities: number;
	evilFires: number;
	evilOpportunities: number;
	roleBaselines: RoleBreakdown[];
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Computes a complete annotation profile for a person by processing raw stats
 * and comparing to population baselines.
 *
 * @param rawStats - Raw fires/opportunities from the database
 * @param baselines - Population baselines for each predicate
 * @returns Complete profile with computed statistics sorted by rarity
 */
export function computePersonAnnotationProfile(
	rawStats: RawPersonAnnotationStat[],
	baselines: PredicateBaseline[],
): PersonAnnotationProfile {
	// Build baseline lookup map
	const baselineMap = new Map<string, PredicateBaseline>();
	for (const baseline of baselines) {
		baselineMap.set(baseline.predicateName, baseline);
	}

	// Compute statistics for each predicate
	const annotations: PersonAnnotationStatistic[] = [];

	for (const raw of rawStats) {
		// Skip predicates with no opportunities
		if (raw.opportunities === 0) {
			continue;
		}

		const baseline = baselineMap.get(raw.predicateName);
		const statistic = computeSingleStatistic(raw, baseline);
		annotations.push(statistic);
	}

	// Sort by rarity (rarest first)
	annotations.sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]);

	// Compute summary
	const summary = computeSummary(annotations);

	return {annotations, summary};
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Computes all derived statistics for a single predicate.
 */
function computeSingleStatistic(
	raw: RawPersonAnnotationStat,
	baseline: PredicateBaseline | undefined,
): PersonAnnotationStatistic {
	const {predicateName, fires, opportunities, goodStats, evilStats} = raw;

	// Raw rate (overall)
	const rawRate = opportunities > 0 ? fires / opportunities : 0;

	// Get baseline rate (default to raw rate if no baseline)
	const baselineRate =
		baseline && baseline.totalOpportunities > 0 ? baseline.totalFires / baseline.totalOpportunities : rawRate;

	// Population alignment-specific baselines
	const popGoodFires = baseline?.goodFires ?? 0;
	const popGoodOpportunities = baseline?.goodOpportunities ?? 0;
	const popEvilFires = baseline?.evilFires ?? 0;
	const popEvilOpportunities = baseline?.evilOpportunities ?? 0;

	const goodBaselineRate = popGoodOpportunities > 0 ? popGoodFires / popGoodOpportunities : 0;
	const evilBaselineRate = popEvilOpportunities > 0 ? popEvilFires / popEvilOpportunities : 0;

	// Population diagnostic value: does this behavior distinguish good from evil globally?
	const popZScore = twoProportionZScore(popGoodFires, popGoodOpportunities, popEvilFires, popEvilOpportunities);
	const popConfidence = zScoreToConfidence(popZScore);
	const popHasDiagnosticValue = popConfidence >= 95;

	// Determine which alignment doing this behavior suggests (population level)
	let popSuggestsAlignment: AlignmentIndicator = 'neither';
	let popLikelihoodRatio = 1;
	if (goodBaselineRate > 0 && evilBaselineRate > 0) {
		if (goodBaselineRate > evilBaselineRate) {
			popSuggestsAlignment = 'good';
			popLikelihoodRatio = goodBaselineRate / evilBaselineRate;
		} else if (evilBaselineRate > goodBaselineRate) {
			popSuggestsAlignment = 'evil';
			popLikelihoodRatio = evilBaselineRate / goodBaselineRate;
		}
	} else if (goodBaselineRate > 0 && evilBaselineRate === 0) {
		popSuggestsAlignment = 'good';
		popLikelihoodRatio = Number.POSITIVE_INFINITY;
	} else if (evilBaselineRate > 0 && goodBaselineRate === 0) {
		popSuggestsAlignment = 'evil';
		popLikelihoodRatio = Number.POSITIVE_INFINITY;
	}

	// Player's alignment-specific stats
	const playerGoodFires = goodStats?.fires ?? 0;
	const playerGoodOpportunities = goodStats?.opportunities ?? 0;
	const playerEvilFires = evilStats?.fires ?? 0;
	const playerEvilOpportunities = evilStats?.opportunities ?? 0;

	const playerGoodRate = playerGoodOpportunities > 0 ? playerGoodFires / playerGoodOpportunities : null;
	const playerEvilRate = playerEvilOpportunities > 0 ? playerEvilFires / playerEvilOpportunities : null;

	// Player's personal tell: does THIS player behave differently when good vs evil?
	const playerZScore = twoProportionZScore(
		playerGoodFires,
		playerGoodOpportunities,
		playerEvilFires,
		playerEvilOpportunities,
	);
	const playerConfidence = zScoreToConfidence(playerZScore);
	const playerHasTell = playerConfidence >= 95;

	// Determine which alignment this player's behavior suggests
	let playerSuggestsAlignment: AlignmentIndicator = 'neither';
	let playerLikelihoodRatio = 1;
	if (playerGoodRate !== null && playerEvilRate !== null) {
		if (playerGoodRate > 0 && playerEvilRate > 0) {
			if (playerGoodRate > playerEvilRate) {
				playerSuggestsAlignment = 'good';
				playerLikelihoodRatio = playerGoodRate / playerEvilRate;
			} else if (playerEvilRate > playerGoodRate) {
				playerSuggestsAlignment = 'evil';
				playerLikelihoodRatio = playerEvilRate / playerGoodRate;
			}
		} else if (playerGoodRate > 0 && playerEvilRate === 0) {
			playerSuggestsAlignment = 'good';
			playerLikelihoodRatio = Number.POSITIVE_INFINITY;
		} else if (playerEvilRate > 0 && playerGoodRate === 0) {
			playerSuggestsAlignment = 'evil';
			playerLikelihoodRatio = Number.POSITIVE_INFINITY;
		}
	}

	// Rarity tier
	const rarity = getPredicateRarity(predicateName);

	// Get interestingRoles from predicate definition (default to 'all' for unknown predicates)
	const predicate = PREDICATE_LOOKUP.get(predicateName);
	const interestingRoles = predicate?.interestingRoles ?? 'all';

	// Role-specific statistics
	const roleBaselinesMap = new Map<string, RoleBreakdown>();
	for (const rb of baseline?.roleBaselines ?? []) {
		roleBaselinesMap.set(rb.role, rb);
	}

	// Compute role statistics
	const roleStats: RoleStatistic[] = [];
	const playerRoleMap = new Map<string, RoleBreakdown>();
	for (const rs of raw.roleStats) {
		playerRoleMap.set(rs.role, rs);
	}

	// Combine all roles from both player and baseline
	const allRoles = new Set([...roleBaselinesMap.keys(), ...playerRoleMap.keys()]);
	for (const role of allRoles) {
		const popRoleBaseline = roleBaselinesMap.get(role);
		const playerRoleStat = playerRoleMap.get(role);

		const populationFires = popRoleBaseline?.fires ?? 0;
		const populationOpportunities = popRoleBaseline?.opportunities ?? 0;
		const populationRate = populationOpportunities > 0 ? populationFires / populationOpportunities : 0;

		const playerFires = playerRoleStat?.fires ?? 0;
		const playerOpportunities = playerRoleStat?.opportunities ?? 0;
		const playerRate = playerOpportunities > 0 ? playerFires / playerOpportunities : null;

		const deviation = playerRate !== null ? playerRate - populationRate : null;

		roleStats.push({
			role,
			playerFires,
			playerOpportunities,
			playerRate,
			populationFires,
			populationOpportunities,
			populationRate,
			deviation,
		});
	}

	// Sort role stats by role name for consistent display
	roleStats.sort((a, b) => a.role.localeCompare(b.role));

	return {
		predicateName,
		rarity,
		fires,
		opportunities,
		rawRate,
		goodBaselineRate,
		evilBaselineRate,
		goodBaselineSample: popGoodOpportunities,
		evilBaselineSample: popEvilOpportunities,
		popSuggestsAlignment,
		popConfidence,
		popHasDiagnosticValue,
		popLikelihoodRatio,
		goodBaselineFires: popGoodFires,
		evilBaselineFires: popEvilFires,
		playerGoodRate,
		playerGoodFires,
		playerGoodOpportunities,
		playerEvilRate,
		playerEvilFires,
		playerEvilOpportunities,
		playerSuggestsAlignment,
		playerConfidence,
		playerHasTell,
		playerLikelihoodRatio,
		baselineRate,
		interestingRoles,
		roleStats,
	};
}

/**
 * Computes summary statistics across all annotations.
 */
function computeSummary(annotations: PersonAnnotationStatistic[]): PersonAnnotationProfile['summary'] {
	let popTellCount = 0;
	let playerTellCount = 0;

	for (const annotation of annotations) {
		if (annotation.popHasDiagnosticValue) {
			popTellCount++;
		}
		if (annotation.playerHasTell) {
			playerTellCount++;
		}
	}

	return {
		totalPredicates: annotations.length,
		popTellCount,
		playerTellCount,
	};
}

// ============================================================================
// Data Loading Functions
// ============================================================================

/**
 * Loads a person's raw annotation stats from the database.
 * Returns data in the format expected by computePersonAnnotationProfile().
 *
 * @param personId - The person's unique identifier
 * @param db - The Prisma database client
 * @returns Array of raw person annotation stats
 */
export async function loadPersonAnnotationStats(
	personId: string,
	db: {
		personAnnotationStats: {
			findMany: (args: {
				where: {personId: string};
				select: {
					predicateName: true;
					fires: true;
					opportunities: true;
					alignmentBreakdown: {select: {alignment: true; fires: true; opportunities: true}};
					roleBreakdown: {select: {role: true; fires: true; opportunities: true}};
				};
			}) => Promise<
				Array<{
					predicateName: string;
					fires: number;
					opportunities: number;
					alignmentBreakdown: Array<{alignment: string; fires: number; opportunities: number}>;
					roleBreakdown: Array<{role: string; fires: number; opportunities: number}>;
				}>
			>;
		};
	},
): Promise<RawPersonAnnotationStat[]> {
	const dbStats = await db.personAnnotationStats.findMany({
		where: {personId},
		select: {
			predicateName: true,
			fires: true,
			opportunities: true,
			alignmentBreakdown: {
				select: {
					alignment: true,
					fires: true,
					opportunities: true,
				},
			},
			roleBreakdown: {
				select: {
					role: true,
					fires: true,
					opportunities: true,
				},
			},
		},
	});

	return dbStats.map((stat) => {
		const goodBreakdown = stat.alignmentBreakdown.find((b) => b.alignment === 'good');
		const evilBreakdown = stat.alignmentBreakdown.find((b) => b.alignment === 'evil');

		return {
			predicateName: stat.predicateName,
			fires: stat.fires,
			opportunities: stat.opportunities,
			goodStats: goodBreakdown ? {fires: goodBreakdown.fires, opportunities: goodBreakdown.opportunities} : null,
			evilStats: evilBreakdown ? {fires: evilBreakdown.fires, opportunities: evilBreakdown.opportunities} : null,
			roleStats: stat.roleBreakdown.map((r) => ({role: r.role, fires: r.fires, opportunities: r.opportunities})),
		};
	});
}

/**
 * Loads all global annotation baselines from the database.
 * Returns data in the format expected by computePersonAnnotationProfile().
 *
 * @param db - The Prisma database client
 * @returns Array of predicate baselines
 */
export async function loadGlobalAnnotationBaselines(db: {
	globalAnnotationBaseline: {
		findMany: (args: {
			select: {
				predicateName: true;
				totalFires: true;
				totalOpportunities: true;
				goodFires: true;
				goodOpportunities: true;
				evilFires: true;
				evilOpportunities: true;
				roleBaselines: {select: {role: true; fires: true; opportunities: true}};
			};
		}) => Promise<
			Array<{
				predicateName: string;
				totalFires: number;
				totalOpportunities: number;
				goodFires: number;
				goodOpportunities: number;
				evilFires: number;
				evilOpportunities: number;
				roleBaselines: Array<{role: string; fires: number; opportunities: number}>;
			}>
		>;
	};
}): Promise<PredicateBaseline[]> {
	const dbBaselines = await db.globalAnnotationBaseline.findMany({
		select: {
			predicateName: true,
			totalFires: true,
			totalOpportunities: true,
			goodFires: true,
			goodOpportunities: true,
			evilFires: true,
			evilOpportunities: true,
			roleBaselines: {
				select: {
					role: true,
					fires: true,
					opportunities: true,
				},
			},
		},
	});

	return dbBaselines.map((baseline) => ({
		predicateName: baseline.predicateName,
		totalFires: baseline.totalFires,
		totalOpportunities: baseline.totalOpportunities,
		goodFires: baseline.goodFires,
		goodOpportunities: baseline.goodOpportunities,
		evilFires: baseline.evilFires,
		evilOpportunities: baseline.evilOpportunities,
		roleBaselines: baseline.roleBaselines.map((r) => ({
			role: r.role,
			fires: r.fires,
			opportunities: r.opportunities,
		})),
	}));
}
