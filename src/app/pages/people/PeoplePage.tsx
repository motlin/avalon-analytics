import {env} from 'cloudflare:workers';
import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {getPersonService} from '../../services/person';
import {db, setupDb} from '@/db';
import styles from '../players/PlayersPage.module.css';

interface PersonStatsRow {
	personId: string;
	name: string;
	uidCount: number;
	gamesPlayed: number;
	wins: number;
	goodGames: number;
	goodWins: number;
	evilGames: number;
	evilWins: number;
}

const PEOPLE_PER_PAGE = 100;

function formatWinRate(wins: number, games: number): string {
	if (games === 0) return '-';
	const rate = (wins / games) * 100;
	return `${rate.toFixed(0)}%`;
}

export async function PeoplePage({request}: RequestInfo) {
	const url = new URL(request.url);
	const pageParam = url.searchParams.get('page');
	const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);

	let personStats: PersonStatsRow[] = [];
	let totalPeople = 0;
	let error: string | null = null;

	try {
		await setupDb(env);

		const personService = getPersonService();
		await personService.initialize();

		const allPeople = await personService.getAllPeople();
		totalPeople = allPeople.length;

		// Get all PlayerStats for mapped players
		const allPlayerStats = await db.playerStats.findMany({
			where: {isMapped: true},
		});

		// Create a map of uid -> stats
		const playerStatsMap = new Map(allPlayerStats.map((s) => [s.uid, s]));

		// Aggregate stats for each person
		const aggregatedStats: PersonStatsRow[] = [];

		for (const person of allPeople) {
			let gamesPlayed = 0;
			let wins = 0;
			let goodGames = 0;
			let goodWins = 0;
			let evilGames = 0;
			let evilWins = 0;

			for (const uid of person.uids) {
				const stats = playerStatsMap.get(uid);
				if (stats) {
					gamesPlayed += stats.gamesPlayed;
					wins += stats.wins;
					goodGames += stats.goodGames;
					goodWins += stats.goodWins;
					evilGames += stats.evilGames;
					evilWins += stats.evilWins;
				}
			}

			aggregatedStats.push({
				personId: person.id,
				name: person.name,
				uidCount: person.uids.length,
				gamesPlayed,
				wins,
				goodGames,
				goodWins,
				evilGames,
				evilWins,
			});
		}

		// Sort by games played descending
		aggregatedStats.sort((a, b) => b.gamesPlayed - a.gamesPlayed);

		// Paginate
		const skip = (currentPage - 1) * PEOPLE_PER_PAGE;
		personStats = aggregatedStats.slice(skip, skip + PEOPLE_PER_PAGE);
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load people stats';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const totalPages = Math.ceil(totalPeople / PEOPLE_PER_PAGE);
	const startIndex = (currentPage - 1) * PEOPLE_PER_PAGE;

	return (
		<div className={styles.container}>
			<Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'People'}]} />
			<div className={styles.header}>
				<h1>People</h1>
				<p className={styles.subtitle}>
					Showing {startIndex + 1}-{Math.min(startIndex + personStats.length, totalPeople)} of {totalPeople}{' '}
					people
				</p>
			</div>
			<div className={styles.content}>
				{personStats.length === 0 ? (
					<p className={styles.noPlayers}>No people found</p>
				) : (
					<div className={styles.tableWrapper}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th className={styles.nameColumn}>Person</th>
									<th className={styles.numberColumn}>Accounts</th>
									<th className={styles.numberColumn}>Games</th>
									<th className={styles.numberColumn}>Wins</th>
									<th className={styles.numberColumn}>Win %</th>
									<th className={styles.numberColumn}>Good</th>
									<th className={styles.numberColumn}>Good %</th>
									<th className={styles.numberColumn}>Evil</th>
									<th className={styles.numberColumn}>Evil %</th>
								</tr>
							</thead>
							<tbody>
								{personStats.map((person) => (
									<tr key={person.personId}>
										<td className={styles.nameColumn}>
											<a
												href={`/person/${person.personId}`}
												className={styles.playerLink}
											>
												{person.name}
											</a>
										</td>
										<td className={styles.numberColumn}>{person.uidCount}</td>
										<td className={styles.numberColumn}>{person.gamesPlayed}</td>
										<td className={styles.numberColumn}>{person.wins}</td>
										<td className={styles.numberColumn}>
											{formatWinRate(person.wins, person.gamesPlayed)}
										</td>
										<td className={styles.numberColumn}>
											{person.goodWins}/{person.goodGames}
										</td>
										<td className={styles.numberColumn}>
											{formatWinRate(person.goodWins, person.goodGames)}
										</td>
										<td className={styles.numberColumn}>
											{person.evilWins}/{person.evilGames}
										</td>
										<td className={styles.numberColumn}>
											{formatWinRate(person.evilWins, person.evilGames)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{/* Pagination Controls */}
				{totalPages > 1 && (
					<div className={styles.pagination}>
						{currentPage > 1 && (
							<a
								href={`/people?page=${currentPage - 1}`}
								className={styles.pageLink}
							>
								← Previous
							</a>
						)}
						{Array.from({length: totalPages}, (_, i) => i + 1)
							.filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
							.map((page, index, filtered) => {
								const showEllipsis = index > 0 && page - filtered[index - 1] > 1;
								return (
									<span key={page}>
										{showEllipsis && <span className={styles.ellipsis}>…</span>}
										<a
											href={`/people?page=${page}`}
											className={`${styles.pageLink} ${page === currentPage ? styles.currentPage : ''}`}
										>
											{page}
										</a>
									</span>
								);
							})}
						{currentPage < totalPages && (
							<a
								href={`/people?page=${currentPage + 1}`}
								className={styles.pageLink}
							>
								Next →
							</a>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
