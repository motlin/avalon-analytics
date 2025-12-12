import type {PersonStatistics} from '../models/player-statistics';
import styles from './YearlyStatsTable.module.css';

interface YearlyStatsTableProps {
	stats: PersonStatistics;
}

function formatRate(value: number): string {
	return `${value.toFixed(0)}%`;
}

export function YearlyStatsTable({stats}: YearlyStatsTableProps) {
	const {yearlyStats} = stats;

	if (yearlyStats.length <= 1) {
		return null;
	}

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>Statistics by Year</h3>

			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th className={styles.headerYear}>Year</th>
							<th className={styles.headerNum}>Games</th>
							<th className={styles.headerNum}>Wins</th>
							<th className={styles.headerNum}>Win Rate</th>
							<th className={styles.headerNum}>Good</th>
							<th className={styles.headerNum}>Good Win</th>
							<th className={styles.headerNum}>Evil</th>
							<th className={styles.headerNum}>Evil Win</th>
						</tr>
					</thead>
					<tbody>
						{yearlyStats.map((year) => (
							<tr
								key={year.year}
								className={styles.dataRow}
							>
								<td className={styles.yearCell}>{year.year}</td>
								<td className={styles.numCell}>{year.games}</td>
								<td className={styles.numCell}>{year.wins}</td>
								<td className={styles.numCell}>{formatRate(year.winRate)}</td>
								<td className={styles.numCell}>{year.goodGames}</td>
								<td className={styles.numCellGood}>{formatRate(year.goodWinRate)}</td>
								<td className={styles.numCell}>{year.evilGames}</td>
								<td className={styles.numCellEvil}>{formatRate(year.evilWinRate)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
