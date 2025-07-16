import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {Pagination} from '../../components/Pagination';
import type {Game} from '../../models/game';
import {getFirestoreRestService} from '../../services/firestore-rest';
import {gameIngestionService} from '../../services/game-ingestion';

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
		<div>
			<Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'All Games'}]} />
			<h1>Games List</h1>
			{games.length === 0 ? (
				<p>No games found</p>
			) : (
				<>
					<ul>
						{games.map((game) => {
							const winner =
								game.outcome?.state === 'GOOD_WIN'
									? 'GOOD'
									: game.outcome?.state
										? 'EVIL'
										: 'In Progress';
							const playerCount = Object.keys(game.players).length;
							const date = game.timeCreated.toLocaleDateString();
							const time = game.timeCreated.toLocaleTimeString();

							return (
								<li key={game.id}>
									<a href={`/game/${game.id}`}>
										{date} {time} - {playerCount} players - {winner}
									</a>
								</li>
							);
						})}
					</ul>
					<Pagination
						currentPage={currentPage}
						totalPages={0}
						baseUrl="/games"
						hasNext={!!nextPageToken}
						hasPrevious={currentPage > 1}
						nextPageToken={nextPageToken}
					/>
				</>
			)}
		</div>
	);
}
