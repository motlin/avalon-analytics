import {env} from 'cloudflare:workers';
import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {LocalTimestamp} from '../../components/LocalTimestamp';
import {LossReasonStats} from '../../components/LossReasonStats';
import {RoleStatsTable} from '../../components/RoleStatsTable';
import {SpecialRoleStats} from '../../components/SpecialRoleStats';
import {YearlyStatsTable} from '../../components/YearlyStatsTable';
import {type Game, GameSchema} from '../../models/game';
import {calculatePlayerStats} from '../../models/player-statistics';
import {db, setupDb} from '@/db';

export async function UidDetail({params}: RequestInfo) {
	const uid = params.uid;
	let games: Game[] = [];
	let error: string | null = null;

	try {
		await setupDb(env);
		const rawGames = await db.rawGameData.findMany();
		for (const rawGame of rawGames) {
			const parsed = GameSchema.safeParse(rawGame.gameJson);
			if (parsed.success) {
				const game = parsed.data;
				if (game.players.some((p) => p.uid === uid)) {
					games.push(game);
				}
			}
		}
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load games for player';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const playerName = games.length > 0 ? games[0].players.find((p) => p.uid === uid)?.name : null;
	const stats = calculatePlayerStats(uid, games);

	return (
		<div style={{padding: '1rem', maxWidth: '1200px', margin: '0 auto'}}>
			<Breadcrumb
				items={[
					{label: 'Home', href: '/'},
					{label: 'All Games', href: '/games'},
					{label: `Player ${playerName || uid}`},
				]}
			/>

			{/* Header Section */}
			<div style={{marginBottom: '2rem'}}>
				<h1 style={{margin: '0 0 0.5rem 0'}}>Player Statistics: {playerName || uid}</h1>
				<p style={{margin: 0, color: '#666', fontSize: '0.875rem'}}>UID: {uid}</p>
			</div>

			{games.length === 0 ? (
				<p>No games found for this player.</p>
			) : (
				<>
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
							<div style={{fontSize: '2rem', fontWeight: 'bold', color: '#4caf50'}}>
								{stats.totalWins}
							</div>
							<div style={{color: '#666', fontSize: '0.875rem'}}>Wins</div>
						</div>
						<div style={{textAlign: 'center'}}>
							<div style={{fontSize: '2rem', fontWeight: 'bold', color: '#f44336'}}>
								{stats.totalLosses}
							</div>
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
					<div style={{marginTop: '2rem'}}>
						<h3 style={{marginBottom: '1rem'}}>Game History</h3>
						{games.map((game) => {
							const playerInGame = game.players.find((p) => p.uid === uid);
							const playerRole = game.outcome?.roles?.find((r: any) => r.name === playerInGame?.name);
							const normalizedRole = playerRole?.role?.toUpperCase();
							const isEvil =
								normalizedRole &&
								[
									'MORDRED',
									'MORGANA',
									'ASSASSIN',
									'EVIL MINION',
									'MINION OF MORDRED',
									'OBERON',
								].includes(normalizedRole);
							const playerWon =
								game.outcome &&
								((isEvil && game.outcome.state === 'EVIL_WIN') ||
									(!isEvil && game.outcome.state === 'GOOD_WIN'));
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
															<strong>You were assassinated!</strong>
														</span>
													)}
													{wasMerlin && !wasAssassinated && (
														<span>
															<strong>You were Merlin and survived!</strong>
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
					</div>
				</>
			)}
		</div>
	);
}
