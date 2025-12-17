import type {
	AlignmentIndicator,
	PersonAnnotationProfile,
	PersonAnnotationStatistic,
} from '../models/annotationStatistics';
import {RARITY_CSS_COLORS} from '../models/predicateRarity';
import styles from './PersonAnnotationStats.module.css';

interface PersonAnnotationStatsProps {
	profile: PersonAnnotationProfile;
	personId: string;
}

/**
 * Converts diagnostic value to a background color.
 * No diagnostic value -> transparent
 * Has diagnostic value -> light green (suggests good) or light red (suggests evil)
 */
function diagnosticToBackgroundColor(hasDiagnosticValue: boolean, suggestsAlignment: AlignmentIndicator): string {
	if (!hasDiagnosticValue) {
		return 'transparent';
	}

	if (suggestsAlignment === 'good') {
		return 'rgba(34, 197, 94, 0.15)'; // Green
	}
	if (suggestsAlignment === 'evil') {
		return 'rgba(239, 68, 68, 0.15)'; // Red
	}
	return 'transparent';
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

function getSuggestsLabel(suggests: AlignmentIndicator): string {
	switch (suggests) {
		case 'good':
			return 'Good';
		case 'evil':
			return 'Evil';
		default:
			return '—';
	}
}

function AnnotationRow({statistic, personId}: {statistic: PersonAnnotationStatistic; personId: string}) {
	const backgroundColor = diagnosticToBackgroundColor(statistic.hasDiagnosticValue, statistic.suggestsAlignment);
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
				<span className={styles.rateValue}>{formatPercent(statistic.goodBaselineRate)}</span>
				<span className={styles.sampleSize}>(n={statistic.goodBaselineSample})</span>
			</td>
			<td className={styles.rateCell}>
				<span className={styles.rateValue}>{formatPercent(statistic.evilBaselineRate)}</span>
				<span className={styles.sampleSize}>(n={statistic.evilBaselineSample})</span>
			</td>
			<td className={styles.suggestsCell}>
				<span
					className={
						statistic.suggestsAlignment === 'good'
							? styles.suggestsGood
							: statistic.suggestsAlignment === 'evil'
								? styles.suggestsEvil
								: styles.suggestsNeither
					}
				>
					{getSuggestsLabel(statistic.suggestsAlignment)}
				</span>
				{statistic.hasDiagnosticValue && <span className={styles.significanceMarker}>*</span>}
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

	// Count behaviors with diagnostic value
	const diagnosticCount = annotations.filter((a) => a.hasDiagnosticValue).length;
	const suggestsGoodCount = annotations.filter((a) => a.suggestsAlignment === 'good').length;
	const suggestsEvilCount = annotations.filter((a) => a.suggestsAlignment === 'evil').length;

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>Behavioral Tells</h3>

			<div className={styles.summary}>
				<span className={styles.summaryItem}>{summary.totalPredicates} behaviors tracked</span>
				<span className={styles.summaryItem}>
					<span className={styles.significantCount}>{diagnosticCount}</span> with diagnostic value*
				</span>
				<span className={styles.summaryItem}>
					<span className={styles.aboveCount}>{suggestsGoodCount}</span> suggest good
				</span>
				<span className={styles.summaryItem}>
					<span className={styles.belowCount}>{suggestsEvilCount}</span> suggest evil
				</span>
			</div>

			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th className={styles.headerBehavior}>Behavior</th>
							<th className={styles.headerNum}>Good Rate</th>
							<th className={styles.headerNum}>Evil Rate</th>
							<th className={styles.headerNum}>Suggests</th>
							<th className={styles.headerNum}>Your Rate</th>
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
					No diagnostic value
				</span>
				<span className={styles.legendItem}>
					<span
						className={styles.legendSwatch}
						style={{backgroundColor: 'rgba(34, 197, 94, 0.15)'}}
					/>
					Suggests good (p &lt; 0.05)
				</span>
				<span className={styles.legendItem}>
					<span
						className={styles.legendSwatch}
						style={{backgroundColor: 'rgba(239, 68, 68, 0.15)'}}
					/>
					Suggests evil (p &lt; 0.05)
				</span>
			</div>
		</div>
	);
}
