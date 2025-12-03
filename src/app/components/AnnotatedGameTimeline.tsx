/**
 * 🎯 Annotated Game Timeline
 *
 * Displays a detailed game log with annotations similar to the Java avalon-log-scraper output.
 * Shows proposal/vote notes, player roles with emoji indicators, and team composition icons.
 */

'use client';

import {useState} from 'react';
import '@fortawesome/fontawesome-svg-core/styles.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faTimesCircle, faCrown, faHammer, faCircle} from '@fortawesome/free-solid-svg-icons';
import {faThumbsUp, faThumbsDown, faCircle as faCircleRegular} from '@fortawesome/free-regular-svg-icons';
import type {Game} from '../models/game';
import type {Annotation, AnnotatedMission, AnnotatedPlayerRow, AnnotatedProposal} from '../models/annotations';
import {annotateGame, formatRoleWithEmoji} from '../models/gameAnnotator';
import {getPredicateRarityCssColor} from '../models/predicateRarity';
import {MissionProgressBarComponent} from './MissionProgressBar';
import {GameConclusionComponent} from './GameConclusion';
import styles from './AnnotatedGameTimeline.module.css';

/**
 * Converts a string to title case (e.g., "CRAIG" -> "Craig", "EVIL MINION" -> "Evil Minion")
 */
