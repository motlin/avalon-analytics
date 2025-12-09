import React from 'react';
import styles from './MissionSummaryTable.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faTimesCircle, faCircle} from '@fortawesome/free-solid-svg-icons';
import {faThumbsUp, faThumbsDown, faCircle as faCircleRegular} from '@fortawesome/free-regular-svg-icons';
import type {Game} from '../models/game';

interface MissionSummaryTableProps {
	game: Game;
	showSpoilers?: boolean;
}

const MissionSummaryTable: React.FC<MissionSummaryTableProps> = ({game, showSpoilers = true}) => {
	const players = game.players.map((p) => p.name);
	const missions = game.missions;
	const roles = game.outcome?.roles?.map((r) => ({
		name: r.name,
		role: r.role,
	}));
	const missionVotes = game.outcome?.votes?.reduce(
		(acc, vote, index) => {
			acc[index] = vote;
			return acc;
		},
		{} as Record<number, Record<string, boolean>>,
	);

	return (
		<table className={styles.table}>
			<tbody>
				{players.map((player, playerIndex) => (
					<tr
						key={player}
						className={playerIndex % 2 === 0 ? styles.evenRow : styles.oddRow}
					>
						<td className={styles.playerName}>
							<span className={styles.fontWeightMedium}>{player}</span>
						</td>
						{showSpoilers && roles && (
							<td className={styles.role}>{roles.find((r) => r.name === player)?.role}</td>
						)}
						{missions.flatMap((mission, missionIndex) => {
							const validProposals = mission.proposals.filter((p) => p.team.length > 0);
							const proposalCells = validProposals.map((proposal, proposalIndex) => {
								const isProposer = proposal.proposer === player;
								const isOnTeam = proposal.team.includes(player);
								const votedYes = proposal.votes.includes(player);
								const isPending = proposal.state === 'PENDING';

								return (
									<td
										key={`${player}_proposal${missionIndex}_${proposalIndex}`}
										className={styles.proposalCell}
									>
										<span className="fa-layers fa-fw">
											{isProposer && (
												<span className={styles.proposerIcon}>
													<FontAwesomeIcon
														icon={faCircle}
														color="yellow"
														transform="grow-13"
													/>
												</span>
											)}
											{isOnTeam && (
												<FontAwesomeIcon
													icon={faCircleRegular}
													transform="grow-13"
													className="fa-solid"
													color="#629ec1"
												/>
											)}
											{!isPending && (
												<FontAwesomeIcon
													icon={votedYes ? faThumbsUp : faThumbsDown}
													transform="right-1"
													color={votedYes ? 'green' : '#ed1515'}
												/>
											)}
										</span>
									</td>
								);
							});

							const missionVoteCell = (
								<td
									key={`${player}_mission${missionIndex}`}
									className={styles.missionResult}
								>
									{mission.team.includes(player) && missionVotes && (
										<span className="fa-layers fa-fw">
											<FontAwesomeIcon
												icon={
													missionVotes[missionIndex]?.[player] ? faCheckCircle : faTimesCircle
												}
												size="lg"
												color={missionVotes[missionIndex]?.[player] ? 'green' : 'red'}
											/>
										</span>
									)}
								</td>
							);

							return [...proposalCells, missionVoteCell];
						})}
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default MissionSummaryTable;
export {MissionSummaryTable};
