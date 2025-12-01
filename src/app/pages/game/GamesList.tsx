import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {LocalTimestamp} from '../../components/LocalTimestamp';
import {Pagination} from '../../components/Pagination';
import type {Game} from '../../models/game';
import {getFirestoreRestService} from '../../services/firestore-rest';
import {gameIngestionService} from '../../services/game-ingestion';
import styles from './GamesList.module.css';

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

								return (
									<div
										key={game.id}
										className={styles.gameCard}
									>
										<div className={styles.gameCardHeader}>
											<LocalTimestamp isoString={game.timeCreated.toISOString()} />
										</div>
										<div className={styles.gameCardContent}>
											<div className={styles.playerInfo}>
												{playerCount} players: {playerNames}
											</div>
											<div className={styles.gameLinks}>
												<a href={`/game/${game.id}/summary`}>View Summary</a>
											</div>
										</div>
									</div>
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
