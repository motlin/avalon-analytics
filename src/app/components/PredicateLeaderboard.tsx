import type {Rarity} from '../models/predicateRarity';
import {RARITY_CSS_COLORS} from '../models/predicateRarity';
import styles from './PredicateLeaderboard.module.css';

/**
 * Individual person's statistics for a specific predicate.
 * Used for leaderboard ranking.
 */
export interface PredicateLeaderboardEntry {
	/** Person's unique identifier for linking */
	personId: string;
	/** Person's display name */
	personName: string;
	/** Number of times the behavior occurred */
	fires: number;
	/** Number of opportunities to exhibit the behavior */
	opportunities: number;
	/** Raw rate = fires / opportunities */
	rawRate: number;
	/** Empirical Bayes adjusted rate (shrunk toward population mean) */
	smoothedRate: number;
	/** Z-score measuring standard deviations from baseline */
	zScore: number;
	/** Percentile rank (0-100) based on z-score */
	percentileRank: number;
	/** True if |zScore| > 1.96 (95% significance) */
	isSignificant: boolean;
}

export interface PredicateLeaderboardProps {
	/** The predicate being displayed */
	predicateName: string;
	/** Rarity tier of the predicate */
	rarity: Rarity;
	/** Population baseline rate for context */
	baselineRate: number;
	/** List of people ranked by smoothed rate (highest first) */
	entries: PredicateLeaderboardEntry[];
}

/**
 * Converts statistical significance to a background color using a blue gradient.
 * Not significant -> white
 * Highly significant (|z-score| >= 3) -> saturated blue
 */
function significanceToBackgroundColor(isSignificant: boolean, zScore: number): string {
	if (!isSignificant) {
		return 'transparent';
	}

	// Use absolute z-score to determine saturation
	// |z| = 2 (barely significant) -> light blue
	// |z| = 3+ (highly significant) -> saturated blue
	const absZ = Math.abs(zScore);
	// Map |z| from [2, 3] to [0.15, 0.4] alpha
	const alpha = Math.min(0.4, 0.15 + (absZ - 2) * 0.25);

	return `rgba(59, 130, 246, ${alpha})`; // Blue color (#3b82f6)
}

function formatPercent(value: number): string {
	return `${(value * 100).toFixed(1)}%`;
}

function formatPredicateName(name: string): string {
	// Remove common suffixes to make names more readable
	return name
		.replace(/ProposalVotePredicate$/, '')
		.replace(/ProposalPredicate$/, '')
		.replace(/MissionVotePredicate$/, '')
		.replace(/Predicate$/, '')
		.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function LeaderboardRow({entry, rank}: {entry: PredicateLeaderboardEntry; rank: number}) {
	const backgroundColor = significanceToBackgroundColor(entry.isSignificant, entry.zScore);

	return (
		<tr
			className={styles.dataRow}
			style={{backgroundColor}}
		>
			<td className={styles.rankCell}>{rank}</td>
			<td className={styles.nameCell}>
				<a
					href={`/person/${entry.personId}`}
					className={styles.personLink}
				>
					{entry.personName}
				</a>
			</td>
			<td className={styles.rateCell}>
				<span className={styles.rateValue}>{formatPercent(entry.rawRate)}</span>
				<span className={styles.rawRate}>
					({entry.fires}/{entry.opportunities})
				</span>
				{entry.isSignificant && <span className={styles.significanceMarker}>*</span>}
			</td>
		</tr>
	);
}

export function PredicateLeaderboard({predicateName, rarity, baselineRate, entries}: PredicateLeaderboardProps) {
	if (entries.length === 0) {
		return (
			<div className={styles.container}>
				<h3 className={styles.title}>
					<span
						className={styles.rarityDot}
						style={{backgroundColor: RARITY_CSS_COLORS[rarity]}}
					/>
					{formatPredicateName(predicateName)}
				</h3>
				<p className={styles.emptyMessage}>No data available for this predicate.</p>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>
				<span
					className={styles.rarityDot}
					style={{backgroundColor: RARITY_CSS_COLORS[rarity]}}
				/>
				{formatPredicateName(predicateName)}
			</h3>

			<div className={styles.summary}>
				<span className={styles.summaryItem}>Baseline rate: {formatPercent(baselineRate)}</span>
				<span className={styles.summaryItem}>{entries.length} players tracked</span>
			</div>

			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th className={styles.headerRank}>#</th>
							<th className={styles.headerName}>Player</th>
							<th className={styles.headerNum}>Rate</th>
						</tr>
					</thead>
					<tbody>
						{entries.map((entry, index) => (
							<LeaderboardRow
								key={entry.personId}
								entry={entry}
								rank={index + 1}
							/>
						))}
					</tbody>
				</table>
			</div>

			<div className={styles.legend}>
				<span className={styles.legendItem}>
					<span
						className={styles.legendSwatch}
						style={{backgroundColor: 'transparent', border: '1px solid hsl(var(--border))'}}
					/>
					Not significant
				</span>
				<span className={styles.legendItem}>
					<span
						className={styles.legendSwatch}
						style={{backgroundColor: 'rgba(59, 130, 246, 0.15)'}}
					/>
					Significant (p &lt; 0.05)
				</span>
				<span className={styles.legendItem}>
					<span
						className={styles.legendSwatch}
						style={{backgroundColor: 'rgba(59, 130, 246, 0.4)'}}
					/>
					Highly significant
				</span>
			</div>
		</div>
	);
}
