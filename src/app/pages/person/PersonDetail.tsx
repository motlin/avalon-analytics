import type {RequestInfo} from 'rwsdk/worker';
import {Breadcrumb} from '../../components/Breadcrumb';
import {LocalTimestamp} from '../../components/LocalTimestamp';
import {type Game, GameSchema} from '../../models/game';
import {getPersonService} from '../../services/person';
import {db} from '@/db';

export async function PersonDetail({params}: RequestInfo) {
	const personId = params.personId;
	let games: Game[] = [];
	let error: string | null = null;
	let personName: string | null = null;
	let personUids: string[] = [];

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

	try {
		const rawGames = await db.rawGameData.findMany();
		const uidSet = new Set(personUids);

		for (const rawGame of rawGames) {
			const parsed = GameSchema.safeParse(rawGame.gameJson);
			if (parsed.success) {
				const game = parsed.data;
				if (game.players.some((p) => uidSet.has(p.uid))) {
					games.push(game);
				}
			}
		}

		games.sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime());
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load games for person';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div style={{padding: '1rem'}}>
			<Breadcrumb
				items={[{label: 'Home', href: '/'}, {label: 'Players', href: '/players'}, {label: personName}]}
			/>
			<h1>Games for {personName}</h1>
			<p>
				{personUids.length} linked account{personUids.length !== 1 ? 's' : ''}
			</p>
			<p>Total games: {games.length}</p>

			{games.length === 0 ? (
				<p>No games found for this person.</p>
			) : (
				<div style={{marginTop: '1rem'}}>
					{games.map((game) => {
						// Find the player in this game (could be any of their UIDs)
						const playerInGame = game.players.find((p) => personUids.includes(p.uid));
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
									style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}
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
											style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem'}}
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
				</div>
			)}
		</div>
	);
}
