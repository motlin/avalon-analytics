import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {GameComponent} from '../../components/Game';
import {ThemeToggle} from '../../components/ThemeToggle';
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
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
				<div>
					<Breadcrumb
						items={[
							{label: 'Home', href: '/'},
							{label: 'All Games', href: '/games'},
							{
								label: `Game ${game.timeCreated.toLocaleDateString()} ${game.timeCreated.toLocaleTimeString()}`,
							},
						]}
					/>
				</div>
				<ThemeToggle />
			</div>
			<GameComponent game={game} />
		</div>
	);
}