function toTitleCase(text: string): string {
	return text
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Strips the player name/role prefix from annotation commentary for tooltip display.
 * Commentary format is typically: "emoji Role PlayerName did something"
 * This function removes "emoji Role PlayerName " prefix and capitalizes the first letter.
 *
 * @param commentary - The full commentary text
 * @param playerName - The player's name to strip from the prefix
 * @returns The commentary without the player prefix, with first letter capitalized
 */
function stripPlayerPrefix(commentary: string, playerName: string): string {
	// Find the player name in the commentary and remove everything before and including it
	const playerIndex = commentary.indexOf(playerName);
	if (playerIndex === -1) {
		return commentary;
	}

	// Extract the action part (everything after player name)
	const afterPlayerName = commentary.slice(playerIndex + playerName.length).trim();
	if (!afterPlayerName) {
		return commentary;
	}

	// Capitalize the first letter
	return afterPlayerName.charAt(0).toUpperCase() + afterPlayerName.slice(1);
}

interface AnnotatedGameTimelineProps {
	game: Game;
	showSecrets?: boolean;
}

function deriveWinner(outcome: Game['outcome']): 'GOOD' | 'EVIL' {
	if (!outcome) return 'GOOD';
	if (outcome.winner === 'GOOD' || outcome.winner === 'EVIL') return outcome.winner;
	return outcome.state === 'GOOD_WIN' ? 'GOOD' : 'EVIL';
}

export function AnnotatedGameTimelineComponent({
	game,
	showSecrets: initialShowSecrets = false,
}: AnnotatedGameTimelineProps) {
	const [showSecrets, setShowSecrets] = useState(initialShowSecrets);
	const annotatedGame = annotateGame(game);
	const winner = deriveWinner(game.outcome);

	return (
		<div className={styles.container}>
			<h2 className={styles.title}>Annotated Game Timeline</h2>

			<button
				className={`${styles.revealButton} ${showSecrets ? styles.revealButtonActive : ''}`}
				onClick={() => setShowSecrets(!showSecrets)}
			>
				{showSecrets ? 'Hide Secrets' : 'Reveal Secrets'}
			</button>

			<div className={styles.card}>
				<div className={styles.header}>
					<h3 className={styles.headerTitle}>Game Log with Annotations</h3>
					{game.outcome && (
						<p className={`${styles.outcomeText} ${!showSecrets ? styles.outcomeHidden : ''}`}>
							{showSecrets ? `${winner} Victory - ${game.outcome.reason || game.outcome.message}` : ''}
						</p>
					)}
				</div>

				<div className={styles.progressBarWrapper}>
					<MissionProgressBarComponent missions={game.missions} />
				</div>

				{annotatedGame.missions.map((annotatedMission) => (
					<MissionSection
						key={annotatedMission.missionNumber}
						annotatedMission={annotatedMission}
						showSecrets={showSecrets}
						game={game}
					/>
				))}

				{game.outcome && (
					<div className={styles.conclusionWrapper}>
						<GameConclusionComponent
							winner={winner}
							reason={game.outcome.reason || game.outcome.message || ''}
							roles={game.players.map((player) => ({
								name: player.name,
								role: player.role || 'Unknown',
								assassin: player.role === 'Evil Minion',
							}))}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

// ============================================================================
// 🎯 Mission Section
// ============================================================================

interface MissionSectionProps {
	annotatedMission: AnnotatedMission;
	showSecrets: boolean;
	game: Game;
}

function MissionSection({annotatedMission, showSecrets, game}: MissionSectionProps) {
	const {mission, missionNumber, state, proposals, missionVoteAnnotations} = annotatedMission;
	const missionVotes = game.outcome?.votes?.[missionNumber - 1];
	const isDoubleFail = mission.failsRequired === 2;
	const missionNotPlayed = state === 'PENDING' && proposals.length === 0;
	const lastProposalIndex = proposals.length - 1;

	return (
		<div className={`${styles.missionSection} ${isDoubleFail ? styles.doubleFailMission : ''}`}>
			<div className={styles.missionHeader}>
				<div className={styles.missionLabel}>
					<h4 className={styles.missionLabelTitle}>
						Mission {missionNumber}
						{isDoubleFail ? ' \u26A1' : ''}
					</h4>
				</div>
			</div>

			<div className={styles.missionContent}>
				{missionNotPlayed ? (
					<div className={styles.pendingCard}>
						<span className={styles.pendingBadge}>NOT PLAYED</span>
						<p className={styles.pendingText}>Mission not completed - Game ended earlier</p>
					</div>
				) : (
					<>
						{proposals.map((annotatedProposal, index) => (
							<ProposalSection
								key={annotatedProposal.proposalNumber}
								annotatedProposal={annotatedProposal}
								showSecrets={showSecrets}
								missionNumber={missionNumber}
								missionVotes={index === lastProposalIndex ? missionVotes : undefined}
								missionVoteAnnotations={index === lastProposalIndex ? missionVoteAnnotations : []}
								team={mission.team}
							/>
						))}

						{showSecrets && missionVoteAnnotations.length > 0 && (
							<div className={styles.annotationBox}>
								<strong>Mission vote notes:</strong>
								{missionVoteAnnotations.map((annotation, index) => (
									<div
										key={index}
										className={styles.annotationLine}
									>
										{annotation.commentary}{' '}
										<span
											className={styles.predicateName}
											style={{color: getPredicateRarityCssColor(annotation.predicateName)}}
										>
											({annotation.predicateName})
										</span>
									</div>
								))}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

// ============================================================================
// 🗳️ Proposal Section
// ============================================================================

interface ProposalSectionProps {
	annotatedProposal: AnnotatedProposal;
	showSecrets: boolean;
	missionNumber: number;
	missionVotes?: Record<string, boolean>;
	missionVoteAnnotations: Annotation[];
	team: string[];
}

function ProposalSection({
	annotatedProposal,
	showSecrets,
	missionNumber,
	missionVotes,
	missionVoteAnnotations,
	team,
}: ProposalSectionProps) {
	const {proposalNumber, annotations, playerRows} = annotatedProposal;

	return (
		<div className={styles.proposalCard}>
			<div className={styles.proposalHeader}>
				<strong>
					Mission {missionNumber}: Proposal {proposalNumber}
				</strong>
			</div>

			<table className={styles.playerGrid}>
				<tbody>
					{playerRows.map((row, index) => {
						const isOnFinalTeam = team.includes(row.playerName);
						const missionVote =
							missionVotes && isOnFinalTeam ? {votedSuccess: missionVotes[row.playerName]} : undefined;
						const playerMissionVoteAnnotations = missionVoteAnnotations.filter(
							(annotation) => annotation.playerName === row.playerName,
						);
						return (
							<PlayerRow
								key={row.playerName}
								row={row}
								showSecrets={showSecrets}
								isEven={index % 2 === 0}
								hasMissionVotes={missionVotes !== undefined}
								missionVote={missionVote}
								missionVoteAnnotations={playerMissionVoteAnnotations}
								proposalNumber={proposalNumber}
								proposalAnnotations={annotations}
							/>
						);
					})}
				</tbody>
			</table>

			{showSecrets && annotations.length > 0 && (
				<div className={styles.annotationBox}>
					<strong>Team proposal notes:</strong>
					{annotations.map((annotation, index) => (
						<div
							key={index}
							className={styles.annotationLine}
						>
							{annotation.commentary}{' '}
							<span
								className={styles.predicateName}
								style={{color: getPredicateRarityCssColor(annotation.predicateName)}}
							>
								({annotation.predicateName})
							</span>
						</div>
					))}
				</div>
			)}

			{showSecrets && playerRows.some((row) => row.voteAnnotations.length > 0) && (
				<VoteAnnotations playerRows={playerRows} />
			)}
		</div>
	);
}

// ============================================================================
// 👤 Player Row
// ============================================================================

interface MissionVote {
	votedSuccess: boolean | undefined;
}

interface PlayerRowProps {
	row: AnnotatedPlayerRow;
	showSecrets: boolean;
	isEven: boolean;
	hasMissionVotes: boolean;
	missionVote?: MissionVote;
	missionVoteAnnotations: Annotation[];
	proposalNumber: number;
	proposalAnnotations: Annotation[];
}

function PlayerRow({
	row,
	showSecrets,
	isEven,
	hasMissionVotes,
	missionVote,
	missionVoteAnnotations,
	proposalNumber,
	proposalAnnotations,
}: PlayerRowProps) {
	const {playerName, playerRole, isLeader, isHammer, isOnTeam, votedYes, voteAnnotations} = row;
	const crownColor = proposalNumber < 5 ? '#fcfc00' : '#cc0808';
	const hasProposalAnnotations = showSecrets && isLeader && proposalAnnotations.length > 0;
	const hasVoteAnnotations = showSecrets && voteAnnotations.length > 0;
	const hasMissionVoteAnnotations = showSecrets && missionVoteAnnotations.length > 0;

	return (
		<tr className={isEven ? styles.playerRowEven : styles.playerRowOdd}>
			<td className={styles.statusCell}>
				{isLeader && (
					<span
						className={
							hasProposalAnnotations ? `${styles.crownTooltipWrapper} ${styles.hasAnnotation}` : undefined
						}
					>
						<span className="fa-layers fa-fw">
							<FontAwesomeIcon
								icon={faCrown}
								color={crownColor}
							/>
							<span
								className="fa-layers-text"
								style={{fontSize: '0.5em', fontWeight: 'bold'}}
							>
								{proposalNumber}
							</span>
						</span>
						{hasProposalAnnotations && (
							<span className={styles.crownTooltip}>
								{proposalAnnotations.map((annotation, index) => (
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
				)}
				{isHammer && !isLeader && <FontAwesomeIcon icon={faHammer} />}
			</td>
			<td className={styles.nameCell}>{playerName}</td>
			{showSecrets && (
				<td className={styles.roleCell}>
					{formatRoleWithEmoji(playerRole ? toTitleCase(playerRole) : playerRole)}
				</td>
			)}
			<td className={styles.proposalCell}>
				<span
					className={
						hasVoteAnnotations ? `${styles.proposalVoteTooltipWrapper} ${styles.hasAnnotation}` : undefined
					}
				>
					<span className="fa-layers fa-fw">
						{isLeader && (
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
						{votedYes !== null && (
							<FontAwesomeIcon
								icon={votedYes ? faThumbsUp : faThumbsDown}
								transform="right-1"
								color={votedYes ? 'green' : '#ed1515'}
							/>
						)}
					</span>
					{hasVoteAnnotations && (
						<span className={styles.proposalVoteTooltip}>
							{voteAnnotations.map((annotation, index) => (
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
			</td>
			<td className={styles.missionResultCell}>
				{hasMissionVotes && missionVote && missionVote.votedSuccess !== undefined && (
					<span
						className={
							hasMissionVoteAnnotations
								? `${styles.missionVoteTooltipWrapper} ${styles.hasAnnotation}`
								: undefined
						}
					>
						<span className="fa-layers fa-fw">
							<FontAwesomeIcon
								icon={missionVote.votedSuccess ? faCheckCircle : faTimesCircle}
								size="lg"
								color={missionVote.votedSuccess ? 'green' : 'red'}
							/>
						</span>
						{hasMissionVoteAnnotations && (
							<span className={styles.missionVoteTooltip}>
								{missionVoteAnnotations.map((annotation, index) => (
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
				)}
			</td>
		</tr>
	);
}

// ============================================================================
// 📝 Vote Annotations
// ============================================================================

interface VoteAnnotationsProps {
	playerRows: AnnotatedPlayerRow[];
}

function VoteAnnotations({playerRows}: VoteAnnotationsProps) {
	const rowsWithAnnotations = playerRows.filter((row) => row.voteAnnotations.length > 0);
	if (rowsWithAnnotations.length === 0) return null;

	return (
		<div className={styles.annotationBox}>
			<strong>Vote notes:</strong>
			{rowsWithAnnotations.flatMap((row) =>
				row.voteAnnotations.map((annotation, index) => (
					<div
						key={`${row.playerName}-${index}`}
						className={styles.annotationLine}
					>
						{annotation.commentary}{' '}
						<span
							className={styles.predicateName}
							style={{color: getPredicateRarityCssColor(annotation.predicateName)}}
						>
							({annotation.predicateName})
						</span>
					</div>
				)),
			)}
		</div>
	);
}

export default AnnotatedGameTimelineComponent;
