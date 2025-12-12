import type {PersonStatistics, RoleName} from '../models/player-statistics';
import {ROLE_INFO} from '../models/player-statistics';
import styles from './RoleStatsTable.module.css';

interface RoleStatsTableProps {
	stats: PersonStatistics;
}

function formatRate(value: number): string {
	return `${value.toFixed(0)}%`;
}

export function RoleStatsTable({stats}: RoleStatsTableProps) {
	const goodRoles: RoleName[] = ['MERLIN', 'PERCIVAL', 'LOYAL FOLLOWER'];
	const evilRoles: RoleName[] = ['MORDRED', 'MORGANA', 'OBERON', 'EVIL MINION', 'ASSASSIN'];

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>Statistics by Role</h3>

			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th className={styles.headerRole}>Role</th>
							<th className={styles.headerNum}>Games</th>
							<th className={styles.headerNum}>Wins</th>
							<th className={styles.headerNum}>Losses</th>
							<th className={styles.headerNum}>Win Rate</th>
						</tr>
					</thead>
					<tbody>
						{/* Good roles section */}
						<tr className={styles.sectionHeader}>
							<td
								colSpan={5}
								className={styles.sectionGood}
							>
								Good Team
							</td>
						</tr>
						{goodRoles.map((role) => {
							const roleStats = stats.roleStats[role];
							if (roleStats.games === 0) return null;
							return (
								<tr
									key={role}
									className={styles.dataRow}
								>
									<td className={styles.roleCell}>{ROLE_INFO[role].displayName}</td>
									<td className={styles.numCell}>{roleStats.games}</td>
									<td className={styles.numCell}>{roleStats.wins}</td>
									<td className={styles.numCell}>{roleStats.losses}</td>
									<td className={styles.numCell}>{formatRate(roleStats.winRate)}</td>
								</tr>
							);
						})}
						<tr className={styles.subtotalRow}>
							<td className={styles.roleCell}>All Good</td>
							<td className={styles.numCell}>{stats.goodGames}</td>
							<td className={styles.numCell}>{stats.goodWins}</td>
							<td className={styles.numCell}>{stats.goodLosses}</td>
							<td className={styles.numCell}>{formatRate(stats.goodWinRate)}</td>
						</tr>

						{/* Evil roles section */}
						<tr className={styles.sectionHeader}>
							<td
								colSpan={5}
								className={styles.sectionEvil}
							>
								Evil Team
							</td>
						</tr>
						{evilRoles.map((role) => {
							const roleStats = stats.roleStats[role];
							if (roleStats.games === 0) return null;
							return (
								<tr
									key={role}
									className={styles.dataRow}
								>
									<td className={styles.roleCell}>{ROLE_INFO[role].displayName}</td>
									<td className={styles.numCell}>{roleStats.games}</td>
									<td className={styles.numCell}>{roleStats.wins}</td>
									<td className={styles.numCell}>{roleStats.losses}</td>
									<td className={styles.numCell}>{formatRate(roleStats.winRate)}</td>
								</tr>
							);
						})}
						<tr className={styles.subtotalRow}>
							<td className={styles.roleCell}>All Evil</td>
							<td className={styles.numCell}>{stats.evilGames}</td>
							<td className={styles.numCell}>{stats.evilWins}</td>
							<td className={styles.numCell}>{stats.evilLosses}</td>
							<td className={styles.numCell}>{formatRate(stats.evilWinRate)}</td>
						</tr>

						{/* Total row */}
						<tr className={styles.totalRow}>
							<td className={styles.roleCell}>Total</td>
							<td className={styles.numCell}>{stats.totalGames}</td>
							<td className={styles.numCell}>{stats.totalWins}</td>
							<td className={styles.numCell}>{stats.totalLosses}</td>
							<td className={styles.numCell}>{formatRate(stats.overallWinRate)}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
