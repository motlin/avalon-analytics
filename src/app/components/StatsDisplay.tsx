import React from 'react';
import styles from './StatsDisplay.module.css';

interface Stats {
	games?: number;
	good?: number;
	wins?: number;
	good_wins?: number;
	playtimeSeconds?: number;
}

interface GlobalStats {
	games: number;
	good_wins: number;
}

interface StatsDisplayProps {
	stats: Stats;
	globalStats?: GlobalStats;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({stats, globalStats}) => {
	const games = stats.games || 0;
	const good = stats.good || 0;
	const evil = games - good;
	const wins = stats.wins || 0;
	const goodWins = stats.good_wins || 0;
	const evilWins = wins - goodWins;

	const winRate = games ? `${((100 * wins) / games).toFixed(0)}%` : 'N/A';

	const goodWinRate = good ? `${((100 * goodWins) / good).toFixed(0)}%` : 'N/A';

	const evilWinRate = evil ? `${((100 * evilWins) / evil).toFixed(0)}%` : 'N/A';

	const globalGoodWinRate = globalStats ? `${((100 * globalStats.good_wins) / globalStats.games).toFixed(0)}%` : '';

	const globalEvilWinRate = globalStats
		? `${((100 * (globalStats.games - globalStats.good_wins)) / globalStats.games).toFixed(0)}%`
		: '';

	const playtime = (() => {
		const playtimeSeconds = stats.playtimeSeconds || 0;
		const hours = playtimeSeconds / 60 / 60;
		if (hours > 1) {
			return `${hours.toFixed(1)} hours`;
		} else if (playtimeSeconds > 60) {
			return `${(playtimeSeconds / 60).toFixed(0)} minutes`;
		} else {
			return 'Not enough';
		}
	})();

	return (
		<div className={styles.container}>
			<table className={styles.table}>
				<thead>
					<tr className={`${styles.statsHeader} ${styles.fontWeightMedium}`}>
						<td></td>
						<td>Good</td>
						<td>Evil</td>
						<td>Total</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className={styles.fontWeightMedium}>Games</td>
						<td>{good}</td>
						<td>{evil}</td>
						<td>{games}</td>
					</tr>
					<tr>
						<td className={styles.fontWeightMedium}>Wins</td>
						<td>{goodWins}</td>
						<td>{evilWins}</td>
						<td>{wins}</td>
					</tr>
					<tr>
						<td className={styles.fontWeightMedium}>Losses</td>
						<td>{good - goodWins}</td>
						<td>{evil - evilWins}</td>
						<td>{games - wins}</td>
					</tr>
					<tr>
						<td className={styles.fontWeightMedium}>Win Rate</td>
						<td>{goodWinRate}</td>
						<td>{evilWinRate}</td>
						<td>{winRate}</td>
					</tr>
					{globalStats && (
						<tr>
							<td className={styles.fontWeightMedium}>All Users</td>
							<td>{globalGoodWinRate}</td>
							<td>{globalEvilWinRate}</td>
							<td></td>
						</tr>
					)}
				</tbody>
			</table>
			<div className={styles.playtime}>Total Playtime: {playtime}</div>
		</div>
	);
};

export default StatsDisplay;
