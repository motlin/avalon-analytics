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

function formatLikelihoodRatio(ratio: number): string {
	if (!Number.isFinite(ratio)) {
		return '∞';
	}
	if (ratio >= 10) {
		return `${ratio.toFixed(0)}x`;
	}
	return `${ratio.toFixed(1)}x`;
}

function formatTellCell(likelihoodRatio: number, confidence: number, suggests: AlignmentIndicator): string {
	if (suggests === 'neither' || likelihoodRatio <= 1) {
		return '—';
	}
	const alignmentLabel = suggests === 'good' ? 'Good' : 'Evil';
	return `${formatLikelihoodRatio(likelihoodRatio)} ${alignmentLabel}`;
}

function formatTellTooltip(likelihoodRatio: number, confidence: number, suggests: AlignmentIndicator): string {
	if (suggests === 'neither' || likelihoodRatio <= 1) {
		return 'No significant difference between good and evil rates';
	}
	const alignmentLabel = suggests === 'good' ? 'good' : 'evil';
	return `${formatLikelihoodRatio(likelihoodRatio)} more likely when ${alignmentLabel} (${confidence.toFixed(0)}% confidence)`;
}

function getTellCellClass(likelihoodRatio: number, confidence: number, suggests: AlignmentIndicator): string {
	if (suggests === 'neither' || likelihoodRatio <= 1) {
		return styles.tellNone;
	}
	const isStrong = confidence >= 95 && likelihoodRatio >= 1.5;
	if (suggests === 'good') {
		return isStrong ? styles.tellGoodStrong : styles.tellGoodWeak;
	}
	if (suggests === 'evil') {
		return isStrong ? styles.tellEvilStrong : styles.tellEvilWeak;
	}
	return styles.tellNone;
}

function AnnotationRow({statistic, personId}: {statistic: PersonAnnotationStatistic; personId: string}) {
	const gamesUrl = `/person/${personId}/predicate/${statistic.predicateName}/games`;

	const popGoodTooltip = `${statistic.goodBaselineFires}/${statistic.goodBaselineSample} fires`;
	const popEvilTooltip = `${statistic.evilBaselineFires}/${statistic.evilBaselineSample} fires`;
	const playerGoodTooltip =
		statistic.playerGoodOpportunities > 0
			? `${statistic.playerGoodFires}/${statistic.playerGoodOpportunities} fires`
			: 'No opportunities';
	const playerEvilTooltip =
		statistic.playerEvilOpportunities > 0
			? `${statistic.playerEvilFires}/${statistic.playerEvilOpportunities} fires`
			: 'No opportunities';
	const popTellTooltip = formatTellTooltip(
		statistic.popLikelihoodRatio,
		statistic.popConfidence,
		statistic.popSuggestsAlignment,
	);
	const playerTellTooltip = formatTellTooltip(
		statistic.playerLikelihoodRatio,
		statistic.playerConfidence,
		statistic.playerSuggestsAlignment,
	);

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
			<td
				className={getTellCellClass(
					statistic.popLikelihoodRatio,
					statistic.popConfidence,
					statistic.popSuggestsAlignment,
				)}
				title={popTellTooltip}
			>
				{formatTellCell(statistic.popLikelihoodRatio, statistic.popConfidence, statistic.popSuggestsAlignment)}
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
			<td
				className={getTellCellClass(
					statistic.playerLikelihoodRatio,
					statistic.playerConfidence,
					statistic.playerSuggestsAlignment,
				)}
				title={playerTellTooltip}
			>
				{formatTellCell(
					statistic.playerLikelihoodRatio,
					statistic.playerConfidence,
					statistic.playerSuggestsAlignment,
				)}
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
				<span className={styles.legendItem}>Hover for details</span>
				<span className={styles.legendItem}>
					<span className={styles.legendLabelGood}>2.0x Good</span> = 2x more likely when good
				</span>
				<span className={styles.legendItem}>
					<span className={styles.legendLabelEvil}>1.5x Evil</span> = 1.5x more likely when evil
				</span>
			</div>
		</div>
	);
}
