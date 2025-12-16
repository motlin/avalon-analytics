import type {PersonAnnotationProfile, PersonAnnotationStatistic} from '../models/annotationStatistics';
import {RARITY_CSS_COLORS} from '../models/predicateRarity';
import styles from './PersonAnnotationStats.module.css';

interface PersonAnnotationStatsProps {
	profile: PersonAnnotationProfile;
	personId: string;
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

function formatPercentile(value: number): string {
	const rounded = Math.round(value);
	const lastDigit = rounded % 10;
	const lastTwoDigits = rounded % 100;

	let suffix: string;
	if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
		suffix = 'th';
	} else if (lastDigit === 1) {
		suffix = 'st';
	} else if (lastDigit === 2) {
		suffix = 'nd';
	} else if (lastDigit === 3) {
		suffix = 'rd';
	} else {
		suffix = 'th';
	}

	return `${rounded}${suffix}`;
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

function AnnotationRow({statistic, personId}: {statistic: PersonAnnotationStatistic; personId: string}) {
	const backgroundColor = significanceToBackgroundColor(statistic.isSignificant, statistic.zScore);
	const gamesUrl = `/person/${personId}/predicate/${statistic.predicateName}/games`;

	return (
		<tr
			className={styles.dataRow}
			style={{backgroundColor}}
		>
			<td className={styles.behaviorCell}>
				<span
					className={styles.rarityDot}
					style={{backgroundColor: RARITY_CSS_COLORS[statistic.rarity]}}
				/>
				<a
					href={`/predicate/${statistic.predicateName}`}
					className={styles.predicateLink}
				>
					{formatPredicateName(statistic.predicateName)}
				</a>
			</td>
			<td className={styles.rateCell}>
				<span className={styles.rateValue}>{formatPercent(statistic.rawRate)}</span>
				<a
					href={gamesUrl}
					className={styles.gamesLink}
					title="View games"
				>
					({statistic.fires}/{statistic.opportunities})
				</a>
			</td>
			<td className={styles.baselineCell}>
				<span className={styles.baselineRate}>{formatPercent(statistic.baselineRate)}</span>
			</td>
			<td className={styles.confidenceCell}>
				[{formatPercent(statistic.confidenceInterval.lower)} -{' '}
				{formatPercent(statistic.confidenceInterval.upper)}]
			</td>
			<td className={styles.rankCell}>
				{formatPercentile(statistic.percentileRank)}
				{statistic.isSignificant && <span className={styles.significanceMarker}>*</span>}
			</td>
		</tr>
	);
}

export function PersonAnnotationStats({profile, personId}: PersonAnnotationStatsProps) {
	const {annotations, summary} = profile;

	if (annotations.length === 0) {
		return (
			<div className={styles.container}>
				<h3 className={styles.title}>Annotation Behavior Statistics</h3>
				<p className={styles.emptyMessage}>No annotation data available for this player.</p>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>Annotation Behavior Statistics</h3>

			<div className={styles.summary}>
				<span className={styles.summaryItem}>{summary.totalPredicates} behaviors tracked</span>
				<span className={styles.summaryItem}>
					<span className={styles.aboveCount}>{summary.aboveBaseline}</span> above baseline
				</span>
				<span className={styles.summaryItem}>
					<span className={styles.belowCount}>{summary.belowBaseline}</span> below baseline
				</span>
				<span className={styles.summaryItem}>
					<span className={styles.significantCount}>{summary.significantDeviations}</span> significant*
				</span>
			</div>

			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th className={styles.headerBehavior}>Behavior</th>
							<th className={styles.headerNum}>Rate</th>
							<th className={styles.headerNum}>Baseline</th>
							<th className={styles.headerNum}>Confidence</th>
							<th className={styles.headerNum}>Rank</th>
						</tr>
					</thead>
					<tbody>
						{annotations.map((statistic) => (
							<AnnotationRow
								key={statistic.predicateName}
								statistic={statistic}
								personId={personId}
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
