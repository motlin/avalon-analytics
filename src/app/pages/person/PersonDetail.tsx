import {env} from 'cloudflare:workers';
import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {LocalTimestamp} from '../../components/LocalTimestamp';
import {LossReasonStats} from '../../components/LossReasonStats';
import {RoleStatsTable} from '../../components/RoleStatsTable';
import {SpecialRoleStats} from '../../components/SpecialRoleStats';
import {YearlyStatsTable} from '../../components/YearlyStatsTable';
import {type Game, GameSchema} from '../../models/game';
import {type PersonStatistics, loadPersonStatsFromDb} from '../../models/player-statistics';
import {getPersonService} from '../../services/person';
import {db, setupDb} from '@/db';
import styles from './PersonDetail.module.css';

const GAMES_PER_PAGE = 20;

/**
 * Person detail page that displays aggregated statistics for a person across all their linked UIDs.
 * Route: /person/:personId
 *
 * Query parameters:
 * - page: Page number for game history (default: 1)
 */
export async function PersonDetail({params, request}: RequestInfo) {
	const personId = params.personId;
	const url = new URL(request.url);
	const pageParam = url.searchParams.get('page');
	const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);

	let games: Game[] = [];
	let error: string | null = null;
	let personName: string | null = null;
	let personUids: string[] = [];
	let stats: PersonStatistics | null = null;

	try {
		await setupDb(env);

		// Get person info and their UIDs from the service
		const personService = getPersonService();
		await personService.initialize();

		const allPeople = await personService.getAllPeople();
		const person = allPeople.find((p) => p.id === personId);

		if (!person) {
			return (
				<div className={styles.notFoundContainer}>
					<Breadcrumb
						items={[{label: 'Home', href: '/'}, {label: 'Players', href: '/players'}, {label: 'Not Found'}]}
					/>
					<h1>Person Not Found</h1>
					<p>No person found with ID: {personId}</p>
				</div>
			);
		}

		personName = person.name;
		personUids = person.uids;

		// Load pre-computed stats from database
		stats = await loadPersonStatsFromDb(personId);

		// Fetch games for game history section
		const uidPlaceholders = personUids.map(() => '?').join(', ');
		const rawGames = await db.$queryRawUnsafe<Array<{firebaseKey: string; gameJson: string}>>(
			`SELECT DISTINCT r.firebaseKey, r.gameJson
			 FROM RawGameData r
			 INNER JOIN PlayerGame pg ON r.firebaseKey = pg.firebaseKey
			 WHERE pg.playerUid IN (${uidPlaceholders})`,
			...personUids,
		);

		for (const rawGame of rawGames) {
			const gameData = typeof rawGame.gameJson === 'string' ? JSON.parse(rawGame.gameJson) : rawGame.gameJson;
			const parsed = GameSchema.safeParse(gameData);
			if (parsed.success) {
				games.push(parsed.data);
			}
		}

		games.sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime());
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load games for person';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!stats || games.length === 0) {
		return (
			<div className={styles.notFoundContainer}>
				<Breadcrumb
					items={[{label: 'Home', href: '/'}, {label: 'Players', href: '/players'}, {label: 'Not Found'}]}
				/>
				<h1>Person Not Found</h1>
				<p>No statistics found for person with ID: {personId}</p>
			</div>
		);
	}

	// Override the person name with the known person name
	stats.personName = personName!;

	return (
		<div className={styles.pageContainer}>
			<Breadcrumb
				items={[{label: 'Home', href: '/'}, {label: 'Players', href: '/players'}, {label: personName!}]}
			/>

			{/* Header Section */}
			<div className={styles.headerSection}>
				<h1 className={styles.pageTitle}>Player Statistics: {personName}</h1>
				<p className={styles.linkedAccounts}>
					{personUids.length} linked account{personUids.length !== 1 ? 's' : ''}
				</p>
			</div>

			{/* Overview Summary */}
			<div className={styles.summaryGrid}>
				<div className={styles.summaryItem}>
					<div className={styles.summaryValue}>{stats.totalGames}</div>
					<div className={styles.summaryLabel}>Total Games</div>
				</div>
				<div className={styles.summaryItem}>
					<div className={styles.summaryValueWins}>{stats.totalWins}</div>
					<div className={styles.summaryLabel}>Wins</div>
				</div>
				<div className={styles.summaryItem}>
					<div className={styles.summaryValueLosses}>{stats.totalLosses}</div>
					<div className={styles.summaryLabel}>Losses</div>
				</div>
				<div className={styles.summaryItem}>
					<div className={styles.summaryValueRate}>{stats.overallWinRate.toFixed(0)}%</div>
					<div className={styles.summaryLabel}>Win Rate</div>
				</div>
			</div>

			{/* Detailed Statistics Sections */}
			<div className={styles.statsGrid}>
				<RoleStatsTable stats={stats} />
				<div>
					<LossReasonStats stats={stats} />
					<SpecialRoleStats stats={stats} />
				</div>
			</div>

			<YearlyStatsTable stats={stats} />

			{/* Game History Section */}
			<GameHistorySection
				games={games}
				playerUids={personUids}
				personId={personId}
				currentPage={currentPage}
				gamesPerPage={GAMES_PER_PAGE}
			/>
		</div>
	);
}

