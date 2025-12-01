import type {RequestInfo} from 'rwsdk/worker';
import Achievements from '../../components/Achievements';
import {Breadcrumb} from '../../components/Breadcrumb';
import {GameSummaryContent} from '../../components/GameSummaryContent';
import {LocalTimestamp} from '../../components/LocalTimestamp';
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
		<div style={{backgroundColor: '#b2ebf2', minHeight: '100vh'}}>
			<Breadcrumb
				items={[{label: 'Home', href: '/'}, {label: 'All Games', href: '/games'}, {label: 'Game Summary'}]}
			/>

			{/* Game Summary header styled with cyan theme */}
			<div
				style={{
					backgroundColor: '#80deea',
					padding: '16px 30px',
					textAlign: 'center',
				}}
			>
				<h1 style={{margin: 0, fontSize: '1.5rem', fontWeight: 'bold'}}>Game Summary</h1>
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

			{/* Main content area */}
			<div
				style={{
					padding: '16px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<GameSummaryContent
					winner={game.outcome ? winner : null}
					reason={reason}
					assassinationInfo={
						game.outcome?.assassinated ? (
							<p style={{marginBottom: '16px'}}>
								{game.outcome.assassinated} was assassinated by{' '}
								{game.outcome.roles?.find((r) => r.assassin)?.name || 'The Assassin'}
							</p>
						) : null
					}
					missionTable={
						<MissionSummaryTable
							game={game}
							showSpoilers={false}
						/>
					}
					missionTableWithSpoilers={
						<MissionSummaryTable
							game={game}
							showSpoilers={true}
						/>
					}
					achievements={<Achievements avalon={avalonApi} />}
				/>

				{/* Link to detailed timeline */}
				<div style={{marginTop: '2rem'}}>
					<a
						href={`/game/${gameId}`}
						style={{
							color: '#1976d2',
							textDecoration: 'underline',
							fontSize: '0.875rem',
						}}
					>
						View detailed game timeline →
					</a>
				</div>
			</div>
		</div>
	);
}
