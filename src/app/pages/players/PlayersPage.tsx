import {env} from 'cloudflare:workers';
import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {db, setupDb} from '@/db';
import styles from './PlayersPage.module.css';

interface PlayerStatsRow {
	playerId: string;
	name: string;
	isMapped: boolean;
	gamesPlayed: number;
	wins: number;
	goodGames: number;
	goodWins: number;
	evilGames: number;
	evilWins: number;
}

const PLAYERS_PER_PAGE = 100;

function formatWinRate(wins: number, games: number): string {
	if (games === 0) return '-';
	const rate = (wins / games) * 100;
	return `${rate.toFixed(0)}%`;
}

export async function PlayersPage({request}: RequestInfo) {
	const url = new URL(request.url);
	const pageParam = url.searchParams.get('page');
	const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);

	let playerStats: PlayerStatsRow[] = [];
	let totalPlayers = 0;
	let totalGames = 0;
	let error: string | null = null;

	try {
		await setupDb(env);

		// Get counts first (these are fast aggregate queries)
		const [statsCount, gamesCount] = await Promise.all([db.playerStats.count(), db.rawGameData.count()]);
		totalPlayers = statsCount;
		totalGames = gamesCount;

		// Fetch paginated stats from PlayerStats table
		const skip = (currentPage - 1) * PLAYERS_PER_PAGE;
		const stats = await db.playerStats.findMany({
			orderBy: {gamesPlayed: 'desc'},
			skip,
			take: PLAYERS_PER_PAGE,
		});

		playerStats = stats.map((s) => ({
			playerId: s.playerId,
			name: s.name,
			isMapped: s.isMapped,
			gamesPlayed: s.gamesPlayed,
			wins: s.wins,
			goodGames: s.goodGames,
			goodWins: s.goodWins,
			evilGames: s.evilGames,
			evilWins: s.evilWins,
		}));
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load player stats';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const totalPages = Math.ceil(totalPlayers / PLAYERS_PER_PAGE);
	const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;

	return (
		<div className={styles.container}>
			<Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'Players'}]} />
			<div className={styles.header}>
				<h1>Players</h1>
				<p className={styles.subtitle}>
					Showing {startIndex + 1}-{Math.min(startIndex + playerStats.length, totalPlayers)} of {totalPlayers}{' '}
					players across {totalGames} games
				</p>
			</div>
			<div className={styles.content}>
				{playerStats.length === 0 ? (
					<p className={styles.noPlayers}>No players found</p>
				) : (
					<div className={styles.tableWrapper}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th className={styles.nameColumn}>Player</th>
									<th className={styles.numberColumn}>Games</th>
									<th className={styles.numberColumn}>Wins</th>
									<th className={styles.numberColumn}>Win %</th>
									<th className={styles.numberColumn}>Good</th>
									<th className={styles.numberColumn}>Good %</th>
									<th className={styles.numberColumn}>Evil</th>
									<th className={styles.numberColumn}>Evil %</th>
								</tr>
							</thead>
							<tbody>
								{playerStats.map((player) => (
									<tr key={player.playerId}>
										<td className={styles.nameColumn}>
											<a
												href={`/players/${player.playerId}`}
												className={styles.playerLink}
											>
												{player.name}
											</a>
										</td>
										<td className={styles.numberColumn}>{player.gamesPlayed}</td>
										<td className={styles.numberColumn}>{player.wins}</td>
										<td className={styles.numberColumn}>
											{formatWinRate(player.wins, player.gamesPlayed)}
										</td>
										<td className={styles.numberColumn}>
											{player.goodWins}/{player.goodGames}
										</td>
										<td className={styles.numberColumn}>
											{formatWinRate(player.goodWins, player.goodGames)}
										</td>
										<td className={styles.numberColumn}>
											{player.evilWins}/{player.evilGames}
										</td>
										<td className={styles.numberColumn}>
											{formatWinRate(player.evilWins, player.evilGames)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{/* Pagination Controls */}
				{totalPages > 1 && (
					<div className={styles.pagination}>
						{currentPage > 1 && (
							<a
								href={`/players?page=${currentPage - 1}`}
								className={styles.pageLink}
							>
								← Previous
							</a>
						)}
						{Array.from({length: totalPages}, (_, i) => i + 1)
							.filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
							.map((page, index, filtered) => {
								const showEllipsis = index > 0 && page - filtered[index - 1] > 1;
								return (
									<span key={page}>
										{showEllipsis && <span className={styles.ellipsis}>…</span>}
										<a
											href={`/players?page=${page}`}
											className={`${styles.pageLink} ${page === currentPage ? styles.currentPage : ''}`}
										>
											{page}
										</a>
									</span>
								);
							})}
						{currentPage < totalPages && (
							<a
								href={`/players?page=${currentPage + 1}`}
								className={styles.pageLink}
							>
								Next →
							</a>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
