import {GameOutcomeComponent} from './GameOutcome';
import {MissionComponent} from './Mission';
import {MissionResultComponent} from './MissionResult';
import {PlayerComponent} from './Player';
import {ProposalComponent} from './Proposal';
import type {Game} from '../models/game';

interface GameProps {
	game: Game;
}

export function GameComponent({game}: GameProps) {
	return (
		<div
			style={{
				border: '1px solid #ccc',
				padding: '1.5rem',
				backgroundColor: '#f5f5f5',
			}}
		>
			<h1>Game Details</h1>
			<p>Game ID: {game.id}</p>
			<p>Created: {game.timeCreated.toLocaleString()}</p>
			{game.timeFinished && <p>Finished: {game.timeFinished.toLocaleString()}</p>}

			<div
				style={{
					border: '2px solid #9e9e9e',
					padding: '1rem',
					marginTop: '1rem',
					backgroundColor: '#ffffff',
				}}
			>
				<h2>Players</h2>
				<div>
					{game.players.map((player) => (
						<PlayerComponent
							key={player.uid}
							player={player}
						/>
					))}
				</div>
			</div>

			<div
				style={{
					border: '2px solid #9e9e9e',
					padding: '1rem',
					marginTop: '1rem',
					backgroundColor: '#ffffff',
				}}
			>
				<h2>Missions</h2>
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
								<div
									style={{
										marginTop: '0.5rem',
										marginBottom: '0.5rem',
									}}
								>
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
			</div>

			{game.outcome && <GameOutcomeComponent outcome={game.outcome} />}
		</div>
	);
}
