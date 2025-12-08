import {env} from 'cloudflare:workers';
import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {Pagination} from '../../components/Pagination';
import {type Game, GameSchema} from '../../models/game';
import {db, setupDb} from '@/db';
import styles from './GamesList.module.css';

function formatGameDate(date: Date): {dateString: string; timeString: string} {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const dateString = `${year}-${month}-${day}`;

	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const timeString = `${hours}:${minutes}`;

	return {dateString, timeString};
}

export async function GamesList({request}: RequestInfo) {
	let games: Game[] = [];
	let error: string | null = null;
	let totalGames = 0;

	const url = new URL(request.url);
	const pageParam = url.searchParams.get('page');
	const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
	const pageSize = 20;

	try {
		await setupDb(env);
		totalGames = await db.rawGameData.count();
		const rawGames = await db.rawGameData.findMany({
			orderBy: {createdAt: 'desc'},
			skip: (currentPage - 1) * pageSize,
			take: pageSize,
		});

		for (const rawGame of rawGames) {
			const gameData = typeof rawGame.gameJson === 'string' ? JSON.parse(rawGame.gameJson) : rawGame.gameJson;
			const parsed = GameSchema.safeParse(gameData);
			if (parsed.success) {
				games.push(parsed.data);
			}
		}
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load games';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div className={styles.container}>
			<Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'All Games'}]} />
			<div className={styles.header}>
				<h1>All Games</h1>
			</div>
			<div className={styles.content}>
				{games.length === 0 ? (
					<p className={styles.noGames}>No games found</p>
				) : (
					<>
						<div className={styles.gameList}>
							{games.map((game) => {
								const playerNames = game.players.map((p) => p.name).join(', ');
								const playerCount = game.players.length;
								const {dateString, timeString} = formatGameDate(game.timeCreated);

								return (
									<a
										key={game.id}
										href={`/game/${game.id}`}
										className={styles.gameCard}
									>
										<div className={styles.gameCardHeader}>
											<span className={styles.dateText}>{dateString}</span>
											<span className={styles.timeText}>{timeString}</span>
										</div>
										<div className={styles.gameCardContent}>
											<div className={styles.playerInfo}>
												{playerCount} players: {playerNames}
											</div>
										</div>
									</a>
								);
							})}
						</div>
						<div className={styles.pagination}>
							<Pagination
								currentPage={currentPage}
								totalPages={Math.ceil(totalGames / pageSize)}
								baseUrl="/games"
								hasNext={currentPage * pageSize < totalGames}
								hasPrevious={currentPage > 1}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
