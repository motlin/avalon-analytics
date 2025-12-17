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

function formatPercent(value: number | null): string {
	if (value === null) {
		return '—';
	}
	return `${(value * 100).toFixed(0)}%`;
}

function formatPredicateName(name: string): string {
	return name
		.replace(/ProposalVotePredicate$/, '')
		.replace(/ProposalPredicate$/, '')
		.replace(/MissionVotePredicate$/, '')
		.replace(/Predicate$/, '')
		.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function formatTellCell(confidence: number, suggests: AlignmentIndicator): string {
	if (confidence < 80) {
		return '—';
	}
	const alignmentLabel = suggests === 'good' ? 'Good' : suggests === 'evil' ? 'Evil' : '—';
	return `${alignmentLabel} ${confidence.toFixed(0)}%`;
}

function getTellCellClass(confidence: number, suggests: AlignmentIndicator): string {
	if (confidence < 80) {
		return styles.tellNone;
	}
	if (suggests === 'good') {
		return confidence >= 95 ? styles.tellGoodStrong : styles.tellGoodWeak;
	}
	if (suggests === 'evil') {
		return confidence >= 95 ? styles.tellEvilStrong : styles.tellEvilWeak;
	}
	return styles.tellNone;
}

function AnnotationRow({statistic, personId}: {statistic: PersonAnnotationStatistic; personId: string}) {
	const gamesUrl = `/person/${personId}/predicate/${statistic.predicateName}/games`;

	const popGoodTooltip = `${statistic.goodBaselineSample} opportunities`;
	const popEvilTooltip = `${statistic.evilBaselineSample} opportunities`;
	const playerGoodTooltip =
		statistic.playerGoodOpportunities > 0
			? `${statistic.playerGoodFires}/${statistic.playerGoodOpportunities} fires`
			: 'No opportunities';
	const playerEvilTooltip =
		statistic.playerEvilOpportunities > 0
			? `${statistic.playerEvilFires}/${statistic.playerEvilOpportunities} fires`
			: 'No opportunities';

	return (
		<tr className={styles.dataRow}>
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
			<td
				className={styles.rateCell}
				title={popGoodTooltip}
			>
				{formatPercent(statistic.goodBaselineRate)}
			</td>
			<td
				className={styles.rateCell}
				title={popEvilTooltip}
			>
				{formatPercent(statistic.evilBaselineRate)}
			</td>
			<td className={getTellCellClass(statistic.popConfidence, statistic.popSuggestsAlignment)}>
				{formatTellCell(statistic.popConfidence, statistic.popSuggestsAlignment)}
			</td>
			<td
				className={styles.rateCell}
				title={playerGoodTooltip}
			>
				<a
					href={gamesUrl}
					className={styles.rateLinkGood}
				>
					{formatPercent(statistic.playerGoodRate)}
				</a>
			</td>
			<td
				className={styles.rateCell}
				title={playerEvilTooltip}
			>
				<a
					href={gamesUrl}
					className={styles.rateLinkEvil}
				>
					{formatPercent(statistic.playerEvilRate)}
				</a>
			</td>
			<td className={getTellCellClass(statistic.playerConfidence, statistic.playerSuggestsAlignment)}>
				{formatTellCell(statistic.playerConfidence, statistic.playerSuggestsAlignment)}
			</td>
		</tr>
	);
}

export function PersonAnnotationStats({profile, personId}: PersonAnnotationStatsProps) {
	const {annotations, summary} = profile;

	if (annotations.length === 0) {
		return (
			<div className={styles.container}>
				<h3 className={styles.title}>Behavioral Tells</h3>
				<p className={styles.emptyMessage}>No annotation data available for this player.</p>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>Behavioral Tells</h3>

			<div className={styles.summary}>
				<span className={styles.summaryItem}>{summary.totalPredicates} behaviors tracked</span>
				<span className={styles.summaryItem}>
					<span className={styles.popTellCount}>{summary.popTellCount}</span> population tells
				</span>
				<span className={styles.summaryItem}>
					<span className={styles.playerTellCount}>{summary.playerTellCount}</span> personal tells
				</span>
			</div>

			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th className={styles.headerBehavior}>Behavior</th>
							<th
								className={styles.headerNum}
								colSpan={3}
							>
								Population
							</th>
							<th
								className={styles.headerNum}
								colSpan={3}
							>
								You
							</th>
						</tr>
						<tr>
							<th className={styles.headerBehavior} />
							<th className={styles.headerSubGood}>Good</th>
							<th className={styles.headerSubEvil}>Evil</th>
							<th className={styles.headerSub}>Tell</th>
							<th className={styles.headerSubGood}>Good</th>
							<th className={styles.headerSubEvil}>Evil</th>
							<th className={styles.headerSub}>Tell</th>
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
				<span className={styles.legendItem}>Hover over rates to see sample sizes</span>
				<span className={styles.legendItem}>
					<span className={styles.legendLabelGood}>Good 95%+</span> = strong tell suggesting good
				</span>
				<span className={styles.legendItem}>
					<span className={styles.legendLabelEvil}>Evil 95%+</span> = strong tell suggesting evil
				</span>
			</div>
		</div>
	);
}
