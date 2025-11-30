import type {RequestInfo} from 'rwsdk/worker';
import Achievements from '../../components/Achievements';
import {Breadcrumb} from '../../components/Breadcrumb';
import {GameConclusionComponent} from '../../components/GameConclusion';
import {MissionSummaryTable} from '../../components/MissionSummaryTable';
import type {AvalonApi} from '../../components/types';
import type {Game} from '../../models/game';
import {getFirestoreRestService} from '../../services/firestore-rest';

const ROLE_MAP: Record<string, {name: string; team: 'good' | 'evil'; description: string}> = {
	MERLIN: {name: 'MERLIN', team: 'good', description: 'Sees evil'},
	PERCIVAL: {name: 'PERCIVAL', team: 'good', description: 'Sees Merlin'},
	'LOYAL FOLLOWER': {name: 'LOYAL FOLLOWER', team: 'good', description: 'Loyal servant'},
	MORGANA: {name: 'MORGANA', team: 'evil', description: 'Appears as Merlin'},
	ASSASSIN: {name: 'ASSASSIN', team: 'evil', description: 'Can assassinate Merlin'},
	MORDRED: {name: 'MORDRED', team: 'evil', description: 'Hidden from Merlin'},
	OBERON: {name: 'OBERON', team: 'evil', description: 'Unknown to evil'},
	'EVIL MINION': {name: 'EVIL MINION', team: 'evil', description: 'Evil servant'},
};

function buildAvalonApi(game: Game): AvalonApi {
	const gameWithStringPlayers = {
		...game,
		players: game.players.map((p) => p.name),
	};

	return {
		game: gameWithStringPlayers as any,
		user: {name: ''},
		lobby: {game: gameWithStringPlayers as any},
		config: {roleMap: ROLE_MAP},
	};
}

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

	const avalonApi = buildAvalonApi(game);

	const getWinner = (): 'GOOD' | 'EVIL' | null => {
		if (game.outcome?.winner) return game.outcome.winner as 'GOOD' | 'EVIL';
		if (game.outcome?.state === 'GOOD_WIN') return 'GOOD';
		if (game.outcome?.state === 'EVIL_WIN') return 'EVIL';
		return null;
	};

	const winner = getWinner();
	const reason = game.outcome?.message || game.outcome?.reason || '';

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

			{game.outcome && winner && (
				<GameConclusionComponent
					winner={winner}
					reason={reason}
					assassinated={game.outcome.assassinated}
					roles={game.outcome.roles}
				/>
			)}

			<div style={{marginTop: '2rem'}}>
				<h2 style={{fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem'}}>Mission Summary</h2>
				<MissionSummaryTable game={game} />
			</div>

			<Achievements avalon={avalonApi} />

			<div style={{marginTop: '2rem', textAlign: 'center'}}>
				<a
					href={`/game/${gameId}`}
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
