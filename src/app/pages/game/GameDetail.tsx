import {env} from 'cloudflare:workers';
import type {RequestInfo} from 'rwsdk/worker';
import {AnnotatedGameTimelineComponent} from '../../components/AnnotatedGameTimeline';
import {Breadcrumb} from '../../components/Breadcrumb';
import {LocalTimestamp} from '../../components/LocalTimestamp';
import {type Game, GameSchema} from '../../models/game';
import {db, setupDb} from '@/db';

export async function GameDetail({params, request}: RequestInfo) {
	const gameId = params.gameId;
	const url = new URL(request.url);
	const showSecrets = url.searchParams.get('showSecrets') === 'true';
	let game: Game | null = null;
	let error: string | null = null;

	try {
		await setupDb(env);
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

	return (
		<div style={{padding: '1rem'}}>
			<Breadcrumb
				items={[{label: 'Home', href: '/'}, {label: 'All Games', href: '/games'}, {label: 'Game Timeline'}]}
			/>
			<div style={{marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280'}}>
				<LocalTimestamp isoString={game.timeCreated.toISOString()} />
			</div>
			<div style={{marginBottom: '1rem', textAlign: 'right'}}>
				<a
					href={`/game/${gameId}/summary`}
					style={{
						color: '#3b82f6',
						textDecoration: 'underline',
						fontSize: '0.875rem',
					}}
				>
					View summary table →
				</a>
			</div>
			<AnnotatedGameTimelineComponent
				game={game}
				showSecrets={showSecrets}
			/>
		</div>
	);
}
