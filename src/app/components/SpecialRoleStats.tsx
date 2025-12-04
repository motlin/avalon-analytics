import type {PlayerStatistics} from '../models/player-statistics';
import styles from './SpecialRoleStats.module.css';

interface SpecialRoleStatsProps {
	stats: PlayerStatistics;
}

function formatRate(numerator: number, denominator: number): string {
	if (denominator === 0) return '-';
	return `${((numerator / denominator) * 100).toFixed(0)}%`;
}

export function SpecialRoleStats({stats}: SpecialRoleStatsProps) {
	const {merlinStats, assassinStats} = stats;

	const showMerlin = merlinStats.gamesPlayed > 0;
	const showAssassin = assassinStats.gamesPlayed > 0;

	if (!showMerlin && !showAssassin) {
		return null;
	}

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>Special Role Statistics</h3>

			<div className={styles.cardsContainer}>
				{showMerlin && (
					<div className={styles.card}>
						<h4 className={styles.cardTitle}>
							<span className={styles.merlinIcon}>Merlin</span>
						</h4>
						<div className={styles.statGrid}>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Games Played</span>
								<span className={styles.statValue}>{merlinStats.gamesPlayed}</span>
							</div>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Wins</span>
								<span className={styles.statValue}>{merlinStats.wins}</span>
							</div>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Win Rate</span>
								<span className={styles.statValueHighlight}>
									{formatRate(merlinStats.wins, merlinStats.gamesPlayed)}
								</span>
							</div>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Times Assassinated</span>
								<span className={styles.statValueDanger}>{merlinStats.timesAssassinated}</span>
							</div>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Survived Assassination</span>
								<span className={styles.statValueSuccess}>{merlinStats.survivedAssassination}</span>
							</div>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Assassination Rate</span>
								<span className={styles.statValue}>
									{formatRate(merlinStats.timesAssassinated, merlinStats.gamesPlayed)}
								</span>
							</div>
						</div>
					</div>
				)}

				{showAssassin && (
					<div className={styles.card}>
						<h4 className={styles.cardTitle}>
							<span className={styles.assassinIcon}>Assassin</span>
						</h4>
						<div className={styles.statGrid}>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Games Played</span>
								<span className={styles.statValue}>{assassinStats.gamesPlayed}</span>
							</div>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Wins</span>
								<span className={styles.statValue}>{assassinStats.wins}</span>
							</div>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Win Rate</span>
								<span className={styles.statValueHighlight}>
									{formatRate(assassinStats.wins, assassinStats.gamesPlayed)}
								</span>
							</div>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Successful Assassinations</span>
								<span className={styles.statValueSuccess}>
									{assassinStats.successfulAssassinations}
								</span>
							</div>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Failed Assassinations</span>
								<span className={styles.statValueDanger}>{assassinStats.failedAssassinations}</span>
							</div>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Assassination Accuracy</span>
								<span className={styles.statValue}>
									{formatRate(
										assassinStats.successfulAssassinations,
										assassinStats.successfulAssassinations + assassinStats.failedAssassinations,
									)}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
