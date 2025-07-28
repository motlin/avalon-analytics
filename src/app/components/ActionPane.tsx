import React from 'react';
import TeamProposalAction from './TeamProposalAction';
import TeamVoteAction from './TeamVoteAction';
import MissionAction from './MissionAction';
import AssassinationAction from './AssassinationAction';

interface Game {
	phase: string;
}

interface AvalonProps {
	game: Game;
}

interface ActionPaneProps {
	avalon: AvalonProps;
	selectedPlayers: string[];
}

const ActionPane: React.FC<ActionPaneProps> = ({avalon, selectedPlayers}) => {
	const teamProposal = avalon.game.phase === 'TEAM_PROPOSAL';
	const teamVote = avalon.game.phase === 'PROPOSAL_VOTE';
	const missionAction = avalon.game.phase === 'MISSION_VOTE';
	const assassinationPhase = avalon.game.phase === 'ASSASSINATION';

	return (
		<div>
			{teamProposal && (
				<TeamProposalAction
					avalon={avalon}
					playerList={selectedPlayers}
				/>
			)}
			{teamVote && <TeamVoteAction avalon={avalon} />}
			{missionAction && <MissionAction avalon={avalon} />}
			{assassinationPhase && (
				<AssassinationAction
					playerList={selectedPlayers}
					avalon={avalon}
				/>
			)}
		</div>
	);
};

export default ActionPane;
