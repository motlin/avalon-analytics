/**
 * Annotation Statistics Computation Layer
 *
 * Computes derived statistics for a person's annotation behavior by comparing
 * their raw counts (fires, opportunities) to population baselines.
 *
 * This is computed at view time from pre-stored counts, not pre-stored computed stats.
 */

import {type Rarity, RARITY_ORDER, getPredicateRarity} from './predicateRarity';
import {calculateZScore, empiricalBayesEstimate, wilsonScoreInterval, zScoreToPercentile} from './statisticalFunctions';

// ============================================================================
// Types
// ============================================================================

export type DeviationDirection = 'above' | 'below' | 'neutral';

export interface PersonAnnotationStatistic {
	/** The predicate being measured */
	predicateName: string;
	/** Rarity tier based on historical fire counts */
	rarity: Rarity;
	/** Number of times the behavior occurred */
	fires: number;
	/** Number of opportunities to exhibit the behavior */
	opportunities: number;
	/** Raw rate = fires / opportunities */
	rawRate: number;
	/** Empirical Bayes adjusted rate (shrunk toward population mean) */
	smoothedRate: number;
	/** Wilson score confidence interval for the raw rate */
	confidenceInterval: {lower: number; upper: number};
	/** Population baseline rate for comparison */
	baselineRate: number;
	/** Z-score measuring standard deviations from baseline */
	zScore: number;
	/** Percentile rank (0-100) based on z-score */
	percentileRank: number;
	/** Direction of deviation from baseline */
	deviationDirection: DeviationDirection;
	/** True if |zScore| > 1.96 (95% significance) */
	isSignificant: boolean;
}

export interface PersonAnnotationProfile {
	/** Sorted list of annotation statistics (rarest first) */
	annotations: PersonAnnotationStatistic[];
	/** Summary statistics across all predicates */
	summary: {
		/** Total number of predicates with any opportunities */
		totalPredicates: number;
		/** Number of significant deviations from baseline */
		significantDeviations: number;
		/** Number of predicates where person is above baseline */
		aboveBaseline: number;
		/** Number of predicates where person is below baseline */
		belowBaseline: number;
	};
}

/** Raw database stats for a person's predicate behavior */
export interface RawPersonAnnotationStat {
	predicateName: string;
	fires: number;
	opportunities: number;
}

/** Baseline statistics for a predicate across all mapped people */
export interface PredicateBaseline {
	predicateName: string;
	totalFires: number;
	totalOpportunities: number;
}

// ============================================================================
// Constants
// ============================================================================

/** Z-score threshold for statistical significance (95% CI) */
const SIGNIFICANCE_THRESHOLD = 1.96;

/** Shrinkage strength for empirical Bayes estimation */
const SHRINKAGE_STRENGTH = 10;

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
	const {predicateName, fires, opportunities} = raw;

	// Raw rate
	const rawRate = opportunities > 0 ? fires / opportunities : 0;

	// Get baseline rate (default to raw rate if no baseline)
	const baselineRate =
		baseline && baseline.totalOpportunities > 0 ? baseline.totalFires / baseline.totalOpportunities : rawRate;

	// Smoothed rate using empirical Bayes
	const smoothedRate = empiricalBayesEstimate(fires, opportunities, baselineRate, SHRINKAGE_STRENGTH);

	// Confidence interval using Wilson score
	const wilson = wilsonScoreInterval(fires, opportunities);
	const confidenceInterval = {lower: wilson.lower, upper: wilson.upper};

	// Z-score comparing to baseline
	const zScore = calculateZScore(rawRate, baselineRate, opportunities);

	// Percentile rank from z-score
	const percentileRank = zScoreToPercentile(zScore);

	// Deviation direction
	const deviationDirection = determineDeviationDirection(zScore);

	// Statistical significance
	const isSignificant = Math.abs(zScore) > SIGNIFICANCE_THRESHOLD && Number.isFinite(zScore);

	// Rarity tier
	const rarity = getPredicateRarity(predicateName);

	return {
		predicateName,
		rarity,
		fires,
		opportunities,
		rawRate,
		smoothedRate,
		confidenceInterval,
		baselineRate,
		zScore,
		percentileRank,
		deviationDirection,
		isSignificant,
	};
}

/**
 * Determines the deviation direction based on z-score.
 * Uses a small threshold to avoid marking tiny deviations.
 */
function determineDeviationDirection(zScore: number): DeviationDirection {
	// Use a small threshold to avoid classifying noise as directional
	const neutralThreshold = 0.1;

	if (!Number.isFinite(zScore)) {
		return zScore > 0 ? 'above' : 'below';
	}

	if (zScore > neutralThreshold) {
		return 'above';
	}
	if (zScore < -neutralThreshold) {
		return 'below';
	}
	return 'neutral';
}

/**
 * Computes summary statistics across all annotations.
 */
function computeSummary(annotations: PersonAnnotationStatistic[]): PersonAnnotationProfile['summary'] {
	let significantDeviations = 0;
	let aboveBaseline = 0;
	let belowBaseline = 0;

	for (const annotation of annotations) {
		if (annotation.isSignificant) {
			significantDeviations++;
		}
		if (annotation.deviationDirection === 'above') {
			aboveBaseline++;
		} else if (annotation.deviationDirection === 'below') {
			belowBaseline++;
		}
	}

	return {
		totalPredicates: annotations.length,
		significantDeviations,
		aboveBaseline,
		belowBaseline,
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
				select: {predicateName: true; fires: true; opportunities: true};
			}) => Promise<Array<{predicateName: string; fires: number; opportunities: number}>>;
		};
	},
): Promise<RawPersonAnnotationStat[]> {
	const dbStats = await db.personAnnotationStats.findMany({
		where: {personId},
		select: {
			predicateName: true,
			fires: true,
			opportunities: true,
		},
	});

	return dbStats.map((stat) => ({
		predicateName: stat.predicateName,
		fires: stat.fires,
		opportunities: stat.opportunities,
	}));
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
			select: {predicateName: true; totalFires: true; totalOpportunities: true};
		}) => Promise<Array<{predicateName: string; totalFires: number; totalOpportunities: number}>>;
	};
}): Promise<PredicateBaseline[]> {
	const dbBaselines = await db.globalAnnotationBaseline.findMany({
		select: {
			predicateName: true,
			totalFires: true,
			totalOpportunities: true,
		},
	});

	return dbBaselines.map((baseline) => ({
		predicateName: baseline.predicateName,
		totalFires: baseline.totalFires,
		totalOpportunities: baseline.totalOpportunities,
	}));
}
