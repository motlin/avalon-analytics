import React, {useState, useMemo} from 'react';
import styles from './MissionAction.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import type {AvalonApi} from './types';

interface MissionActionProps {
	avalon: AvalonApi;
}

function joinWithAnd(array: string[]): string {
	if (array.length === 0) return '';
	if (array.length === 1) return array[0];
	const arrCopy = array.slice(0);
	const lastElement = arrCopy.pop();
	return arrCopy.join(', ') + ' and ' + lastElement;
}

const MissionAction: React.FC<MissionActionProps> = ({avalon}) => {
	const [needsToVote, setNeedsToVote] = useState(
		avalon.lobby.game.currentProposal?.team?.includes(avalon.user?.name) || false,
	);

	const stillWaitingFor = useMemo(() => {
		return (avalon.lobby.game.currentProposal?.team || [])
			.filter((name) => !(avalon.lobby.game.currentMission?.team || []).includes(name))
			.filter((name) => name !== avalon.user?.name);
	}, [avalon.lobby.game.currentProposal?.team, avalon.lobby.game.currentMission?.team, avalon.user?.name]);

	const waitingForText = useMemo(() => {
		if (stillWaitingFor.length > 0) {
			return 'Waiting for ' + joinWithAnd(stillWaitingFor);
		} else {
			return 'Waiting for results...';
		}
	}, [stillWaitingFor]);

	const missionVote = (vote: boolean) => {
		setNeedsToVote(false);
		if (avalon.doMission) {
			avalon.doMission(vote);
		}
	};

	return (
		<div className={styles.card}>
			<div className={styles.cardTitle}>Mission in Progress</div>
			<div className={styles.cardContent}>
				{needsToVote ? (
					<div className={styles.buttonLayout}>
						<button
							className={styles.successButton}
							onClick={() => missionVote(true)}
						>
							<span className={styles.successIcon}>
								<FontAwesomeIcon icon={faCheckCircle} />
							</span>
							SUCCESS
						</button>
						<button
							className={styles.failButton}
							onClick={() => missionVote(false)}
						>
							<span className={styles.failIcon}>
								<FontAwesomeIcon icon={faTimesCircle} />
							</span>
							FAIL
						</button>
					</div>
				) : (
					<div>{waitingForText}</div>
				)}
			</div>
		</div>
	);
};

export default MissionAction;
