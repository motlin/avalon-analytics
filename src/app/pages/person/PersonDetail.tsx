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
				<div style={{padding: '1rem'}}>
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
			<div style={{padding: '1rem'}}>
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
		<div style={{padding: '1rem', maxWidth: '1200px', margin: '0 auto'}}>
			<Breadcrumb
				items={[{label: 'Home', href: '/'}, {label: 'Players', href: '/players'}, {label: personName!}]}
			/>

			{/* Header Section */}
			<div style={{marginBottom: '2rem'}}>
				<h1 style={{margin: '0 0 0.5rem 0'}}>Player Statistics: {personName}</h1>
				<p style={{margin: 0, color: '#666', fontSize: '0.875rem'}}>
					{personUids.length} linked account{personUids.length !== 1 ? 's' : ''}
				</p>
			</div>

			{/* Overview Summary */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
					gap: '1rem',
					marginBottom: '2rem',
					padding: '1.5rem',
					backgroundColor: '#f5f5f5',
					borderRadius: '8px',
				}}
			>
				<div style={{textAlign: 'center'}}>
					<div style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.totalGames}</div>
					<div style={{color: '#666', fontSize: '0.875rem'}}>Total Games</div>
				</div>
				<div style={{textAlign: 'center'}}>
					<div style={{fontSize: '2rem', fontWeight: 'bold', color: '#4caf50'}}>{stats.totalWins}</div>
					<div style={{color: '#666', fontSize: '0.875rem'}}>Wins</div>
				</div>
				<div style={{textAlign: 'center'}}>
					<div style={{fontSize: '2rem', fontWeight: 'bold', color: '#f44336'}}>{stats.totalLosses}</div>
					<div style={{color: '#666', fontSize: '0.875rem'}}>Losses</div>
				</div>
				<div style={{textAlign: 'center'}}>
					<div style={{fontSize: '2rem', fontWeight: 'bold', color: '#1976d2'}}>
						{stats.overallWinRate.toFixed(0)}%
					</div>
					<div style={{color: '#666', fontSize: '0.875rem'}}>Win Rate</div>
				</div>
			</div>

			{/* Detailed Statistics Sections */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
					gap: '2rem',
				}}
			>
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
		<div style={{marginTop: '2rem'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
				<h3 style={{margin: 0}}>Game History</h3>
				<span style={{color: '#666', fontSize: '0.875rem'}}>
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

				return (
					<div
						key={game.id}
						style={{
							border: '2px solid',
							borderColor: playerWon ? '#4caf50' : '#f44336',
							padding: '1rem',
							marginBottom: '1rem',
							backgroundColor: playerWon ? '#f8fff8' : '#fff8f8',
							borderRadius: '8px',
							boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'flex-start',
							}}
						>
							<div style={{flex: 1}}>
								<h3 style={{margin: '0 0 0.5rem 0'}}>
									<a
										href={`/game/${game.id}`}
										style={{textDecoration: 'none', color: '#0066cc'}}
									>
										<LocalTimestamp isoString={game.timeCreated.toISOString()} />
									</a>
								</h3>

								<div
									style={{
										display: 'flex',
										flexWrap: 'wrap',
										gap: '1rem',
										fontSize: '0.9rem',
									}}
								>
									<div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
										<strong>Result:</strong>
										<span
											style={{
												color: playerWon ? '#4caf50' : '#f44336',
												fontWeight: 'bold',
											}}
										>
											{playerWon ? 'Victory' : 'Defeat'}
										</span>
									</div>

									{playerRole && (
										<div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
											<strong>Role:</strong>
											<span
												style={{
													color: isEvil ? '#c62828' : '#2e7d32',
													fontWeight: 'bold',
												}}
											>
												{playerRole.role}
											</span>
										</div>
									)}

									{game.outcome && (
										<div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
											<strong>Outcome:</strong>
											<span>{getOutcomeDescription()}</span>
										</div>
									)}
								</div>

								{(wasAssassinated || wasMerlin) && (
									<div
										style={{
											marginTop: '0.5rem',
											padding: '0.5rem',
											backgroundColor: wasAssassinated ? '#fff3cd' : '#e3f2fd',
											border: '1px solid',
											borderColor: wasAssassinated ? '#ffeaa7' : '#90caf9',
											borderRadius: '4px',
											fontSize: '0.9rem',
										}}
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

						<div style={{marginTop: '0.75rem', fontSize: '0.85rem', color: '#666'}}>
							<strong>Players:</strong> {game.players.map((p) => p.name).join(', ')}
						</div>
					</div>
				);
			})}

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						gap: '0.5rem',
						marginTop: '1.5rem',
						flexWrap: 'wrap',
					}}
				>
					{currentPage > 1 && (
						<a
							href={`/person/${personId}?page=${currentPage - 1}`}
							style={{
								padding: '0.5rem 1rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								textDecoration: 'none',
								color: '#0066cc',
							}}
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
							return (
								<span key={page}>
									{showEllipsis && <span style={{padding: '0 0.25rem'}}>…</span>}
									<a
										href={`/person/${personId}?page=${page}`}
										style={{
											padding: '0.5rem 0.75rem',
											border: '1px solid',
											borderColor: page === currentPage ? '#0066cc' : '#ddd',
											borderRadius: '4px',
											textDecoration: 'none',
											color: page === currentPage ? '#fff' : '#0066cc',
											backgroundColor: page === currentPage ? '#0066cc' : 'transparent',
										}}
									>
										{page}
									</a>
								</span>
							);
						})}

					{currentPage < totalPages && (
						<a
							href={`/person/${personId}?page=${currentPage + 1}`}
							style={{
								padding: '0.5rem 1rem',
								border: '1px solid #ddd',
								borderRadius: '4px',
								textDecoration: 'none',
								color: '#0066cc',
							}}
						>
							Next →
						</a>
					)}
				</div>
			)}
		</div>
	);
}
