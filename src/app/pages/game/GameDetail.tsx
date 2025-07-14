import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {GameComponent} from '../../components/Game';
import type {Game} from '../../models/game';
import {getFirestoreRestService} from '../../services/firestore-rest';

export async function GameDetail({params}: RequestInfo) {
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
		<div style={{padding: '1rem'}}>
			<Breadcrumb
				items={[
					{label: 'Home', href: '/'},
					{label: 'All Games', href: '/games'},
					{label: `Game ${game.timeCreated.toLocaleDateString()} ${game.timeCreated.toLocaleTimeString()}`},
				]}
			/>
			<GameComponent game={game} />
		</div>
	);
}