interface GameHistorySectionProps {
	games: Game[];
	playerUids: string[];
	personId: string;
	currentPage: number;
	gamesPerPage: number;
}

function GameHistorySection({games, playerUids, personId, currentPage, gamesPerPage}: GameHistorySectionProps) {
	const totalGames = games.length;
	const totalPages = Math.ceil(totalGames / gamesPerPage);
	const startIndex = (currentPage - 1) * gamesPerPage;
	const endIndex = Math.min(startIndex + gamesPerPage, totalGames);
	const paginatedGames = games.slice(startIndex, endIndex);
	const uidSet = new Set(playerUids);

	return (
		<div className={styles.gameHistorySection}>
			<div className={styles.gameHistoryHeader}>
				<h3 className={styles.gameHistoryTitle}>Game History</h3>
				<span className={styles.gameHistoryCount}>
					Showing {startIndex + 1}-{endIndex} of {totalGames} games
				</span>
			</div>

			{paginatedGames.map((game) => {
				const playerInGame = game.players.find((p) => uidSet.has(p.uid));
				const playerRole = game.outcome?.roles?.find(
					(r: {name: string; role: string}) => r.name === playerInGame?.name,
				);
				const normalizedRole = playerRole?.role?.toUpperCase();
				const isEvil =
					normalizedRole &&
					['MORDRED', 'MORGANA', 'ASSASSIN', 'EVIL MINION', 'MINION OF MORDRED', 'OBERON'].includes(
						normalizedRole,
					);
				const playerWon =
					game.outcome &&
					((isEvil && game.outcome.state === 'EVIL_WIN') || (!isEvil && game.outcome.state === 'GOOD_WIN'));
				const wasAssassinated = game.outcome?.assassinated === playerInGame?.name;
				const wasMerlin = normalizedRole === 'MERLIN';

				const getOutcomeDescription = () => {
					if (!game.outcome) return null;

					const outcomeReason = game.outcome.reason || game.outcome.message;
					const reasons: {[key: string]: string} = {
						'Three successful missions': '3 missions succeeded',
						'Three failed missions': '3 missions failed',
						'Five rejected proposals': '5 proposals rejected',
						'Merlin assassinated': 'Merlin assassinated',
						'Failed to assassinate Merlin': 'Failed to assassinate Merlin',
					};

					return outcomeReason ? reasons[outcomeReason] || outcomeReason : null;
				};

				const gameCardClasses = `${styles.gameCard} ${playerWon ? styles.gameCardWin : styles.gameCardLoss}`;

				return (
					<div
						key={game.id}
						className={gameCardClasses}
					>
						<div className={styles.gameCardContent}>
							<div className={styles.gameCardMain}>
								<h3 className={styles.gameCardTitle}>
									<a
										href={`/game/${game.id}`}
										className={styles.gameCardLink}
									>
										<LocalTimestamp isoString={game.timeCreated.toISOString()} />
									</a>
								</h3>

								<div className={styles.gameCardDetails}>
									<div className={styles.gameCardDetail}>
										<strong>Result:</strong>
										<span className={playerWon ? styles.resultWin : styles.resultLoss}>
											{playerWon ? 'Victory' : 'Defeat'}
										</span>
									</div>

									{playerRole && (
										<div className={styles.gameCardDetail}>
											<strong>Role:</strong>
											<span className={isEvil ? styles.roleEvil : styles.roleGood}>
												{playerRole.role}
											</span>
										</div>
									)}

									{game.outcome && (
										<div className={styles.gameCardDetail}>
											<strong>Outcome:</strong>
											<span>{getOutcomeDescription()}</span>
										</div>
									)}
								</div>

								{(wasAssassinated || wasMerlin) && (
									<div
										className={`${styles.specialEventBadge} ${wasAssassinated ? styles.assassinatedBadge : styles.survivedBadge}`}
									>
										{wasAssassinated && (
											<span>
												<strong>Assassinated!</strong>
											</span>
										)}
										{wasMerlin && !wasAssassinated && (
											<span>
												<strong>Was Merlin and survived!</strong>
											</span>
										)}
									</div>
								)}
							</div>
						</div>

						<div className={styles.playersList}>
							<strong>Players:</strong> {game.players.map((p) => p.name).join(', ')}
						</div>
					</div>
				);
			})}

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className={styles.pagination}>
					{currentPage > 1 && (
						<a
							href={`/person/${personId}?page=${currentPage - 1}`}
							className={styles.paginationLink}
						>
							← Previous
						</a>
					)}

					{Array.from({length: totalPages}, (_, i) => i + 1)
						.filter((page) => {
							// Show first, last, current, and pages near current
							return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
						})
						.map((page, index, filtered) => {
							const showEllipsis = index > 0 && page - filtered[index - 1] > 1;
							const numberClasses = `${styles.paginationNumber} ${
								page === currentPage ? styles.paginationNumberActive : styles.paginationNumberInactive
							}`;
							return (
								<span key={page}>
									{showEllipsis && <span className={styles.paginationEllipsis}>…</span>}
									<a
										href={`/person/${personId}?page=${page}`}
										className={numberClasses}
									>
										{page}
									</a>
								</span>
							);
						})}

					{currentPage < totalPages && (
						<a
							href={`/person/${personId}?page=${currentPage + 1}`}
							className={styles.paginationLink}
						>
							Next →
						</a>
					)}
				</div>
			)}
		</div>
	);
}
