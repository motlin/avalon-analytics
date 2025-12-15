/**
 * Unit tests for statistical functions used in annotation analysis
 */

import {describe, expect, it} from 'vitest';
import {calculateZScore, empiricalBayesEstimate, wilsonScoreInterval, zScoreToPercentile} from './statisticalFunctions';

// ============================================================================
// Wilson Score Interval
// ============================================================================

describe('wilsonScoreInterval', () => {
	it('bounds stay in [0,1] range for extreme proportions', () => {
		// 0% success rate
		const zeroSuccess = wilsonScoreInterval(0, 100);
		expect(zeroSuccess.lower).toBeGreaterThanOrEqual(0);
		expect(zeroSuccess.upper).toBeLessThanOrEqual(1);

		// 100% success rate
		const fullSuccess = wilsonScoreInterval(100, 100);
		expect(fullSuccess.lower).toBeGreaterThanOrEqual(0);
		expect(fullSuccess.upper).toBeLessThanOrEqual(1);
	});

	it('bounds stay in [0,1] range for small samples', () => {
		// Edge case: 1 success out of 1 trial
		const oneOfOne = wilsonScoreInterval(1, 1);
		expect(oneOfOne.lower).toBeGreaterThanOrEqual(0);
		expect(oneOfOne.upper).toBeLessThanOrEqual(1);

		// Edge case: 0 success out of 1 trial
		const zeroOfOne = wilsonScoreInterval(0, 1);
		expect(zeroOfOne.lower).toBeGreaterThanOrEqual(0);
		expect(zeroOfOne.upper).toBeLessThanOrEqual(1);
	});

	it('returns [0, 1] with center 0.5 when trials is zero', () => {
		const result = wilsonScoreInterval(0, 0);
		expect(result.lower).toBe(0);
		expect(result.upper).toBe(1);
		expect(result.center).toBe(0.5);
	});

	it('produces wider intervals for smaller sample sizes', () => {
		const smallSample = wilsonScoreInterval(5, 10);
		const largeSample = wilsonScoreInterval(50, 100);

		const smallWidth = smallSample.upper - smallSample.lower;
		const largeWidth = largeSample.upper - largeSample.lower;

		expect(smallWidth).toBeGreaterThan(largeWidth);
	});

	it('center is between lower and upper bounds', () => {
		const result = wilsonScoreInterval(30, 100);
		expect(result.center).toBeGreaterThanOrEqual(result.lower);
		expect(result.center).toBeLessThanOrEqual(result.upper);
	});

	it('center approaches observed proportion with large samples', () => {
		const result = wilsonScoreInterval(5000, 10000);
		const observedProportion = 0.5;
		// With 10000 trials, center should be very close to 0.5
		expect(Math.abs(result.center - observedProportion)).toBeLessThan(0.01);
	});

	it('produces narrower intervals with higher confidence', () => {
		const confidence90 = wilsonScoreInterval(50, 100, 0.9);
		const confidence99 = wilsonScoreInterval(50, 100, 0.99);

		const width90 = confidence90.upper - confidence90.lower;
		const width99 = confidence99.upper - confidence99.lower;

		expect(width90).toBeLessThan(width99);
	});
});

// ============================================================================
// Empirical Bayes Estimation
// ============================================================================

describe('empiricalBayesEstimate', () => {
	it('returns population rate when trials is zero', () => {
		const populationRate = 0.3;
		const result = empiricalBayesEstimate(0, 0, populationRate);
		expect(result).toBe(populationRate);
	});

	it('shrinks toward population with small samples', () => {
		const populationRate = 0.3;
		// With 2 successes out of 2 trials, observed rate is 100%
		// But with small samples, it should shrink toward population
		const result = empiricalBayesEstimate(2, 2, populationRate);

		// Result should be between observed (1.0) and population (0.3)
		expect(result).toBeGreaterThan(populationRate);
		expect(result).toBeLessThan(1.0);
	});

	it('approaches observed rate with large samples', () => {
		const populationRate = 0.3;
		const successes = 80;
		const trials = 100;
		const observedRate = successes / trials;

		const result = empiricalBayesEstimate(successes, trials, populationRate);

		// With 100 trials and shrinkage of 10, weight is 100/(100+10) = 91% observed
		// Result should be much closer to observed (0.8) than population (0.3)
		const distanceToObserved = Math.abs(result - observedRate);
		const distanceToPopulation = Math.abs(result - populationRate);
		expect(distanceToObserved).toBeLessThan(distanceToPopulation);
	});

	it('uses 50% weighting when trials equals shrinkage strength', () => {
		const populationRate = 0.2;
		const observedRate = 0.8; // 8/10
		const shrinkageStrength = 10;

		const result = empiricalBayesEstimate(8, 10, populationRate, shrinkageStrength);

		// With 10 trials and shrinkage of 10: 50% observed, 50% population
		const expectedResult = 0.5 * observedRate + 0.5 * populationRate;
		expect(result).toBeCloseTo(expectedResult, 10);
	});

	it('applies custom shrinkage strength correctly', () => {
		const populationRate = 0.3;
		const successes = 5;
		const trials = 10;

		const weakShrinkage = empiricalBayesEstimate(successes, trials, populationRate, 5);
		const strongShrinkage = empiricalBayesEstimate(successes, trials, populationRate, 20);

		// Stronger shrinkage pulls more toward population rate
		const observedRate = successes / trials;
		const weakDistanceToObserved = Math.abs(weakShrinkage - observedRate);
		const strongDistanceToObserved = Math.abs(strongShrinkage - observedRate);

		expect(weakDistanceToObserved).toBeLessThan(strongDistanceToObserved);
	});

	it('result stays within observed and population bounds', () => {
		const populationRate = 0.3;
		const observedRate = 0.7;
		const successes = 7;
		const trials = 10;

		const result = empiricalBayesEstimate(successes, trials, populationRate);

		expect(result).toBeGreaterThanOrEqual(Math.min(observedRate, populationRate));
		expect(result).toBeLessThanOrEqual(Math.max(observedRate, populationRate));
	});
});

