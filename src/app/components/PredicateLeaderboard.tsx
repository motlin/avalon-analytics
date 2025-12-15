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
 * Converts a z-score to a background color using a gradient.
 * z-score -2 -> green (below average)
 * z-score 0 -> white (at average)
 * z-score +2 -> red (above average)
 */
function zScoreToBackgroundColor(zScore: number): string {
	// Clamp z-score to [-2, 2] range
	const clampedZScore = Math.max(-2, Math.min(2, zScore));

	// Normalize to [0, 1] where 0 = -2, 0.5 = 0, 1 = +2
	const normalized = (clampedZScore + 2) / 4;

	if (normalized < 0.5) {
		// Green to white (z-score -2 to 0)
		// At 0: full green (0, 128, 0)
		// At 0.5: white (255, 255, 255)
		const greenToWhite = normalized * 2; // 0 to 1
		const red = Math.round(255 * greenToWhite);
		const green = Math.round(128 + (255 - 128) * greenToWhite);
		const blue = Math.round(255 * greenToWhite);
		return `rgba(${red}, ${green}, ${blue}, 0.3)`;
	}
	// White to red (z-score 0 to +2)
	// At 0.5: white (255, 255, 255)
	// At 1: full red (255, 0, 0)
	const whiteToRed = (normalized - 0.5) * 2; // 0 to 1
	const red = 255;
	const green = Math.round(255 * (1 - whiteToRed));
	const blue = Math.round(255 * (1 - whiteToRed));
	return `rgba(${red}, ${green}, ${blue}, 0.3)`;
}

function formatPercent(value: number): string {
	return `${(value * 100).toFixed(1)}%`;
}

function formatPercentile(value: number): string {
	return `${value.toFixed(0)}th`;
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
	const backgroundColor = zScoreToBackgroundColor(entry.zScore);

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
				<span className={styles.smoothedRate}>{formatPercent(entry.smoothedRate)}</span>
				<span className={styles.rawRate}>
					({entry.fires}/{entry.opportunities})
				</span>
			</td>
			<td className={styles.percentileCell}>
				{formatPercentile(entry.percentileRank)}
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
							<th className={styles.headerNum}>Percentile</th>
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
						style={{backgroundColor: 'rgba(0, 128, 0, 0.3)'}}
					/>
					Below average
				</span>
				<span className={styles.legendItem}>
					<span
						className={styles.legendSwatch}
						style={{backgroundColor: 'rgba(255, 255, 255, 0.3)'}}
					/>
					Average
				</span>
				<span className={styles.legendItem}>
					<span
						className={styles.legendSwatch}
						style={{backgroundColor: 'rgba(255, 0, 0, 0.3)'}}
					/>
					Above average
				</span>
				<span className={styles.legendItem}>* = statistically significant (p &lt; 0.05)</span>
			</div>
		</div>
	);
}
