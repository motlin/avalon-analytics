import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import type {Game} from '../../models/game';
import {getFirestoreRestService} from '../../services/firestore-rest';

export async function UidDetail({params}: RequestInfo) {
	const uid = params.uid;
	let games: Game[] = [];
	let error: string | null = null;

	try {
		const firestoreRestService = getFirestoreRestService();
		games = await firestoreRestService.getGamesByPlayerUid(uid);
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load games for player';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const playerName = games.length > 0 ? games[0].players.find((p) => p.uid === uid)?.name : null;

	return (
		<div style={{padding: '1rem'}}>
			<Breadcrumb
				items={[
					{label: 'Home', href: '/'},
					{label: 'All Games', href: '/games'},
					{label: `Player ${playerName || uid}`},
				]}
			/>
			<h1>Games for Player {playerName || uid}</h1>
			<p>UID: {uid}</p>
			<p>Total games: {games.length}</p>

			{games.length === 0 ? (
				<p>No games found for this player.</p>
			) : (
				<div style={{marginTop: '1rem'}}>
					{games.map((game) => (
						<div
							key={game.id}
							style={{
								border: '1px solid #ccc',
								padding: '1rem',
								marginBottom: '1rem',
								backgroundColor: '#f9f9f9',
							}}
						>
							<h3>
								<a
									href={`/game/${game.id}`}
									style={{textDecoration: 'none', color: '#0066cc'}}
								>
									Game {game.timeCreated.toLocaleDateString()} {game.timeCreated.toLocaleTimeString()}
								</a>
							</h3>
							<p>Players: {game.players.map((p) => p.name).join(', ')}</p>
							{game.outcome && (
								<p>
									Outcome: {game.outcome.winner} wins - {game.outcome.reason}
								</p>
							)}
							{game.timeFinished && <p>Finished: {game.timeFinished.toLocaleString()}</p>}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