// ============================================================================
// Z-Score Calculation
// ============================================================================

describe('calculateZScore', () => {
	it('returns 0 when sample size is zero', () => {
		const result = calculateZScore(0.5, 0.3, 0);
		expect(result).toBe(0);
	});

	it('returns 0 when observed equals baseline', () => {
		const baselineRate = 0.4;
		const result = calculateZScore(baselineRate, baselineRate, 100);
		expect(result).toBe(0);
	});

	it('returns positive z-score when observed is above baseline', () => {
		const result = calculateZScore(0.6, 0.4, 100);
		expect(result).toBeGreaterThan(0);
	});

	it('returns negative z-score when observed is below baseline', () => {
		const result = calculateZScore(0.2, 0.4, 100);
		expect(result).toBeLessThan(0);
	});

	it('calculates expected z-score values', () => {
		// Standard error = sqrt(0.5 * 0.5 / 100) = 0.05
		// Z = (0.6 - 0.5) / 0.05 = 2.0
		const result = calculateZScore(0.6, 0.5, 100);
		expect(result).toBeCloseTo(2.0, 5);
	});

	it('larger sample sizes produce larger z-scores for same difference', () => {
		const difference = 0.1;
		const baseline = 0.5;

		const zSmall = calculateZScore(baseline + difference, baseline, 25);
		const zLarge = calculateZScore(baseline + difference, baseline, 100);

		expect(Math.abs(zLarge)).toBeGreaterThan(Math.abs(zSmall));
	});

	it('returns Infinity when baseline is 0 and observed is positive', () => {
		const result = calculateZScore(0.5, 0, 100);
		expect(result).toBe(Infinity);
	});

	it('returns -Infinity when baseline is 1 and observed is less', () => {
		const result = calculateZScore(0.5, 1, 100);
		expect(result).toBe(-Infinity);
	});

	it('returns 0 when baseline is 0 and observed is also 0', () => {
		const result = calculateZScore(0, 0, 100);
		expect(result).toBe(0);
	});

	it('returns 0 when baseline is 1 and observed is also 1', () => {
		const result = calculateZScore(1, 1, 100);
		expect(result).toBe(0);
	});
});

// ============================================================================
// Z-Score to Percentile Conversion
// ============================================================================

describe('zScoreToPercentile', () => {
	it('z=0 maps to 50th percentile', () => {
		const result = zScoreToPercentile(0);
		expect(result).toBeCloseTo(50, 5);
	});

	it('z=1.96 maps to approximately 97.5th percentile', () => {
		const result = zScoreToPercentile(1.96);
		expect(result).toBeCloseTo(97.5, 0);
	});

	it('z=-1.96 maps to approximately 2.5th percentile', () => {
		const result = zScoreToPercentile(-1.96);
		expect(result).toBeCloseTo(2.5, 0);
	});

	it('z=1 maps to approximately 84th percentile', () => {
		const result = zScoreToPercentile(1);
		expect(result).toBeCloseTo(84.13, 0);
	});

	it('z=-1 maps to approximately 16th percentile', () => {
		const result = zScoreToPercentile(-1);
		expect(result).toBeCloseTo(15.87, 0);
	});

	it('returns 100 for positive infinity', () => {
		const result = zScoreToPercentile(Infinity);
		expect(result).toBe(100);
	});

	it('returns 0 for negative infinity', () => {
		const result = zScoreToPercentile(-Infinity);
		expect(result).toBe(0);
	});

	it('large positive z-score approaches 100', () => {
		const result = zScoreToPercentile(5);
		expect(result).toBeGreaterThanOrEqual(99.9);
		expect(result).toBeLessThan(100);
	});

	it('large negative z-score approaches 0', () => {
		const result = zScoreToPercentile(-5);
		expect(result).toBeLessThanOrEqual(0.1);
		expect(result).toBeGreaterThan(0);
	});

	it('percentile increases monotonically with z-score', () => {
		const zScores = [-3, -2, -1, 0, 1, 2, 3];
		const percentiles = zScores.map(zScoreToPercentile);

		for (let i = 1; i < percentiles.length; i++) {
			expect(percentiles[i]).toBeGreaterThan(percentiles[i - 1]!);
		}
	});
});
