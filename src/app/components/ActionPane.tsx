import React from 'react';
import TeamProposalAction from './TeamProposalAction';
import TeamVoteAction from './TeamVoteAction';
import MissionAction from './MissionAction';
import AssassinationAction from './AssassinationAction';
import type {AvalonApi} from './types';

interface ActionPaneProps {
	avalon: AvalonApi;
	selectedPlayers: string[];
}

const ActionPane: React.FC<ActionPaneProps> = ({avalon, selectedPlayers}) => {
	const teamProposal = avalon.lobby.game.phase === 'TEAM_PROPOSAL';
	const teamVote = avalon.lobby.game.phase === 'PROPOSAL_VOTE';
	const missionAction = avalon.lobby.game.phase === 'MISSION_VOTE';
	const assassinationPhase = avalon.lobby.game.phase === 'ASSASSINATION';

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
