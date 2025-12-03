import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {CombinedAnnotatedTable} from '../../components/CombinedAnnotatedTable';
import {LocalTimestamp} from '../../components/LocalTimestamp';
import type {Game} from '../../models/game';
import {getFirestoreRestService} from '../../services/firestore-rest';

export async function GameCombined({params}: RequestInfo) {
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
				<CombinedAnnotatedTable game={game} />

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
