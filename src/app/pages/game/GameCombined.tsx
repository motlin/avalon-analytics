import type {RequestInfo} from 'rwsdk/worker';
import Achievements from '../../components/Achievements';
import {Breadcrumb} from '../../components/Breadcrumb';
import {CombinedAnnotatedTable} from '../../components/CombinedAnnotatedTable';
import {LocalTimestamp} from '../../components/LocalTimestamp';
import type {AvalonApi} from '../../components/types';
import {type Game, GameSchema} from '../../models/game';
import {db} from '@/db';

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

export async function GameCombined({params}: RequestInfo) {
	const gameId = params.gameId;
	let game: Game | null = null;
	let error: string | null = null;

	try {
		const rawGame = await db.rawGameData.findUnique({
			where: {firebaseKey: gameId},
		});
		if (rawGame) {
			const parsed = GameSchema.safeParse(rawGame.gameJson);
			if (parsed.success) {
				game = parsed.data;
			} else {
				error = 'Failed to parse game data';
			}
		}
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
		<div style={{backgroundColor: '#b2ebf2', minHeight: '100vh'}}>
			<Breadcrumb
				items={[{label: 'Home', href: '/'}, {label: 'All Games', href: '/games'}, {label: 'Annotated Table'}]}
			/>

			<div
				style={{
					backgroundColor: '#80deea',
					padding: '16px 30px',
					textAlign: 'center',
				}}
			>
				<h1 style={{margin: 0, fontSize: '1.5rem', fontWeight: 'bold'}}>Annotated Table</h1>
				<div style={{fontSize: '0.875rem', marginTop: '8px'}}>
					<LocalTimestamp isoString={game.timeCreated.toISOString()} />
					{game.timeFinished && (
						<>
							{' '}
							—{' '}
							<LocalTimestamp
								isoString={game.timeFinished.toISOString()}
								showDate={false}
							/>
						</>
					)}
				</div>
			</div>

			<div
				style={{
					padding: '16px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				{winner && (
					<h2 style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '16px 0'}}>
						{winner === 'GOOD' ? 'Good wins!' : 'Evil wins!'}
					</h2>
				)}

				{reason && <p style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px'}}>{reason}</p>}

				{game.outcome?.assassinated && (
					<p style={{marginBottom: '16px'}}>
						{game.outcome.assassinated} was assassinated by{' '}
						{game.outcome.roles?.find((r) => r.assassin)?.name || 'The Assassin'}
					</p>
				)}

				<CombinedAnnotatedTable game={game} />

				<Achievements avalon={avalonApi} />

				<div style={{marginTop: '2rem', display: 'flex', gap: '2rem'}}>
					<a
						href={`/game/${gameId}`}
						style={{
							color: '#1976d2',
							textDecoration: 'underline',
							fontSize: '0.875rem',
						}}
					>
						← View detailed timeline
					</a>
					<a
						href={`/game/${gameId}/summary`}
						style={{
							color: '#1976d2',
							textDecoration: 'underline',
							fontSize: '0.875rem',
						}}
					>
						View summary table →
					</a>
				</div>
			</div>
		</div>
	);
}
