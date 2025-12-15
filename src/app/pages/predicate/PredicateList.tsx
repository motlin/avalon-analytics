import {env} from 'cloudflare:workers';
import {Breadcrumb} from '../../components/Breadcrumb';
import {loadGlobalAnnotationBaselines} from '../../models/annotationStatistics';
import {type Rarity, RARITY_CSS_COLORS, RARITY_ORDER, getPredicateRarity} from '../../models/predicateRarity';
import {setupDb, db} from '@/db';
import styles from '../players/PlayersPage.module.css';

interface PredicateListEntry {
	predicateName: string;
	displayName: string;
	rarity: Rarity;
	totalFires: number;
	totalOpportunities: number;
	baselineRate: number;
	playerCount: number;
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

function formatPercent(value: number): string {
	return `${(value * 100).toFixed(1)}%`;
}

/**
 * Predicate list page showing all predicates with their baseline statistics.
 * Route: /predicates
 */
export async function PredicateList() {
	let predicates: PredicateListEntry[] = [];
	let error: string | null = null;

	try {
		await setupDb(env);

		// Load all baselines
		const baselines = await loadGlobalAnnotationBaselines(db);

		// Get player counts per predicate
		const playerCounts = await db.personAnnotationStats.groupBy({
			by: ['predicateName'],
			_count: {personId: true},
			where: {opportunities: {gt: 0}},
		});

		const playerCountMap = new Map<string, number>();
		for (const count of playerCounts) {
			playerCountMap.set(count.predicateName, count._count.personId);
		}

		// Build predicate list entries
		for (const baseline of baselines) {
			if (baseline.totalOpportunities === 0) {
				continue;
			}

			predicates.push({
				predicateName: baseline.predicateName,
				displayName: formatPredicateName(baseline.predicateName),
				rarity: getPredicateRarity(baseline.predicateName),
				totalFires: baseline.totalFires,
				totalOpportunities: baseline.totalOpportunities,
				baselineRate: baseline.totalFires / baseline.totalOpportunities,
				playerCount: playerCountMap.get(baseline.predicateName) ?? 0,
			});
		}

		// Sort by rarity (rarest first), then alphabetically
		predicates.sort((a, b) => {
			const rarityDiff = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
			if (rarityDiff !== 0) {
				return rarityDiff;
			}
			return a.displayName.localeCompare(b.displayName);
		});
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load predicates';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div className={styles.container}>
			<Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'Predicates'}]} />
			<div className={styles.header}>
				<h1>Predicates</h1>
				<p className={styles.subtitle}>{predicates.length} behaviors tracked across all players</p>
			</div>
			<div className={styles.content}>
				{predicates.length === 0 ? (
					<p className={styles.noPlayers}>No predicates found</p>
				) : (
					<div className={styles.tableWrapper}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th className={styles.nameColumn}>Behavior</th>
									<th className={styles.numberColumn}>Rarity</th>
									<th className={styles.numberColumn}>Players</th>
									<th className={styles.numberColumn}>Fires</th>
									<th className={styles.numberColumn}>Opportunities</th>
									<th className={styles.numberColumn}>Baseline</th>
								</tr>
							</thead>
							<tbody>
								{predicates.map((predicate) => (
									<tr key={predicate.predicateName}>
										<td className={styles.nameColumn}>
											<a
												href={`/predicate/${predicate.predicateName}`}
												className={styles.playerLink}
											>
												{predicate.displayName}
											</a>
										</td>
										<td className={styles.numberColumn}>
											<span
												style={{
													display: 'inline-block',
													width: '0.75rem',
													height: '0.75rem',
													borderRadius: '50%',
													backgroundColor: RARITY_CSS_COLORS[predicate.rarity],
													marginRight: '0.5rem',
													verticalAlign: 'middle',
												}}
											/>
											{predicate.rarity}
										</td>
										<td className={styles.numberColumn}>{predicate.playerCount}</td>
										<td className={styles.numberColumn}>{predicate.totalFires}</td>
										<td className={styles.numberColumn}>{predicate.totalOpportunities}</td>
										<td className={styles.numberColumn}>{formatPercent(predicate.baselineRate)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
