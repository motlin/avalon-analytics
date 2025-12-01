/**
 * 🎯 Annotated Game Timeline
 *
 * Displays a detailed game log with annotations similar to the Java avalon-log-scraper output.
 * Shows proposal/vote notes, player roles with emoji indicators, and team composition icons.
 */

'use client';

import {useState} from 'react';
import type {Game} from '../models/game';
import type {AnnotatedGame, AnnotatedMission, AnnotatedPlayerRow, AnnotatedProposal} from '../models/annotations';
import {annotateGame, formatRoleWithEmoji, formatVoteIndicator} from '../models/gameAnnotator';
import {isEvilRole, getPlayerRole, createGameContext} from '../models/annotations';
import {MissionProgressBarComponent} from './MissionProgressBar';
import {GameConclusionComponent} from './GameConclusion';

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
		<div style={containerStyle}>
			<h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px'}}>Annotated Game Timeline</h2>

			<button
				style={revealButtonStyle(showSecrets)}
				onClick={() => setShowSecrets(!showSecrets)}
			>
				{showSecrets ? 'Hide Secrets' : 'Reveal Secrets'}
			</button>

			<div style={cardStyle}>
				<div style={headerStyle}>
					<h3 style={titleStyle}>Game Log with Annotations</h3>
					{game.outcome && (
						<p style={outcomeTextStyle(showSecrets)}>
							{showSecrets ? `${winner} Victory - ${game.outcome.reason || game.outcome.message}` : ''}
						</p>
					)}
				</div>

				<div style={{marginBottom: '48px'}}>
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
					<div style={missionSectionStyle}>
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
		<div style={isDoubleFail ? doubleFailMissionStyle : missionSectionStyle}>
			<div style={missionHeaderStyle}>
				<div style={missionLabelStyle}>
					<h4 style={{fontWeight: '600', marginBottom: '4px'}}>
						Mission {missionNumber}
						{isDoubleFail ? ' \u26A1' : ''}
					</h4>
					<p style={{fontSize: '14px', color: '#6b7280', marginBottom: '2px'}}>{mission.teamSize} players</p>
					<p
						style={{
							fontSize: '14px',
							color: isDoubleFail ? '#7c3aed' : '#6b7280',
							fontWeight: isDoubleFail ? '600' : 'normal',
						}}
					>
						{mission.failsRequired} fail{mission.failsRequired > 1 ? 's' : ''} required
					</p>
				</div>

				<div style={missionContentStyle}>
					{missionNotPlayed ? (
						<div style={{...simpleCardStyle, opacity: 0.6}}>
							<span style={pendingBadgeStyle}>NOT PLAYED</span>
							<p style={{fontSize: '14px', color: '#6b7280', marginTop: '8px'}}>
								Mission not completed - Game ended earlier
							</p>
						</div>
					) : (
						<>
							{missionVotes && mission.team.length > 0 && (
								<MissionVoteResults
									missionVotes={missionVotes}
									team={mission.team}
									game={game}
									showSecrets={showSecrets}
								/>
							)}

							{proposals.map((annotatedProposal) => (
								<ProposalSection
									key={annotatedProposal.proposalNumber}
									annotatedProposal={annotatedProposal}
									showSecrets={showSecrets}
								/>
							))}

							{showSecrets && missionVoteAnnotations.length > 0 && (
								<div style={annotationBoxStyle}>
									<strong>Mission vote notes:</strong>
									{missionVoteAnnotations.map((annotation, index) => (
										<div
											key={index}
											style={annotationLineStyle}
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
		<div style={proposalCardStyle}>
			<div style={proposalHeaderStyle}>
				<strong>Proposal {proposalNumber}</strong>
			</div>

			<div style={playerGridStyle}>
				{playerRows.map((row) => (
					<PlayerRow
						key={row.playerName}
						row={row}
						showSecrets={showSecrets}
					/>
				))}
			</div>

			{showSecrets && annotations.length > 0 && (
				<div style={annotationBoxStyle}>
					<strong>Team proposal notes:</strong>
					{annotations.map((annotation, index) => (
						<div
							key={index}
							style={annotationLineStyle}
						>
							{annotation.commentary} <span style={predicateNameStyle}>({annotation.predicateName})</span>
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
}

function PlayerRow({row, showSecrets}: PlayerRowProps) {
	const {playerName, playerRole, isLeader, isOnTeam, votedYes} = row;

	const leaderIcon = isLeader ? '\uD83D\uDC51' : '\u2B1C'; // 👑 or ⬜
	const teamIcon = isOnTeam ? '\u2611\uFE0F' : '\u2B1C'; // ☑️ or ⬜
	const voteIcon = formatVoteIndicator(votedYes);

	return (
		<div style={playerRowStyle}>
			<span style={iconCellStyle}>{leaderIcon}</span>
			<span style={iconCellStyle}>{teamIcon}</span>
			{showSecrets && (
				<span style={roleCellStyle}>
					{formatRoleWithEmoji(playerRole ? toTitleCase(playerRole) : playerRole)}
				</span>
			)}
			<span style={nameCellStyle}>{toTitleCase(playerName)}</span>
			<span style={iconCellStyle}>{voteIcon}</span>
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
		<div style={annotationBoxStyle}>
			<strong>Vote notes:</strong>
			{rowsWithAnnotations.flatMap((row) =>
				row.voteAnnotations.map((annotation, index) => (
					<div
						key={`${row.playerName}-${index}`}
						style={annotationLineStyle}
					>
						{annotation.commentary} <span style={predicateNameStyle}>({annotation.predicateName})</span>
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
		<div style={missionVoteResultsStyle}>
			<div style={missionVoteSummaryStyle}>
				<span style={missionVoteCountStyle}>
					<span style={successVoteIconStyle}>&#x2714;</span> {successCount} Success
				</span>
				<span style={missionVoteCountStyle}>
					<span style={failVoteIconStyle}>&#x2716;</span> {failCount} Fail
				</span>
			</div>
			<div style={missionVoteGridStyle}>
				{voteResults.map((result) => (
					<div
						key={result.playerName}
						style={missionVoteRowStyle}
					>
						<span style={result.votedSuccess ? successVoteIconStyle : failVoteIconStyle}>
							{result.votedSuccess ? '\u2714' : '\u2716'}
						</span>
						{showSecrets && result.role && (
							<span style={missionVoteRoleStyle}>{formatRoleWithEmoji(toTitleCase(result.role))}</span>
						)}
						<span style={missionVoteNameStyle}>{toTitleCase(result.playerName)}</span>
						{showSecrets && result.voteType === 'duck' && <span style={duckBadgeStyle}>DUCKED</span>}
						{showSecrets && result.voteType === 'fail' && result.isEvil && (
							<span style={failedBadgeStyle}>FAILED</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

// ============================================================================
// 🎨 Styles
// ============================================================================

const containerStyle: React.CSSProperties = {
	maxWidth: '1200px',
	margin: '0 auto',
	padding: '32px',
};

const cardStyle: React.CSSProperties = {
	background: 'white',
	borderRadius: '8px',
	boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
	border: '1px solid #e5e7eb',
	padding: '40px',
};

const simpleCardStyle: React.CSSProperties = {
	background: 'white',
	borderRadius: '8px',
	boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
	border: '1px solid #e5e7eb',
	padding: '16px',
};

const headerStyle: React.CSSProperties = {
	textAlign: 'center',
	marginBottom: '16px',
};

const titleStyle: React.CSSProperties = {
	fontSize: '28px',
	fontWeight: 'bold',
	marginBottom: '8px',
};

const outcomeTextStyle = (showSecrets: boolean): React.CSSProperties => ({
	color: '#6b7280',
	backgroundColor: showSecrets ? 'transparent' : '#1f2937',
	padding: '2px 8px',
	borderRadius: '4px',
	display: 'inline-block',
	transition: 'all 0.3s ease',
});

const revealButtonStyle = (showSecrets: boolean): React.CSSProperties => ({
	backgroundColor: showSecrets ? '#dc2626' : '#4f46e5',
	color: 'white',
	border: 'none',
	padding: '8px 16px',
	borderRadius: '6px',
	fontSize: '14px',
	fontWeight: '500',
	cursor: 'pointer',
	marginBottom: '24px',
});

const missionSectionStyle: React.CSSProperties = {
	marginBottom: '48px',
};

const doubleFailMissionStyle: React.CSSProperties = {
	...missionSectionStyle,
	border: '2px solid #7c3aed',
	borderRadius: '8px',
	padding: '24px',
	marginLeft: '-24px',
	marginRight: '-24px',
};

const missionHeaderStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'flex-start',
	gap: '24px',
	marginBottom: '24px',
};

const missionLabelStyle: React.CSSProperties = {
	width: '140px',
	textAlign: 'right',
	flexShrink: 0,
};

const missionContentStyle: React.CSSProperties = {
	flex: 1,
};

const proposalCardStyle: React.CSSProperties = {
	backgroundColor: '#f9fafb',
	borderRadius: '6px',
	padding: '16px',
	marginBottom: '16px',
	border: '1px solid #e5e7eb',
};

const proposalHeaderStyle: React.CSSProperties = {
	marginBottom: '12px',
	fontSize: '14px',
};

const playerGridStyle: React.CSSProperties = {
	fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
	fontSize: '13px',
	lineHeight: '1.8',
};

const playerRowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
};

const iconCellStyle: React.CSSProperties = {
	width: '24px',
	textAlign: 'center',
	flexShrink: 0,
};

const roleCellStyle: React.CSSProperties = {
	minWidth: '160px',
	whiteSpace: 'nowrap',
	flexShrink: 0,
};

const nameCellStyle: React.CSSProperties = {
	minWidth: '100px',
	fontWeight: '500',
	flexShrink: 0,
};

const annotationBoxStyle: React.CSSProperties = {
	marginTop: '12px',
	padding: '12px',
	backgroundColor: '#fef3c7',
	borderRadius: '4px',
	fontSize: '13px',
	border: '1px solid #fcd34d',
};

const annotationLineStyle: React.CSSProperties = {
	marginTop: '4px',
	paddingLeft: '8px',
};

const predicateNameStyle: React.CSSProperties = {
	color: '#92400e',
	fontSize: '11px',
	fontStyle: 'italic',
};

// Badge styles
const pendingBadgeStyle: React.CSSProperties = {
	backgroundColor: '#fff3cd',
	color: '#856404',
	padding: '4px 8px',
	borderRadius: '4px',
	fontSize: '12px',
	fontWeight: '600',
};

// Mission vote result styles
const missionVoteResultsStyle: React.CSSProperties = {
	backgroundColor: '#f0f9ff',
	borderRadius: '6px',
	padding: '12px 16px',
	marginBottom: '16px',
	border: '1px solid #bae6fd',
};

const missionVoteSummaryStyle: React.CSSProperties = {
	display: 'flex',
	gap: '16px',
	marginBottom: '8px',
	fontWeight: '600',
	fontSize: '14px',
};

const missionVoteCountStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: '4px',
};

const missionVoteGridStyle: React.CSSProperties = {
	fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
	fontSize: '13px',
	lineHeight: '1.8',
};

const missionVoteRowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
};

const successVoteIconStyle: React.CSSProperties = {
	color: '#16a34a',
	fontWeight: 'bold',
	width: '20px',
	textAlign: 'center',
};

const failVoteIconStyle: React.CSSProperties = {
	color: '#dc2626',
	fontWeight: 'bold',
	width: '20px',
	textAlign: 'center',
};

const missionVoteRoleStyle: React.CSSProperties = {
	minWidth: '160px',
	whiteSpace: 'nowrap',
	flexShrink: 0,
};

const missionVoteNameStyle: React.CSSProperties = {
	minWidth: '100px',
	fontWeight: '500',
	flexShrink: 0,
};

const duckBadgeStyle: React.CSSProperties = {
	backgroundColor: '#fef3c7',
	color: '#92400e',
	padding: '2px 6px',
	borderRadius: '4px',
	fontSize: '10px',
	fontWeight: '600',
	marginLeft: '8px',
};

const failedBadgeStyle: React.CSSProperties = {
	backgroundColor: '#fee2e2',
	color: '#991b1b',
	padding: '2px 6px',
	borderRadius: '4px',
	fontSize: '10px',
	fontWeight: '600',
	marginLeft: '8px',
};

export default AnnotatedGameTimelineComponent;
