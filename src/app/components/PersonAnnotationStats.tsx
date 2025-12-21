import type {
	AlignmentIndicator,
	PersonAnnotationProfile,
	PersonAnnotationStatistic,
	RoleStatistic,
} from '../models/annotationStatistics';
import {toDisplayRole} from '../models/annotations';
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
	const gamesUrl = `/games?person=${personId}&behavior=${statistic.predicateName}`;

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
					href={gamesUrl}
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

function formatDeviation(playerRate: number | null, populationRate: number): string {
	if (playerRate === null) {
		return '—';
	}
	const diff = (playerRate - populationRate) * 100;
	if (Math.abs(diff) < 0.5) {
		return '±0%';
	}
	const sign = diff > 0 ? '+' : '';
	return `${sign}${diff.toFixed(0)}%`;
}

function getDeviationClass(playerRate: number | null, populationRate: number): string {
	if (playerRate === null) {
		return styles.deviationNone;
	}
	const diff = playerRate - populationRate;
	if (Math.abs(diff) < 0.02) {
		return styles.deviationNone;
	}
	return diff > 0 ? styles.deviationAbove : styles.deviationBelow;
}

function AlignmentRestrictedRow({
	statistic,
	personId,
	alignment,
}: {
	statistic: PersonAnnotationStatistic;
	personId: string;
	alignment: 'good' | 'evil';
}) {
	const gamesUrl = `/games?person=${personId}&behavior=${statistic.predicateName}`;

	const isGood = alignment === 'good';
	const popRate = isGood ? statistic.goodBaselineRate : statistic.evilBaselineRate;
	const popFires = isGood ? statistic.goodBaselineFires : statistic.evilBaselineFires;
	const popSample = isGood ? statistic.goodBaselineSample : statistic.evilBaselineSample;
	const playerRate = isGood ? statistic.playerGoodRate : statistic.playerEvilRate;
	const playerFires = isGood ? statistic.playerGoodFires : statistic.playerEvilFires;
	const playerOpportunities = isGood ? statistic.playerGoodOpportunities : statistic.playerEvilOpportunities;

	const popTooltip = `${popFires}/${popSample} fires`;
	const playerTooltip = playerOpportunities > 0 ? `${playerFires}/${playerOpportunities} fires` : 'No opportunities';
	const linkClass = isGood ? styles.rateLinkGood : styles.rateLinkEvil;

	return (
		<tr className={styles.dataRow}>
			<td className={styles.behaviorCell}>
				<span
					className={styles.rarityDot}
					style={{backgroundColor: RARITY_CSS_COLORS[statistic.rarity]}}
				/>
				<a
					href={gamesUrl}
					className={styles.predicateLink}
				>
					{formatPredicateName(statistic.predicateName)}
				</a>
			</td>
			<td
				className={styles.rateCell}
				title={popTooltip}
			>
				{formatPercent(popRate)}
			</td>
			<td
				className={styles.rateCell}
				title={playerTooltip}
			>
				<a
					href={gamesUrl}
					className={linkClass}
				>
					{formatPercent(playerRate)}
				</a>
			</td>
			<td
				className={getDeviationClass(playerRate, popRate)}
				title={`Player rate vs population: ${formatPercent(playerRate)} vs ${formatPercent(popRate)}`}
			>
				{formatDeviation(playerRate, popRate)}
			</td>
		</tr>
	);
}

function RoleRestrictedRow({
	statistic,
	roleStat,
	personId,
}: {
	statistic: PersonAnnotationStatistic;
	roleStat: RoleStatistic | undefined;
	personId: string;
}) {
	const gamesUrl = `/games?person=${personId}&behavior=${statistic.predicateName}`;

	// Overall stats (all roles)
	const allPopRate = statistic.baselineRate;
	const allPlayerRate = statistic.opportunities > 0 ? statistic.rawRate : null;
	const allPopTooltip = `${statistic.goodBaselineFires + statistic.evilBaselineFires}/${statistic.goodBaselineSample + statistic.evilBaselineSample} fires`;
	const allPlayerTooltip = `${statistic.fires}/${statistic.opportunities} fires`;

	// Role-specific stats
	const rolePopRate = roleStat?.populationRate ?? 0;
	const rolePopFires = roleStat?.populationFires ?? 0;
	const rolePopSample = roleStat?.populationOpportunities ?? 0;
	const rolePlayerRate = roleStat?.playerRate ?? null;
	const rolePlayerFires = roleStat?.playerFires ?? 0;
	const rolePlayerOpportunities = roleStat?.playerOpportunities ?? 0;

	const rolePopTooltip = `${rolePopFires}/${rolePopSample} fires`;
	const rolePlayerTooltip =
		rolePlayerOpportunities > 0 ? `${rolePlayerFires}/${rolePlayerOpportunities} fires` : 'No opportunities';

	return (
		<tr className={styles.dataRow}>
			<td className={styles.behaviorCell}>
				<span
					className={styles.rarityDot}
					style={{backgroundColor: RARITY_CSS_COLORS[statistic.rarity]}}
				/>
				<a
					href={gamesUrl}
					className={styles.predicateLink}
				>
					{formatPredicateName(statistic.predicateName)}
				</a>
			</td>
			<td
				className={styles.rateCell}
				title={allPopTooltip}
			>
				{formatPercent(allPopRate)}
			</td>
			<td
				className={styles.rateCell}
				title={allPlayerTooltip}
			>
				<a
					href={gamesUrl}
					className={styles.rateLinkGood}
				>
					{formatPercent(allPlayerRate)}
				</a>
			</td>
			<td
				className={styles.rateCell}
				title={rolePopTooltip}
			>
				{formatPercent(rolePopRate)}
			</td>
			<td
				className={styles.rateCell}
				title={rolePlayerTooltip}
			>
				<a
					href={gamesUrl}
					className={styles.rateLinkGood}
				>
					{formatPercent(rolePlayerRate)}
				</a>
			</td>
			<td
				className={getDeviationClass(rolePlayerRate, rolePopRate)}
				title={`Player rate vs population: ${formatPercent(rolePlayerRate)} vs ${formatPercent(rolePopRate)}`}
			>
				{formatDeviation(rolePlayerRate, rolePopRate)}
			</td>
		</tr>
	);
}

