import React, {useState} from 'react';
import styles from './TeamProposalAction.module.css';
import type {AvalonApi} from './types';

interface TeamProposalActionProps {
	avalon: AvalonApi;
	playerList: string[];
}

const TeamProposalAction: React.FC<TeamProposalActionProps> = ({avalon, playerList}) => {
	const [isProposing, setIsProposing] = useState(false);

	const isValidSelection = playerList.length === avalon.lobby.game.currentMission?.teamSize;

	const proposeTeam = () => {
		setIsProposing(true);
		avalon.proposeTeam?.(playerList);
	};

	const isCurrentProposer = avalon.lobby.game.currentProposer === avalon.user?.name;

	return (
		<div className={styles.card}>
			<div className={styles.cardTitle}>Team Proposal ({(avalon.lobby.game.currentProposalIdx ?? 0) + 1}/5)</div>
			<div className={styles.cardContent}>
				<div className={styles.layout}>
					{isCurrentProposer ? (
						<div>
							<div className={styles.instruction}>
								Propose a team of {avalon.lobby.game.currentMission?.teamSize}
							</div>
							<button
								className={`${styles.proposeButton} ${isProposing ? styles.loading : ''}`}
								disabled={!isValidSelection || isProposing}
								onClick={proposeTeam}
							>
								{isProposing ? 'Proposing...' : 'Propose Team'}
							</button>
						</div>
					) : (
						<div className={styles.waiting}>
							Waiting for {avalon.lobby.game.currentProposer} to propose a team of{' '}
							{avalon.lobby.game.currentMission?.teamSize}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TeamProposalAction;
