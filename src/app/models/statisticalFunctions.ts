/**
 * Statistical Functions for Annotation Analysis
 *
 * Provides confidence intervals, Bayesian estimation, and z-score calculations
 * for comparing individual annotation rates to population baselines.
 */

import {cumulativeStdNormalProbability, probit} from 'simple-statistics';

// ============================================================================
// Types
// ============================================================================

export interface WilsonScoreResult {
	/** Lower bound of the confidence interval */
	lower: number;
	/** Upper bound of the confidence interval */
	upper: number;
	/** Center of the confidence interval (Wilson-adjusted mean) */
	center: number;
}

// ============================================================================
// Wilson Score Interval
// ============================================================================

/**
 * Calculates the Wilson score confidence interval for a proportion.
 *
 * The Wilson score interval is recommended for binomial proportions because it:
 * - Never produces bounds below 0 or above 1
 * - Works well for small sample sizes
 * - Works well for proportions near 0 or 1
 *
 * Formula: (p + z^2/2n +/- z * sqrt(p(1-p)/n + z^2/4n^2)) / (1 + z^2/n)
 *
 * @param successes - Number of times the event occurred (fires)
 * @param trials - Total number of opportunities (denominator)
 * @param confidence - Confidence level (default 0.95 for 95% CI)
 * @returns Confidence bounds {lower, upper, center}
 */
export function wilsonScoreInterval(successes: number, trials: number, confidence = 0.95): WilsonScoreResult {
	// Handle edge cases
	if (trials === 0) {
		return {lower: 0, upper: 1, center: 0.5};
	}

	// Observed proportion
	const proportion = successes / trials;

	// z-score for the desired confidence level (e.g., 1.96 for 95%)
	const alpha = 1 - confidence;
	const zScore = probit(1 - alpha / 2);

	const zSquared = zScore * zScore;
	const denominator = 1 + zSquared / trials;

	// Wilson score formula
	const center = (proportion + zSquared / (2 * trials)) / denominator;
	const marginBase = Math.sqrt((proportion * (1 - proportion)) / trials + zSquared / (4 * trials * trials));
	const margin = (zScore * marginBase) / denominator;

	return {
		lower: Math.max(0, center - margin),
		upper: Math.min(1, center + margin),
		center,
	};
}

// ============================================================================
// Empirical Bayes Estimation
// ============================================================================

/**
 * Calculates an empirical Bayes estimate by shrinking observed rates toward a population baseline.
 *
 * This addresses the small sample size problem: a player with 2/2 fires (100%) on a rare
 * predicate shouldn't be ranked higher than someone with 50/100 fires (50%).
 *
 * The shrinkage formula:
 *   estimate = (trials / (trials + strength)) * observed + (strength / (trials + strength)) * population
 *
 * With shrinkageStrength = 10:
 * - 10 opportunities: 50% your data, 50% population
 * - 100 opportunities: 91% your data, 9% population
 *
 * @param successes - Number of times the event occurred
 * @param trials - Total number of opportunities (denominator, not total games)
 * @param populationRate - The baseline rate across all mapped people
 * @param shrinkageStrength - How strongly to pull toward the population mean (default 10)
 * @returns The smoothed rate estimate
 */
export function empiricalBayesEstimate(
	successes: number,
	trials: number,
	populationRate: number,
	shrinkageStrength = 10,
): number {
	// Handle edge case
	if (trials === 0) {
		return populationRate;
	}

	const observedRate = successes / trials;
	const totalWeight = trials + shrinkageStrength;
	const observedWeight = trials / totalWeight;
	const populationWeight = shrinkageStrength / totalWeight;

	return observedWeight * observedRate + populationWeight * populationRate;
}

// ============================================================================
// Z-Score Calculation
// ============================================================================

/**
 * Calculates the z-score for an observed rate compared to a baseline.
 *
 * For binomial proportions, the standard error is sqrt(p * (1-p) / n).
 * The z-score measures how many standard deviations the observation is from the baseline.
 *
 * @param observedRate - The rate observed for this player (fires / opportunities)
 * @param baselineRate - The population baseline rate
 * @param sampleSize - Number of opportunities (denominator)
 * @returns The z-score (positive = above average, negative = below average)
 */
export function calculateZScore(observedRate: number, baselineRate: number, sampleSize: number): number {
	// Handle edge cases
	if (sampleSize === 0) {
		return 0;
	}

	// Avoid division by zero when baseline is 0 or 1
	if (baselineRate === 0 || baselineRate === 1) {
		// If baseline is 0 and we observed any, or baseline is 1 and we didn't always fire,
		// we can't compute a meaningful z-score with standard error
		if (observedRate === baselineRate) {
			return 0;
		}
		// Return a large z-score indicating significant deviation
		return observedRate > baselineRate ? Infinity : -Infinity;
	}

	const standardError = Math.sqrt((baselineRate * (1 - baselineRate)) / sampleSize);
	return (observedRate - baselineRate) / standardError;
}

// ============================================================================
// Two-Proportion Z-Test
// ============================================================================

/**
 * Calculates the z-score for the difference between two independent proportions.
 *
 * This is used to determine if two rates (e.g., good vs evil baseline rates)
 * are significantly different from each other.
 *
 * Uses the pooled proportion method:
 *   p_pooled = (x1 + x2) / (n1 + n2)
 *   z = (p1 - p2) / sqrt(p_pooled * (1 - p_pooled) * (1/n1 + 1/n2))
 *
 * @param successes1 - Number of successes in group 1
 * @param trials1 - Number of trials in group 1
 * @param successes2 - Number of successes in group 2
 * @param trials2 - Number of trials in group 2
 * @returns The z-score (positive if group 1 > group 2)
 */
export function twoProportionZScore(successes1: number, trials1: number, successes2: number, trials2: number): number {
	// Handle edge cases
	if (trials1 === 0 || trials2 === 0) {
		return 0;
	}

	const p1 = successes1 / trials1;
	const p2 = successes2 / trials2;

	// Pooled proportion
	const pooled = (successes1 + successes2) / (trials1 + trials2);

	// Avoid division by zero
	if (pooled === 0 || pooled === 1) {
		if (p1 === p2) {
			return 0;
		}
		return p1 > p2 ? Infinity : -Infinity;
	}

	const standardError = Math.sqrt(pooled * (1 - pooled) * (1 / trials1 + 1 / trials2));
	return (p1 - p2) / standardError;
}

// ============================================================================
// Percentile Conversion
// ============================================================================

/**
 * Converts a z-score to a percentile rank (0-100).
 *
 * Uses the cumulative standard normal probability function.
 * - z = 0 -> 50th percentile (exactly average)
 * - z = 1.96 -> ~97.5th percentile
 * - z = -1.96 -> ~2.5th percentile
 *
 * @param zScore - The z-score to convert
 * @returns Percentile rank from 0 to 100
 */
export function zScoreToPercentile(zScore: number): number {
	// Handle infinity cases
	if (!Number.isFinite(zScore)) {
		return zScore > 0 ? 100 : 0;
	}

	// cumulativeStdNormalProbability returns probability 0-1
	const probability = cumulativeStdNormalProbability(zScore);
	return probability * 100;
}
