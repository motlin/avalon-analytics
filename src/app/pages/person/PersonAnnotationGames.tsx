import {env} from 'cloudflare:workers';
import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {LocalTimestamp} from '../../components/LocalTimestamp';
import {getPersonService} from '../../services/person';
import {db, setupDb} from '@/db';
import styles from './PersonAnnotationGames.module.css';

interface AnnotationGame {
	firebaseKey: string;
	fired: boolean;
	role: string;
	gameDate: Date;
}

function formatPredicateName(name: string): string {
	return name
		.replace(/ProposalVotePredicate$/, '')
		.replace(/ProposalPredicate$/, '')
		.replace(/MissionVotePredicate$/, '')
		.replace(/Predicate$/, '')
		.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * Page showing all games where a specific behavior occurred for a person.
 * Route: /person/:personId/predicate/:predicateName/games
 */
export async function PersonAnnotationGames({params}: RequestInfo) {
	const {personId, predicateName} = params;

	let error: string | null = null;
	let personName: string | null = null;
	let games: AnnotationGame[] = [];
	let totalFires = 0;
	let totalOpportunities = 0;

	try {
		await setupDb(env);

		// Get person info
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

		// Get annotation stats for this person+predicate
		const annotationStats = await db.personAnnotationStats.findFirst({
			where: {
				personId,
				predicateName,
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
							{label: formatPredicateName(predicateName)},
						]}
					/>
					<h1>No Data</h1>
					<p>No annotation data found for this behavior.</p>
				</div>
			);
		}

		totalFires = annotationStats.fires;
		totalOpportunities = annotationStats.opportunities;

		// Get game dates for each game
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

		// Build games list with dates
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

	const displayName = formatPredicateName(predicateName);
	const firedGames = games.filter((g) => g.fired);
	const missedGames = games.filter((g) => !g.fired);

	return (
		<div className={styles.container}>
			<Breadcrumb
				items={[
					{label: 'Home', href: '/'},
					{label: personName || 'Unknown', href: `/person/${personId}`},
					{label: displayName},
				]}
			/>

			<h1 className={styles.title}>{displayName}</h1>
			<p className={styles.subtitle}>
				Games for <strong>{personName}</strong>
			</p>

			<div className={styles.summary}>
				<span className={styles.summaryItem}>
					<span className={styles.fireCount}>{totalFires}</span> fires
				</span>
				<span className={styles.summaryItem}>
					<span className={styles.opportunityCount}>{totalOpportunities}</span> opportunities
				</span>
				<span className={styles.summaryItem}>{((totalFires / totalOpportunities) * 100).toFixed(1)}% rate</span>
			</div>

			{firedGames.length > 0 && (
				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Games Where Behavior Occurred ({firedGames.length})</h2>
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

			{missedGames.length > 0 && (
				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Games With Opportunity But No Fire ({missedGames.length})</h2>
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
