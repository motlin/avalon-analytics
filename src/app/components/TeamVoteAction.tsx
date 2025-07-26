import React, {useState} from 'react';
import styles from './TeamVoteAction.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faVoteYea} from '@fortawesome/free-solid-svg-icons';
import {
	faThumbsUp as faThumbsUpRegular,
	faThumbsDown as faThumbsDownRegular,
} from '@fortawesome/free-regular-svg-icons';

function joinWithAnd(array: string[]): string {
	if (array.length === 0) return '';
	if (array.length === 1) return array[0];
	const arrCopy = array.slice(0);
	const lastElement = arrCopy.pop();
	return arrCopy.join(', ') + ' and ' + lastElement;
}

interface User {
	name: string;
}

interface Proposal {
	team: string[];
	votes: string[];
}

interface Game {
	currentProposalIdx: number;
	currentProposal: Proposal;
	currentProposer: string;
}

interface AvalonProps {
	game: Game;
	user: User;
	voteTeam: (vote: boolean) => Promise<void>;
}

interface TeamVoteActionProps {
	avalon: AvalonProps;
}

const TeamVoteAction: React.FC<TeamVoteActionProps> = ({avalon}) => {
	const hasVoted = avalon.game.currentProposal?.votes?.includes(avalon.user?.name) || false;

	const [loadingState, setLoadingState] = useState({yes: false, no: false});
	const [disabledState, setDisabledState] = useState({yes: hasVoted, no: hasVoted});
	const [votedState, setVotedState] = useState({yes: false, no: false});

	const proposer = avalon.game.currentProposer === avalon.user?.name ? 'your' : avalon.game.currentProposer + "'s ";

	const teamVote = (vote: boolean) => {
		const myState = vote ? 'yes' : 'no';
		const otherState = vote ? 'no' : 'yes';

		setLoadingState((prev) => ({...prev, [myState]: true}));
		setDisabledState((prev) => ({...prev, [otherState]: true}));

		avalon.voteTeam(vote).finally(() => {
			setLoadingState((prev) => ({...prev, [myState]: false}));
			setDisabledState((prev) => ({
				...prev,
				[myState]: true,
				[otherState]: false,
			}));
			setVotedState({
				[myState]: true,
				[otherState]: false,
			} as {yes: boolean; no: boolean});
		});
	};

	return (
		<div className={styles.card}>
			<div className={styles.cardTitle}>Team Proposal Vote ({avalon.game.currentProposalIdx + 1}/5)</div>
			<div className={styles.cardContent}>
				<div className={styles.votingText}>
					Voting for {proposer} team of {joinWithAnd(avalon.game.currentProposal?.team || [])}
				</div>
				<div className={styles.buttonLayout}>
					<button
						className={`${styles.button} ${styles.approveButton} ${loadingState.yes ? styles.loading : ''}`}
						onClick={() => teamVote(true)}
						disabled={disabledState.yes}
					>
						<span className={`${styles.icon} ${styles.greenIcon}`}>
							<FontAwesomeIcon icon={votedState.yes ? faVoteYea : faThumbsUpRegular} />
						</span>
						Approve
					</button>
					<button
						className={`${styles.button} ${styles.rejectButton} ${loadingState.no ? styles.loading : ''}`}
						onClick={() => teamVote(false)}
						disabled={disabledState.no}
					>
						<span className={`${styles.icon} ${styles.redIcon}`}>
							<FontAwesomeIcon icon={votedState.no ? faVoteYea : faThumbsDownRegular} />
						</span>
						Reject
					</button>
				</div>
			</div>
		</div>
	);
};

export default TeamVoteAction;
