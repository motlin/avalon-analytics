import {env} from 'cloudflare:workers';
import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {type PredicateLeaderboardEntry, PredicateLeaderboard} from '../../components/PredicateLeaderboard';
import {type PredicateBaseline, loadGlobalAnnotationBaselines} from '../../models/annotationStatistics';
import {type Rarity, getPredicateRarity} from '../../models/predicateRarity';
import {calculateZScore, empiricalBayesEstimate, zScoreToPercentile} from '../../models/statisticalFunctions';
import {getPersonService} from '../../services/person';
import {db, setupDb} from '@/db';

/** Z-score threshold for statistical significance (95% CI) */
const SIGNIFICANCE_THRESHOLD = 1.96;

/** Shrinkage strength for empirical Bayes estimation */
const SHRINKAGE_STRENGTH = 10;

interface RawPredicateAnnotationStat {
	personId: string;
	fires: number;
	opportunities: number;
}

/**
 * Loads all PersonAnnotationStats for a given predicate from the database.
 */
async function loadPredicateAnnotationStats(predicateName: string): Promise<RawPredicateAnnotationStat[]> {
	const stats = await db.personAnnotationStats.findMany({
		where: {predicateName},
		select: {
			personId: true,
			fires: true,
			opportunities: true,
		},
	});

	return stats.map((stat) => ({
		personId: stat.personId,
		fires: stat.fires,
		opportunities: stat.opportunities,
	}));
}

/**
 * Computes leaderboard entries from raw stats and baseline.
 * Sorts by smoothed rate (highest first).
 */
function computeLeaderboardEntries(
	rawStats: RawPredicateAnnotationStat[],
	baseline: PredicateBaseline | undefined,
	personNames: Map<string, string>,
): PredicateLeaderboardEntry[] {
	const entries: PredicateLeaderboardEntry[] = [];

	// Get baseline rate
	const baselineRate =
		baseline && baseline.totalOpportunities > 0 ? baseline.totalFires / baseline.totalOpportunities : 0;

	for (const raw of rawStats) {
		// Skip entries with no opportunities
		if (raw.opportunities === 0) {
			continue;
		}

		// Get person name (skip if not found)
		const personName = personNames.get(raw.personId);
		if (!personName) {
			continue;
		}

		// Compute statistics
		const rawRate = raw.fires / raw.opportunities;
		const smoothedRate = empiricalBayesEstimate(raw.fires, raw.opportunities, baselineRate, SHRINKAGE_STRENGTH);
		const zScore = calculateZScore(rawRate, baselineRate, raw.opportunities);
		const percentileRank = zScoreToPercentile(zScore);
		const isSignificant = Math.abs(zScore) > SIGNIFICANCE_THRESHOLD && Number.isFinite(zScore);

		entries.push({
			personId: raw.personId,
			personName,
			fires: raw.fires,
			opportunities: raw.opportunities,
			rawRate,
			smoothedRate,
			zScore,
			percentileRank,
			isSignificant,
		});
	}

	// Sort by smoothed rate (highest first)
	entries.sort((a, b) => b.smoothedRate - a.smoothedRate);

	return entries;
}

/**
 * Formats predicate name for display (removes common suffixes and adds spaces).
 */
function formatPredicateName(name: string): string {
	return name
		.replace(/ProposalVotePredicate$/, '')
		.replace(/ProposalPredicate$/, '')
		.replace(/MissionVotePredicate$/, '')
		.replace(/Predicate$/, '')
		.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * Predicate detail page that displays a leaderboard of all players ranked by their rate for a specific predicate.
 * Route: /predicate/:predicateName
 */
export async function PredicateDetail({params}: RequestInfo) {
	const predicateName = params.predicateName;

	let error: string | null = null;
	let entries: PredicateLeaderboardEntry[] = [];
	let baselineRate = 0;
	let rarity: Rarity = 'common';

	try {
		await setupDb(env);

		// Get person info for name lookup
		const personService = getPersonService();
		await personService.initialize();
		const allPeople = await personService.getAllPeople();
		const personNames = new Map<string, string>();
		for (const person of allPeople) {
			personNames.set(person.id, person.name);
		}

		// Load annotation stats for this predicate
		const [rawStats, baselines] = await Promise.all([
			loadPredicateAnnotationStats(predicateName),
			loadGlobalAnnotationBaselines(db),
		]);

		// Find baseline for this predicate
		const baseline = baselines.find((b) => b.predicateName === predicateName);

		if (baseline && baseline.totalOpportunities > 0) {
			baselineRate = baseline.totalFires / baseline.totalOpportunities;
		}

		// Get rarity
		rarity = getPredicateRarity(predicateName);

		// Compute leaderboard entries
		entries = computeLeaderboardEntries(rawStats, baseline, personNames);
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load predicate statistics';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const displayName = formatPredicateName(predicateName);

	return (
		<div style={{padding: '1rem', maxWidth: '1200px', margin: '0 auto'}}>
			<Breadcrumb
				items={[{label: 'Home', href: '/'}, {label: 'Predicates', href: '/predicates'}, {label: displayName}]}
			/>

			<div style={{marginBottom: '2rem'}}>
				<h1 style={{margin: '0 0 0.5rem 0'}}>{displayName}</h1>
				<p style={{margin: 0, color: '#666', fontSize: '0.875rem'}}>
					Leaderboard showing all players ranked by their rate for this behavior
				</p>
			</div>

			<PredicateLeaderboard
				predicateName={predicateName}
				rarity={rarity}
				baselineRate={baselineRate}
				entries={entries}
			/>
		</div>
	);
}
