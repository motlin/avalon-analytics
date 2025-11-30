import {faTrophy} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import type {RequestInfo} from 'rwsdk/worker';
import GameAnalysis from '../../avalon-analysis';
import {Breadcrumb} from '../../components/Breadcrumb';
import {GameConclusionComponent} from '../../components/GameConclusion';
import {MissionSummaryTable} from '../../components/MissionSummaryTable';
import type {Game} from '../../models/game';
import {getFirestoreRestService} from '../../services/firestore-rest';

const ROLE_MAP: Record<string, {team: 'good' | 'evil'}> = {
	MERLIN: {team: 'good'},
	PERCIVAL: {team: 'good'},
	'LOYAL FOLLOWER': {team: 'good'},
	MORGANA: {team: 'evil'},
	ASSASSIN: {team: 'evil'},
	MORDRED: {team: 'evil'},
	OBERON: {team: 'evil'},
	'EVIL MINION': {team: 'evil'},
};

function getBadges(game: Game): Array<{title: string; body: string}> {
	if (!game.outcome?.state || game.outcome.state === 'CANCELED' || !game.outcome.roles) {
		return [];
	}

	const gameForAnalysis = {
		players: game.players.map((p) => p.name),
		missions: game.missions,
		outcome: game.outcome,
	};

	try {
		const gameAnalysis = new GameAnalysis(gameForAnalysis as any, ROLE_MAP);
		return gameAnalysis.getBadges();
	} catch {
		return [];
	}
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

	const badges = getBadges(game);

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

			{badges.length > 0 && (
				<div style={{marginTop: '2rem'}}>
					<h2 style={{fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem'}}>Achievements</h2>
					<div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
						{badges.map((badge) => (
							<div
								key={badge.title}
								style={{
									border: '1px solid #ffc107',
									borderRadius: '8px',
									padding: '1rem',
									backgroundColor: '#fffbeb',
									minWidth: '200px',
									maxWidth: '300px',
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '0.5rem',
										marginBottom: '0.5rem',
									}}
								>
									<FontAwesomeIcon
										icon={faTrophy}
										style={{color: '#ffc107', fontSize: '1.25rem'}}
									/>
									<strong style={{fontSize: '1rem'}}>{badge.title}</strong>
								</div>
								<p style={{margin: 0, color: '#666', fontSize: '0.875rem'}}>{badge.body}</p>
							</div>
						))}
					</div>
				</div>
			)}

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
