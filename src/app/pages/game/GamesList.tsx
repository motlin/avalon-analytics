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
								<li
									key={game.id}
									style={{marginBottom: '0.75rem'}}
								>
									<div>
										<span>
											{date} {time} - {playerCount} players - {winner}
										</span>
										<div style={{marginTop: '0.25rem', fontSize: '0.875rem'}}>
											<a
												href={`/game/${game.id}`}
												style={{marginRight: '1rem', color: '#3b82f6'}}
											>
												View Timeline
											</a>
											<a
												href={`/game/${game.id}/summary`}
												style={{color: '#3b82f6'}}
											>
												View Summary
											</a>
										</div>
									</div>
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
