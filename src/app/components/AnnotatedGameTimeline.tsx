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
import {faCheckCircle, faTimesCircle, faCircle} from '@fortawesome/free-solid-svg-icons';
import {faThumbsUp, faThumbsDown, faCircle as faCircleRegular} from '@fortawesome/free-regular-svg-icons';
import type {Game} from '../models/game';
import type {AnnotatedMission, AnnotatedPlayerRow, AnnotatedProposal} from '../models/annotations';
import {annotateGame, formatRoleWithEmoji} from '../models/gameAnnotator';
import {isEvilRole, getPlayerRole, createGameContext} from '../models/annotations';
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

	return (
		<div className={`${styles.missionSection} ${isDoubleFail ? styles.doubleFailMission : ''}`}>
			<div className={styles.missionHeader}>
				<div className={styles.missionLabel}>
					<h4 className={styles.missionLabelTitle}>
						Mission {missionNumber}
						{isDoubleFail ? ' \u26A1' : ''}
					</h4>
					<p className={styles.missionLabelInfo}>{mission.teamSize} players</p>
					<p className={`${styles.missionLabelInfo} ${isDoubleFail ? styles.missionLabelInfoHighlight : ''}`}>
						{mission.failsRequired} fail{mission.failsRequired > 1 ? 's' : ''} required
					</p>
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
						{proposals.map((annotatedProposal) => (
							<ProposalSection
								key={annotatedProposal.proposalNumber}
								annotatedProposal={annotatedProposal}
								showSecrets={showSecrets}
							/>
						))}

						{missionVotes && mission.team.length > 0 && (
							<MissionVoteResults
								missionVotes={missionVotes}
								team={mission.team}
								game={game}
								showSecrets={showSecrets}
							/>
						)}

						{showSecrets && missionVoteAnnotations.length > 0 && (
							<div className={styles.annotationBox}>
								<strong>Mission vote notes:</strong>
								{missionVoteAnnotations.map((annotation, index) => (
									<div
										key={index}
										className={styles.annotationLine}
									>
										{annotation.commentary}
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
}

function ProposalSection({annotatedProposal, showSecrets}: ProposalSectionProps) {
	const {proposalNumber, annotations, playerRows} = annotatedProposal;

	return (
		<div className={styles.proposalCard}>
			<div className={styles.proposalHeader}>
				<strong>Proposal {proposalNumber}</strong>
			</div>

			<div className={styles.playerGrid}>
				{playerRows.map((row, index) => (
					<PlayerRow
						key={row.playerName}
						row={row}
						showSecrets={showSecrets}
						isEven={index % 2 === 0}
					/>
				))}
			</div>

			{showSecrets && annotations.length > 0 && (
				<div className={styles.annotationBox}>
					<strong>Team proposal notes:</strong>
					{annotations.map((annotation, index) => (
						<div
							key={index}
							className={styles.annotationLine}
						>
							{annotation.commentary}{' '}
							<span className={styles.predicateName}>({annotation.predicateName})</span>
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

interface PlayerRowProps {
	row: AnnotatedPlayerRow;
	showSecrets: boolean;
	isEven: boolean;
}

function PlayerRow({row, showSecrets, isEven}: PlayerRowProps) {
	const {playerName, playerRole, isLeader, isOnTeam, votedYes} = row;

	return (
		<div className={`${styles.playerRow} ${isEven ? styles.playerRowEven : styles.playerRowOdd}`}>
			{showSecrets && (
				<span className={styles.roleCell}>
					{formatRoleWithEmoji(playerRole ? toTitleCase(playerRole) : playerRole)}
				</span>
			)}
			<span className={styles.nameCell}>{toTitleCase(playerName)}</span>
			<span className={styles.proposalCell}>
				<span className="fa-layers fa-fw">
					{isLeader && (
						<FontAwesomeIcon
							icon={faCircle}
							color="yellow"
							transform="grow-13"
						/>
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
			</span>
		</div>
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
						<span className={styles.predicateName}>({annotation.predicateName})</span>
					</div>
				)),
			)}
		</div>
	);
}

// ============================================================================
// 🎯 Mission Vote Results
// ============================================================================

interface MissionVoteResultsProps {
	missionVotes: Record<string, boolean>;
	team: string[];
	game: Game;
	showSecrets: boolean;
}

function MissionVoteResults({missionVotes, team, game, showSecrets}: MissionVoteResultsProps) {
	const gameContext = createGameContext(game);

	const voteResults = team.map((playerName) => {
		const votedSuccess = missionVotes[playerName];
		const role = getPlayerRole(gameContext, playerName);
		const isEvil = isEvilRole(role);

		let voteType: 'success' | 'fail' | 'duck' = 'success';
		if (votedSuccess === false) {
			voteType = 'fail';
		} else if (votedSuccess === true && isEvil) {
			voteType = 'duck';
		}

		return {
			playerName,
			role,
			isEvil,
			votedSuccess,
			voteType,
		};
	});

	const successCount = voteResults.filter((v) => v.votedSuccess === true).length;
	const failCount = voteResults.filter((v) => v.votedSuccess === false).length;

	return (
		<div className={styles.missionVoteResults}>
			<div className={styles.missionVoteSummary}>
				<span className={styles.missionVoteCount}>
					<FontAwesomeIcon
						icon={faCheckCircle}
						color="green"
					/>{' '}
					{successCount} Success
				</span>
				<span className={styles.missionVoteCount}>
					<FontAwesomeIcon
						icon={faTimesCircle}
						color="red"
					/>{' '}
					{failCount} Fail
				</span>
			</div>
			<div className={styles.missionVoteGrid}>
				{voteResults.map((result) => (
					<div
						key={result.playerName}
						className={styles.missionVoteRow}
					>
						<span className={styles.missionVoteIcon}>
							<FontAwesomeIcon
								icon={result.votedSuccess ? faCheckCircle : faTimesCircle}
								size="lg"
								color={result.votedSuccess ? 'green' : 'red'}
							/>
						</span>
						{showSecrets && result.role && (
							<span className={styles.missionVoteRole}>
								{formatRoleWithEmoji(toTitleCase(result.role))}
							</span>
						)}
						<span className={styles.missionVoteName}>{toTitleCase(result.playerName)}</span>
						{showSecrets && result.voteType === 'duck' && <span className={styles.duckBadge}>DUCKED</span>}
						{showSecrets && result.voteType === 'fail' && result.isEvil && (
							<span className={styles.failedBadge}>FAILED</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export default AnnotatedGameTimelineComponent;