/** Role constants in database format (uppercase) */
const GOOD_ROLES = ['MERLIN', 'PERCIVAL', 'LOYAL FOLLOWER'];
const EVIL_ROLES = ['ASSASSIN', 'MORGANA', 'MORDRED', 'OBERON', 'EVIL MINION'];
const ALL_ROLES = [...GOOD_ROLES, ...EVIL_ROLES];

function expandInterestingRoles(interestingRoles: PersonAnnotationStatistic['interestingRoles']): string[] {
	if (interestingRoles === 'all') return ALL_ROLES;
	if (interestingRoles === 'good') return GOOD_ROLES;
	if (interestingRoles === 'evil') return EVIL_ROLES;
	return interestingRoles;
}

export function PersonAnnotationStats({profile, personId}: PersonAnnotationStatsProps) {
	const {annotations, summary} = profile;

	// Main table shows all annotations (for alignment comparison)
	// Role sections show annotations where interestingRoles includes that role
	const roleGroups = new Map<string, PersonAnnotationStatistic[]>();
	for (const annotation of annotations) {
		const roles = expandInterestingRoles(annotation.interestingRoles);
		for (const role of roles) {
			const existing = roleGroups.get(role) ?? [];
			existing.push(annotation);
			roleGroups.set(role, existing);
		}
	}
	const sortedRoles = Array.from(roleGroups.keys()).sort();

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

			{annotations.length > 0 && (
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
			)}

			<div className={styles.legend}>
				<span className={styles.legendItem}>Hover for details</span>
				<span className={styles.legendItem}>
					<span className={styles.legendLabelGood}>2.0x Good</span> = 2x more likely when good
				</span>
				<span className={styles.legendItem}>
					<span className={styles.legendLabelEvil}>1.5x Evil</span> = 1.5x more likely when evil
				</span>
			</div>

			{sortedRoles.map((role) => {
				const roleAnnotations = roleGroups.get(role) ?? [];
				return (
					<div
						key={role}
						className={styles.roleSection}
					>
						<h4 className={styles.roleTitle}>{toDisplayRole(role)} Behaviors</h4>
						<p className={styles.alignmentRestrictedDescription}>
							Compares your rate as {toDisplayRole(role)} to other {toDisplayRole(role)} players, with
							overall rates for context.
						</p>
						<div className={styles.tableWrapper}>
							<table className={styles.table}>
								<thead>
									<tr>
										<th
											className={styles.headerBehavior}
											rowSpan={2}
										>
											Behavior
										</th>
										<th
											className={styles.headerNum}
											colSpan={2}
										>
											All Roles
										</th>
										<th
											className={styles.headerNum}
											colSpan={3}
										>
											{toDisplayRole(role)}
										</th>
									</tr>
									<tr>
										<th className={styles.headerSub}>Pop</th>
										<th className={styles.headerSub}>You</th>
										<th className={styles.headerSub}>Pop</th>
										<th className={styles.headerSub}>You</th>
										<th className={styles.headerSub}>vs Pop</th>
									</tr>
								</thead>
								<tbody>
									{roleAnnotations.map((statistic) => {
										const roleStat = statistic.roleStats.find((rs) => rs.role === role);
										return (
											<RoleRestrictedRow
												key={statistic.predicateName}
												statistic={statistic}
												roleStat={roleStat}
												personId={personId}
											/>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				);
			})}

			{sortedRoles.length > 0 && (
				<div className={styles.legend}>
					<span className={styles.legendItem}>
						<span className={styles.legendLabelAbove}>+10%</span> = above average
					</span>
					<span className={styles.legendItem}>
						<span className={styles.legendLabelBelow}>-10%</span> = below average
					</span>
				</div>
			)}
		</div>
	);
}
