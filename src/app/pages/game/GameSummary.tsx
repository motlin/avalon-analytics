import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {MissionSummaryTable} from '../../components/MissionSummaryTable';
import {PlayerRosterComponent} from '../../components/PlayerRoster';
import type {Game} from '../../models/game';
import {getFirestoreRestService} from '../../services/firestore-rest';

export async function GameSummary({params}: RequestInfo) {
	const gameId = params.gameId;
	let game: Game | null = null;
	let error: string | null = null;

	try {
		const firestoreRestService = getFirestoreRestService();
		game = await firestoreRestService.getGameLogById(gameId);
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load game';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!game) {
		return <div>Game not found</div>;
	}

	return (
		<div style={{padding: '1rem', maxWidth: '1200px', margin: '0 auto'}}>
			<Breadcrumb
				items={[
					{label: 'Home', href: '/'},
					{label: 'All Games', href: '/games'},
					{
						label: `Game Summary ${game.timeCreated.toLocaleDateString()} ${game.timeCreated.toLocaleTimeString()}`,
					},
				]}
			/>

			<div style={{marginTop: '2rem', marginBottom: '2rem'}}>
				<h1 style={{fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem'}}>Game Summary</h1>
				<div style={{color: '#6b7280'}}>
					<p>Game ID: {game.id}</p>
					<p>Created: {game.timeCreated.toLocaleString()}</p>
					{game.timeFinished && <p>Finished: {game.timeFinished.toLocaleString()}</p>}
				</div>
			</div>

			<div style={{marginBottom: '2rem'}}>
				<h2 style={{fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem'}}>Players</h2>
				<PlayerRosterComponent players={game.players} />
			</div>

			<div>
				<h2 style={{fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem'}}>Mission Summary</h2>
				<MissionSummaryTable game={game} />
			</div>

			<div style={{marginTop: '2rem', textAlign: 'center'}}>
				<a
					href={`/games/${gameId}`}
					style={{
						color: '#3b82f6',
						textDecoration: 'underline',
						fontSize: '0.875rem',
					}}
				>
					View detailed game timeline →
				</a>
			</div>
		</div>
	);
}
