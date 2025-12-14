import type {PersonStatistics} from '../models/player-statistics';
import styles from './LossReasonStats.module.css';

interface LossReasonStatsProps {
	stats: PersonStatistics;
}

function formatPercent(count: number, total: number): string {
	if (total === 0) return '-';
	return `${((count / total) * 100).toFixed(0)}%`;
}

export function LossReasonStats({stats}: LossReasonStatsProps) {
	const totalLosses = stats.totalLosses;
	const {threeMissionFails, threeMissionSuccessEvil, fiveRejectedProposals, merlinAssassinated} = stats.lossReasons;

	if (totalLosses === 0) {
		return (
			<div className={styles.container}>
				<h3 className={styles.title}>Loss Breakdown</h3>
				<p className={styles.noData}>No losses recorded</p>
			</div>
		);
	}

	const reasons = [
		{
			label: '3 Mission Fails',
			description: 'Lost when evil team failed 3 missions',
			count: threeMissionFails,
			color: '#e53935',
		},
		{
			label: '3 Mission Successes',
			description: 'Lost as Evil when Good completed 3 successful missions',
			count: threeMissionSuccessEvil,
			color: '#8e24aa',
		},
		{
			label: '5 Rejected Proposals',
			description: 'Lost when 5 proposals were rejected in a row',
			count: fiveRejectedProposals,
			color: '#fb8c00',
		},
		{
			label: 'Merlin Assassinated',
			description: 'Good team lost when Merlin was correctly identified',
			count: merlinAssassinated,
			color: '#1e88e5',
		},
	];

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>Loss Breakdown</h3>
			<p className={styles.subtitle}>Total losses: {totalLosses}</p>

			<div className={styles.reasonsList}>
				{reasons.map((reason) => (
					<div
						key={reason.label}
						className={styles.reasonItem}
					>
						<div className={styles.reasonHeader}>
							<span className={styles.reasonLabel}>{reason.label}</span>
							<span className={styles.reasonCount}>
								{reason.count} ({formatPercent(reason.count, totalLosses)})
							</span>
						</div>
						<div className={styles.barContainer}>
							<div
								className={styles.bar}
								style={{
									width: `${totalLosses > 0 ? (reason.count / totalLosses) * 100 : 0}%`,
									backgroundColor: reason.color,
								}}
							/>
						</div>
						<p className={styles.reasonDescription}>{reason.description}</p>
					</div>
				))}
			</div>
		</div>
	);
}
