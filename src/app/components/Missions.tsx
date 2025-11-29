import React, {useState, useEffect} from 'react';
import {MissionSummaryTable} from './MissionSummaryTable';
import styles from './Missions.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCircle, faCheckCircle, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {faCircle as faCircleRegular} from '@fortawesome/free-regular-svg-icons';
import type {AvalonData, Mission} from './types';

function joinWithAnd(array: string[]): string {
	if (array.length === 0) return '';
	if (array.length === 1) return array[0];
	const arrCopy = array.slice(0);
	const lastElement = arrCopy.pop();
	return arrCopy.join(', ') + ' and ' + lastElement;
}

interface MissionsProps {
	avalon: AvalonData;
}

const Missions: React.FC<MissionsProps> = ({avalon}) => {
	const [activeMissionTab, setActiveMissionTab] = useState(0);

	const isFutureMission = (mission: Mission, idx: number): boolean => {
		return idx > 0 && avalon.game.missions[idx - 1].state === 'PENDING';
	};

	const classForMission = (mission: Mission): string => {
		if (mission.state === 'FAIL') return styles.failMission;
		if (mission.state === 'SUCCESS') return styles.successMission;
		return styles.pendingMission;
	};

	useEffect(() => {
		const currentIdx = avalon.lobby.game.currentMissionIdx;
		if (currentIdx !== undefined && currentIdx >= 0 && currentIdx < 5) {
			setActiveMissionTab(currentIdx);
		}
	}, [avalon.lobby.game.currentMissionIdx]);

	return (
		<div className={styles.container}>
			<div className={styles.tabsContainer}>
				<div className={styles.tabsList}>
					{avalon.game.missions.map((mission, idx) => (
						<button
							key={`missionTab${idx}`}
							className={`${styles.tab} ${activeMissionTab === idx ? styles.activeTab : ''}`}
							onClick={() => setActiveMissionTab(idx)}
						>
							<div className={styles.iconContainer}>
								{mission.state === 'PENDING' ? (
									<div className={styles.iconStack}>
										<span
											style={{
												color: isFutureMission(mission, idx) ? 'gray' : 'black',
												fontSize: '2em',
											}}
										>
											<FontAwesomeIcon icon={faCircleRegular} />
										</span>
										<span className={styles.teamSizeText}>{mission.teamSize}</span>
									</div>
								) : mission.state === 'FAIL' ? (
									<span style={{color: 'red', fontSize: '2em'}}>
										<FontAwesomeIcon icon={faTimesCircle} />
									</span>
								) : (
									<span style={{color: 'green', fontSize: '2em'}}>
										<FontAwesomeIcon icon={faCheckCircle} />
									</span>
								)}
								{mission.failsRequired > 1 && (
									<span
										className={styles.failsRequiredIndicator}
										style={{color: 'red'}}
									>
										<FontAwesomeIcon icon={faCircle} />
									</span>
								)}
							</div>
						</button>
					))}
				</div>

				<div className={styles.tabContent}>
					{avalon.game.missions.map((mission, idx) => (
						<div
							key={`missionItem${idx}`}
							className={`${styles.tabPanel} ${activeMissionTab === idx ? styles.activePanel : styles.hiddenPanel}`}
						>
							<div className={`${styles.card} ${classForMission(mission)}`}>
								<div className={styles.cardContent}>
									<div className={styles.missionTitle}>
										Mission {idx + 1}:{' '}
										{idx === avalon.game.currentMissionIdx && avalon.game.phase !== 'ASSASSINATION'
											? 'CURRENT'
											: mission.state}
										{mission.numFails && mission.numFails > 0 && (
											<span>
												{' '}
												({mission.numFails} {mission.numFails > 1 ? 'fails' : 'fail'})
											</span>
										)}
									</div>

									{mission.state === 'PENDING' ? (
										<div className={styles.missionDetails}>
											Team Size: {mission.teamSize}
											{mission.failsRequired > 1 && (
												<span> ({mission.failsRequired} fails required)</span>
											)}
										</div>
									) : (
										<div className={styles.missionDetails}>
											<div>Team: {joinWithAnd(mission.team)}</div>
										</div>
									)}

									{avalon.game.options?.inGameLog &&
									mission.proposals &&
									mission.proposals.length > 0 ? (
										<MissionSummaryTable
											game={
												{
													...avalon.game,
													players: avalon.game.players.map((p) =>
														typeof p === 'string' ? {uid: p, name: p} : p,
													),
													missions: [mission],
													outcome: avalon.game.missionVotes
														? {
																state: 'IN_PROGRESS',
																votes: [avalon.game.missionVotes[idx]],
															}
														: undefined,
												} as any
											}
										/>
									) : null}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Missions;
