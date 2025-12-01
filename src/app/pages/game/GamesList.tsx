import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {Pagination} from '../../components/Pagination';
import type {Game} from '../../models/game';
import {getFirestoreRestService} from '../../services/firestore-rest';
import {gameIngestionService} from '../../services/game-ingestion';
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
	let nextPageToken: string | undefined;

	const url = new URL(request.url);
	const pageTokenParam = url.searchParams.get('pageToken');
	const pageParam = url.searchParams.get('page');
	const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
	const pageSize = 20;

	try {
		const firestoreRestService = getFirestoreRestService();
		const result = await firestoreRestService.getGameLogs(pageSize, pageTokenParam || undefined);
		games = result.games;
		nextPageToken = result.nextPageToken;

		await gameIngestionService.ingestGamesIfNeeded(games);
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
										href={`/game/${game.id}/summary`}
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
								totalPages={0}
								baseUrl="/games"
								hasNext={!!nextPageToken}
								hasPrevious={currentPage > 1}
								nextPageToken={nextPageToken}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
