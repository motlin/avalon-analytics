import {GameOutcomeComponent} from './GameOutcome';
import {MissionComponent} from './Mission';
import {MissionResultComponent} from './MissionResult';
import {PlayerComponent} from './Player';
import {ProposalComponent} from './Proposal';
import {Card, CardContent, CardHeader, CardTitle} from '@/app/components/ui/card';
import type {Game} from '../models/game';

interface GameProps {
	game: Game;
}

export function GameComponent({game}: GameProps) {
	return (
		<Card className="bg-secondary/20">
			<CardHeader>
				<CardTitle>Game Details</CardTitle>
				<div className="text-sm text-muted-foreground space-y-1">
					<p>Game ID: {game.id}</p>
					<p>Created: {game.timeCreated.toLocaleString()}</p>
					{game.timeFinished && <p>Finished: {game.timeFinished.toLocaleString()}</p>}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Players</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-1">
							{game.players.map((player) => (
								<PlayerComponent
									key={player.uid}
									player={player}
								/>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Missions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{game.missions.map((mission, index) => {
							// Only show missions that have been played (have proposals or a result)
							if (mission.proposals.length === 0 && mission.state === 'PENDING') {
								return null;
							}

							return (
								<MissionComponent
									key={index}
									mission={mission}
									missionNumber={index + 1}
								>
									{mission.proposals.length > 0 && (
										<div className="space-y-2 my-2">
											{mission.proposals.map((proposal, propIndex) => (
												<ProposalComponent
													key={propIndex}
													proposal={proposal}
													proposalNumber={propIndex + 1}
													missionNumber={index + 1}
												/>
											))}
										</div>
									)}
									<MissionResultComponent
										mission={mission}
										missionNumber={index + 1}
									/>
								</MissionComponent>
							);
						})}
					</CardContent>
				</Card>

				{game.outcome && <GameOutcomeComponent outcome={game.outcome} />}
			</CardContent>
		</Card>
	);
}
