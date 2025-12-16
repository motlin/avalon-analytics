import type {PersonAnnotationProfile, PersonAnnotationStatistic} from '../models/annotationStatistics';
import {RARITY_CSS_COLORS} from '../models/predicateRarity';
import styles from './PersonAnnotationStats.module.css';

interface PersonAnnotationStatsProps {
	profile: PersonAnnotationProfile;
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

function getDirectionArrow(direction: 'above' | 'below' | 'neutral'): string {
	switch (direction) {
		case 'above':
			return '\u2191';
		case 'below':
			return '\u2193';
		default:
			return '\u2194';
	}
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

function AnnotationRow({statistic}: {statistic: PersonAnnotationStatistic}) {
	const backgroundColor = zScoreToBackgroundColor(statistic.zScore);

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
				<span className={styles.rawRate}>
					({statistic.fires}/{statistic.opportunities})
				</span>
			</td>
			<td className={styles.baselineCell}>
				<span className={styles.baselineRate}>{formatPercent(statistic.baselineRate)}</span>
				<span className={styles.directionArrow}>{getDirectionArrow(statistic.deviationDirection)}</span>
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

export function PersonAnnotationStats({profile}: PersonAnnotationStatsProps) {
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
