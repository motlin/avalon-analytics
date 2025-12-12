/**
 * Rarity Distribution Analysis
 *
 * Reports on how predicates are distributed across rarity tiers,
 * and aggregate fire counts per tier.
 *
 * Usage: npx tsx src/scripts/analyze-rarities.ts
 */

import {PREDICATE_FIRE_COUNTS, RARITY_ORDER, getRarityForFireCount, type Rarity} from '../app/models/predicateRarity';

interface RarityStats {
	rarity: Rarity;
	predicateCount: number;
	totalFires: number;
	predicates: {name: string; fires: number}[];
}

function analyzeRarities(): Map<Rarity, RarityStats> {
	const stats = new Map<Rarity, RarityStats>();

	// Initialize all rarity tiers
	const rarities: Rarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
	for (const rarity of rarities) {
		stats.set(rarity, {
			rarity,
			predicateCount: 0,
			totalFires: 0,
			predicates: [],
		});
	}

	// Categorize each predicate
	for (const [predicateName, fireCount] of Object.entries(PREDICATE_FIRE_COUNTS)) {
		const rarity = getRarityForFireCount(fireCount);
		const tierStats = stats.get(rarity)!;

		tierStats.predicateCount++;
		tierStats.totalFires += fireCount;
		tierStats.predicates.push({name: predicateName, fires: fireCount});
	}

	// Sort predicates within each tier by fire count
	for (const tierStats of stats.values()) {
		tierStats.predicates.sort((a, b) => a.fires - b.fires);
	}

	return stats;
}

function formatNumber(n: number): string {
	return n.toLocaleString();
}

function main() {
	const stats = analyzeRarities();
	const totalPredicates = Object.keys(PREDICATE_FIRE_COUNTS).length;
	const totalFires = Object.values(PREDICATE_FIRE_COUNTS).reduce((sum, n) => sum + n, 0);

	console.log('Rarity Distribution Analysis');
	console.log('============================\n');

	console.log(`Total predicates: ${totalPredicates}`);
	console.log(`Total fires: ${formatNumber(totalFires)}\n`);

	// Summary table
	console.log('Summary by Rarity Tier:');
	console.log('Rarity      | Rules | Total Fires | Avg Fires/Rule');
	console.log('------------|-------|-------------|---------------');

	const sortedTiers = [...stats.entries()].sort((a, b) => RARITY_ORDER[a[0]] - RARITY_ORDER[b[0]]);

	for (const [rarity, tierStats] of sortedTiers) {
		const avg = tierStats.predicateCount > 0 ? Math.round(tierStats.totalFires / tierStats.predicateCount) : 0;
		const rarityPadded = rarity.padEnd(11);
		const countPadded = tierStats.predicateCount.toString().padStart(5);
		const firesPadded = formatNumber(tierStats.totalFires).padStart(11);
		const avgPadded = formatNumber(avg).padStart(14);
		console.log(`${rarityPadded} | ${countPadded} | ${firesPadded} | ${avgPadded}`);
	}

	// Detailed breakdown
	console.log('\n\nDetailed Breakdown by Rarity:');
	console.log('=============================\n');

	for (const [rarity, tierStats] of sortedTiers) {
		if (tierStats.predicateCount === 0) continue;

		console.log(
			`\n${rarity.toUpperCase()} (${tierStats.predicateCount} predicates, ${formatNumber(tierStats.totalFires)} total fires):`,
		);
		console.log('-'.repeat(60));

		for (const pred of tierStats.predicates) {
			const firesPadded = formatNumber(pred.fires).padStart(6);
			console.log(`  ${firesPadded}  ${pred.name}`);
		}
	}

	// Thresholds reminder
	console.log('\n\nRarity Thresholds:');
	console.log('==================');
	console.log('  legendary: < 500 fires');
	console.log('  epic:      < 1,000 fires');
	console.log('  rare:      < 2,500 fires');
	console.log('  uncommon:  < 6,000 fires');
	console.log('  common:    >= 6,000 fires');
}

main();
