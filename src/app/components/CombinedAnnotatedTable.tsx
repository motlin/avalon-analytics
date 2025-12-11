import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faTimesCircle, faCircle} from '@fortawesome/free-solid-svg-icons';
import {faThumbsUp, faThumbsDown, faCircle as faCircleRegular} from '@fortawesome/free-regular-svg-icons';
import type {Game} from '../models/game';
import type {Annotation} from '../models/annotations';
import {annotateGame, formatRoleWithEmoji} from '../models/gameAnnotator';
import {getPredicateRarityCssColor, getRarestPredicateCssColor} from '../models/predicateRarity';
import styles from './CombinedAnnotatedTable.module.css';

interface PersonMapping {
	personId: string;
	personName: string;
}

interface CombinedAnnotatedTableProps {
	game: Game;
	uidToPersonMap?: Map<string, PersonMapping>;
}

function toTitleCase(text: string): string {
	return text
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function stripPlayerPrefix(commentary: string, playerName: string): string {
	const playerIndex = commentary.indexOf(playerName);
	if (playerIndex === -1) return commentary;
	const afterPlayerName = commentary.slice(playerIndex + playerName.length).trim();
	if (!afterPlayerName) return commentary;
	return afterPlayerName.charAt(0).toUpperCase() + afterPlayerName.slice(1);
}

export function CombinedAnnotatedTable({game, uidToPersonMap}: CombinedAnnotatedTableProps) {
	const annotatedGame = annotateGame(game);
	const players = game.players;
	const missionVotes = game.outcome?.votes?.reduce(
		(acc, vote, index) => {
			acc[index] = vote;
			return acc;
		},
		{} as Record<number, Record<string, boolean>>,
	);

	return (
		<div className={styles.container}>
			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<tbody>
						{players.map((player, playerIndex) => {
							const playerRole = game.outcome?.roles?.find((r) => r.name === player.name)?.role;

							return (
								<tr
									key={player.name}
									className={playerIndex % 2 === 0 ? styles.evenRow : styles.oddRow}
								>
									<td className={styles.playerName}>
										{(() => {
											const personMapping = uidToPersonMap?.get(player.uid);
											if (personMapping) {
												return (
													<a
														href={`/person/${personMapping.personId}`}
														className={`${styles.fontWeightMedium} ${styles.playerLink}`}
													>
														{player.name}
													</a>
												);
											}
											return (
												<a
													href={`/players/${player.uid}`}
													className={`${styles.fontWeightMedium} ${styles.playerLink} ${styles.unmappedPlayer}`}
												>
													{player.name}
												</a>
											);
										})()}
									</td>
									{playerRole && (
										<td className={styles.role}>{formatRoleWithEmoji(toTitleCase(playerRole))}</td>
									)}
									{annotatedGame.missions.flatMap((annotatedMission, missionIndex) => {
										const mission = annotatedMission.mission;
										const validProposals = annotatedMission.proposals.filter(
											(p) => p.proposal.team.length > 0,
										);

										const proposalCells = validProposals.map((annotatedProposal) => {
											const proposal = annotatedProposal.proposal;
											const proposalIndex = annotatedProposal.proposalNumber - 1;
											const isProposer = proposal.proposer === player.name;
											const isOnTeam = proposal.team.includes(player.name);
											const votedYes = proposal.votes.includes(player.name);
											const isPending = proposal.state === 'PENDING';

											// Get annotations for this player in this proposal
											const playerRow = annotatedProposal.playerRows.find(
												(r) => r.playerName === player.name,
											);
											const voteAnnotations = playerRow?.voteAnnotations || [];
											const proposalAnnotations = isProposer ? annotatedProposal.annotations : [];

											return (
												<td
													key={`${player.name}_m${missionIndex}_p${proposalIndex}`}
													className={styles.proposalCell}
												>
													<CellContent
														isProposer={isProposer}
														isOnTeam={isOnTeam}
														votedYes={votedYes}
														isPending={isPending}
														voteAnnotations={voteAnnotations}
														proposalAnnotations={proposalAnnotations}
													/>
												</td>
											);
										});

										const missionVoteCell = (
											<td
												key={`${player.name}_mission${missionIndex}`}
												className={styles.missionResult}
											>
												{mission.team.includes(player.name) && missionVotes && (
													<MissionVoteIcon
														votedSuccess={missionVotes[missionIndex]?.[player.name]}
														annotations={annotatedMission.missionVoteAnnotations.filter(
															(a) => a.playerName === player.name,
														)}
													/>
												)}
											</td>
										);

										return [...proposalCells, missionVoteCell];
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

interface CellContentProps {
	isProposer: boolean;
	isOnTeam: boolean;
	votedYes: boolean;
	isPending: boolean;
	voteAnnotations: Annotation[];
	proposalAnnotations: Annotation[];
}

function CellContent({
	isProposer,
	isOnTeam,
	votedYes,
	isPending,
	voteAnnotations,
	proposalAnnotations,
}: CellContentProps) {
	const allAnnotations = [...proposalAnnotations, ...voteAnnotations];
	const visibleAnnotations = allAnnotations.filter((a) => !a.hidden);
	const hasVisibleAnnotations = visibleAnnotations.length > 0;
	const dotColor = hasVisibleAnnotations
		? getRarestPredicateCssColor(visibleAnnotations.map((a) => a.predicateName))
		: undefined;

	return (
		<span
			className={hasVisibleAnnotations ? `${styles.tooltipWrapper} ${styles.hasAnnotation}` : undefined}
			style={dotColor ? ({'--annotation-dot-color': dotColor} as React.CSSProperties) : undefined}
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
			{hasVisibleAnnotations && (
				<span className={styles.tooltip}>
					{visibleAnnotations.map((annotation, index) => (
						<span
							key={index}
							className={styles.tooltipLine}
						>
							{stripPlayerPrefix(annotation.commentary, annotation.playerName)}{' '}
							<span
								className={styles.tooltipPredicateName}
								style={{color: getPredicateRarityCssColor(annotation.predicateName)}}
							>
								({annotation.predicateName})
							</span>
						</span>
					))}
				</span>
			)}
		</span>
	);
}

interface MissionVoteIconProps {
	votedSuccess: boolean | undefined;
	annotations: Annotation[];
}

function MissionVoteIcon({votedSuccess, annotations}: MissionVoteIconProps) {
	if (votedSuccess === undefined) return null;

	const visibleAnnotations = annotations.filter((a) => !a.hidden);
	const hasVisibleAnnotations = visibleAnnotations.length > 0;
	const dotColor = hasVisibleAnnotations
		? getRarestPredicateCssColor(visibleAnnotations.map((a) => a.predicateName))
		: undefined;

	return (
		<span
			className={hasVisibleAnnotations ? `${styles.tooltipWrapper} ${styles.hasAnnotation}` : undefined}
			style={dotColor ? ({'--annotation-dot-color': dotColor} as React.CSSProperties) : undefined}
		>
			<span className="fa-layers fa-fw">
				<FontAwesomeIcon
					icon={votedSuccess ? faCheckCircle : faTimesCircle}
					size="lg"
					color={votedSuccess ? 'green' : 'red'}
				/>
			</span>
			{hasVisibleAnnotations && (
				<span className={styles.tooltip}>
					{visibleAnnotations.map((annotation, index) => (
						<span
							key={index}
							className={styles.tooltipLine}
						>
							{stripPlayerPrefix(annotation.commentary, annotation.playerName)}{' '}
							<span
								className={styles.tooltipPredicateName}
								style={{color: getPredicateRarityCssColor(annotation.predicateName)}}
							>
								({annotation.predicateName})
							</span>
						</span>
					))}
				</span>
			)}
		</span>
	);
}

export default CombinedAnnotatedTable;
