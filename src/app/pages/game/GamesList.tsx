import {env} from 'cloudflare:workers';
import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {LocalTimestamp} from '../../components/LocalTimestamp';
import {Pagination} from '../../components/Pagination';
import {type Game, GameSchema} from '../../models/game';
import {getPersonService} from '../../services/person';
import {db, setupDb} from '@/db';
import styles from './GamesList.module.css';

function formatGameDate(date: Date): {dateString: string; timeString: string} {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const dateString = `${year}-${month}-${day}`;

	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const timeString = `${hours}:${minutes}`;

	return {dateString, timeString};
}

function formatPredicateName(name: string): string {
	return name
		.replace(/ProposalVotePredicate$/, '')
		.replace(/ProposalPredicate$/, '')
		.replace(/MissionVotePredicate$/, '')
		.replace(/Predicate$/, '')
		.replace(/([a-z])([A-Z])/g, '$1 $2');
}

interface BehaviorGame {
	firebaseKey: string;
	fired: boolean;
	role: string;
	gameDate: Date;
}

export async function GamesList({request}: RequestInfo) {
	const url = new URL(request.url);
	const personId = url.searchParams.get('person');
	const behavior = url.searchParams.get('behavior');

	// If person and behavior are provided, show filtered behavior games
	if (personId && behavior) {
		return BehaviorGamesList({personId, behavior, url});
	}

	// Otherwise show all games
	let games: Game[] = [];
	let error: string | null = null;
	let totalGames = 0;

	const pageParam = url.searchParams.get('page');
	const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
	const pageSize = 20;

	try {
		await setupDb(env);
		totalGames = await db.rawGameData.count();
		const rawGames = await db.rawGameData.findMany({
			orderBy: {createdAt: 'desc'},
			skip: (currentPage - 1) * pageSize,
			take: pageSize,
		});

		for (const rawGame of rawGames) {
			const gameData = typeof rawGame.gameJson === 'string' ? JSON.parse(rawGame.gameJson) : rawGame.gameJson;
			const parsed = GameSchema.safeParse(gameData);
			if (parsed.success) {
				games.push(parsed.data);
			}
		}
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load games';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div className={styles.container}>
			<Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'All Games'}]} />
			<div className={styles.header}>
				<h1>All Games</h1>
			</div>
			<div className={styles.content}>
				{games.length === 0 ? (
					<p className={styles.noGames}>No games found</p>
				) : (
					<>
						<div className={styles.gameList}>
							{games.map((game) => {
								const playerNames = game.players.map((p) => p.name).join(', ');
								const playerCount = game.players.length;
								const {dateString, timeString} = formatGameDate(game.timeCreated);

								return (
									<a
										key={game.id}
										href={`/game/${game.id}`}
										className={styles.gameCard}
									>
										<div className={styles.gameCardHeader}>
											<span className={styles.dateText}>{dateString}</span>
											<span className={styles.timeText}>{timeString}</span>
										</div>
										<div className={styles.gameCardContent}>
											<div className={styles.playerInfo}>
												{playerCount} players: {playerNames}
											</div>
										</div>
									</a>
								);
							})}
						</div>
						<div className={styles.pagination}>
							<Pagination
								currentPage={currentPage}
								totalPages={Math.ceil(totalGames / pageSize)}
								baseUrl="/games"
								hasNext={currentPage * pageSize < totalGames}
								hasPrevious={currentPage > 1}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

async function BehaviorGamesList({personId, behavior, url}: {personId: string; behavior: string; url: URL}) {
	let error: string | null = null;
	let personName: string | null = null;
	let games: BehaviorGame[] = [];
	let totalFires = 0;
	let totalOpportunities = 0;

	const firedFilter = url.searchParams.get('fired') ?? 'true';

	try {
		await setupDb(env);

		const personService = getPersonService();
		await personService.initialize();
		const allPeople = await personService.getAllPeople();
		const person = allPeople.find((p) => p.id === personId);

		if (!person) {
			return (
				<div className={styles.container}>
					<Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'Person Not Found'}]} />
					<h1>Person Not Found</h1>
					<p>No person found with ID: {personId}</p>
				</div>
			);
		}

		personName = person.name;

		const annotationStats = await db.personAnnotationStats.findFirst({
			where: {
				personId,
				predicateName: behavior,
			},
			select: {
				fires: true,
				opportunities: true,
				gameInstances: {
					select: {
						firebaseKey: true,
						fired: true,
						role: true,
					},
				},
			},
		});

		if (!annotationStats) {
			return (
				<div className={styles.container}>
					<Breadcrumb
						items={[
							{label: 'Home', href: '/'},
							{label: personName, href: `/person/${personId}`},
							{label: formatPredicateName(behavior)},
						]}
					/>
					<h1>No Data</h1>
					<p>No annotation data found for this behavior.</p>
				</div>
			);
		}

		totalFires = annotationStats.fires;
		totalOpportunities = annotationStats.opportunities;

		const gameKeys = annotationStats.gameInstances.map((g) => g.firebaseKey);
		const rawGames = await db.rawGameData.findMany({
			where: {
				firebaseKey: {in: gameKeys},
			},
			select: {
				firebaseKey: true,
				createdAt: true,
			},
		});

		const gameDates = new Map(rawGames.map((g) => [g.firebaseKey, g.createdAt]));

		games = annotationStats.gameInstances
			.map((g) => ({
				firebaseKey: g.firebaseKey,
				fired: g.fired,
				role: g.role,
				gameDate: gameDates.get(g.firebaseKey) || new Date(0),
			}))
			.sort((a, b) => b.gameDate.getTime() - a.gameDate.getTime());
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load data';
	}

	if (error) {
		return (
			<div className={styles.container}>
				<Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'Error'}]} />
				<h1>Error</h1>
				<p>{error}</p>
			</div>
		);
	}

	const displayName = formatPredicateName(behavior);
	const firedGames = games.filter((g) => g.fired);
	const missedGames = games.filter((g) => !g.fired);

	const showFired = firedFilter === 'true' || firedFilter === 'all';
	const showMissed = firedFilter === 'false' || firedFilter === 'all';

	return (
		<div className={styles.container}>
			<Breadcrumb
				items={[
					{label: 'Home', href: '/'},
					{label: personName || 'Unknown', href: `/person/${personId}`},
					{label: displayName},
				]}
			/>

			<h1>{displayName}</h1>
			<p className={styles.subtitle}>
				Games for <strong>{personName}</strong>
			</p>

			<div className={styles.summary}>
				<span className={styles.summaryItem}>
					<strong>{totalFires}</strong> fires
				</span>
				<span className={styles.summaryItem}>
					<strong>{totalOpportunities}</strong> opportunities
				</span>
				<span className={styles.summaryItem}>{((totalFires / totalOpportunities) * 100).toFixed(1)}% rate</span>
			</div>

			{showFired && firedGames.length > 0 && (
				<section className={styles.section}>
					<h2>Games Where Behavior Occurred ({firedGames.length})</h2>
					<div className={styles.gameList}>
						{firedGames.map((game) => (
							<a
								key={game.firebaseKey}
								href={`/game/${game.firebaseKey}`}
								className={styles.gameCard}
							>
								<span className={styles.gameRole}>{game.role}</span>
								<span className={styles.gameDate}>
									<LocalTimestamp
										isoString={game.gameDate.toISOString()}
										showTime={false}
									/>
								</span>
							</a>
						))}
					</div>
				</section>
			)}

			{showMissed && missedGames.length > 0 && (
				<section className={styles.section}>
					<h2>Games With Opportunity But No Fire ({missedGames.length})</h2>
					<div className={styles.gameList}>
						{missedGames.map((game) => (
							<a
								key={game.firebaseKey}
								href={`/game/${game.firebaseKey}`}
								className={`${styles.gameCard} ${styles.missed}`}
							>
								<span className={styles.gameRole}>{game.role}</span>
								<span className={styles.gameDate}>
									<LocalTimestamp
										isoString={game.gameDate.toISOString()}
										showTime={false}
									/>
								</span>
							</a>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
