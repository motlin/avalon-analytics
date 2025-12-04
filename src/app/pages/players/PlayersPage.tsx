import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import type {Game} from '../../models/game';
import {isEvilRole} from '../../models/annotations';
import {getFirestoreRestService} from '../../services/firestore-rest';
import styles from './PlayersPage.module.css';

interface PlayerStats {
	uid: string;
	name: string;
	gamesPlayed: number;
	wins: number;
	goodGames: number;
	goodWins: number;
	evilGames: number;
	evilWins: number;
}

function calculatePlayerStats(games: Game[]): PlayerStats[] {
	const statsMap = new Map<string, PlayerStats>();

	for (const game of games) {
		if (!game.outcome) continue;

		const outcome = game.outcome;
		const isGoodWin = outcome.state === 'GOOD_WIN';

		for (const player of game.players) {
			const roleData = outcome.roles?.find((r) => r.name === player.name);
			const role = roleData?.role;
			const playerIsEvil = isEvilRole(role);

			const playerWon = (playerIsEvil && !isGoodWin) || (!playerIsEvil && isGoodWin);

			let stats = statsMap.get(player.uid);
			if (!stats) {
				stats = {
					uid: player.uid,
					name: player.name,
					gamesPlayed: 0,
					wins: 0,
					goodGames: 0,
					goodWins: 0,
					evilGames: 0,
					evilWins: 0,
				};
				statsMap.set(player.uid, stats);
			}

			// Update name to most recent
			stats.name = player.name;
			stats.gamesPlayed++;

			if (playerWon) {
				stats.wins++;
			}

			if (playerIsEvil) {
				stats.evilGames++;
				if (playerWon) {
					stats.evilWins++;
				}
			} else {
				stats.goodGames++;
				if (playerWon) {
					stats.goodWins++;
				}
			}
		}
	}

	return Array.from(statsMap.values()).sort((a, b) => b.gamesPlayed - a.gamesPlayed);
}

function formatWinRate(wins: number, games: number): string {
	if (games === 0) return '-';
	const rate = (wins / games) * 100;
	return `${rate.toFixed(0)}%`;
}

export async function PlayersPage({}: RequestInfo) {
	let allGames: Game[] = [];
	let error: string | null = null;

	try {
		const firestoreRestService = getFirestoreRestService();
		let pageToken: string | undefined;
		const pageSize = 100;

		// Fetch all games by paginating through
		do {
			const result = await firestoreRestService.getGameLogs(pageSize, pageToken);
			allGames = allGames.concat(result.games);
			pageToken = result.nextPageToken;
		} while (pageToken);
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load games';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const playerStats = calculatePlayerStats(allGames);

	return (
		<div className={styles.container}>
			<Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'Players'}]} />
			<div className={styles.header}>
				<h1>Players</h1>
				<p className={styles.subtitle}>
					{playerStats.length} players across {allGames.length} games
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
									<tr key={player.uid}>
										<td className={styles.nameColumn}>
											<a
												href={`/uid/${player.uid}`}
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
			</div>
		</div>
	);
}
