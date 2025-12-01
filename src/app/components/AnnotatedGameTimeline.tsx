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
import {annotateGame, formatProposalOutcome, formatRoleWithEmoji, formatVoteIndicator} from '../models/gameAnnotator';
import {MissionProgressBarComponent} from './MissionProgressBar';
import {GameConclusionComponent} from './GameConclusion';

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
						totalPlayers={game.players.length}
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
	totalPlayers: number;
}

function MissionSection({annotatedMission, showSecrets, totalPlayers}: MissionSectionProps) {
	const {mission, missionNumber, state, failCount, proposals, missionVoteAnnotations} = annotatedMission;
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
							<div style={{marginBottom: '12px'}}>
								<span style={state === 'SUCCESS' ? successBadgeStyle : failBadgeStyle}>
									MISSION {state === 'SUCCESS' ? 'PASSED' : 'FAILED'}
									{state === 'FAIL' && ` (${failCount} fail${failCount !== 1 ? 's' : ''})`}
								</span>
							</div>

							{proposals.map((annotatedProposal) => (
								<ProposalSection
									key={annotatedProposal.proposalNumber}
									annotatedProposal={annotatedProposal}
									showSecrets={showSecrets}
									totalPlayers={totalPlayers}
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
	totalPlayers: number;
}

function ProposalSection({annotatedProposal, showSecrets, totalPlayers}: ProposalSectionProps) {
	const {proposal, proposalNumber, proposerRole, annotations, playerRows} = annotatedProposal;
	const yesVotes = proposal.votes.length;
	const outcomeText = formatProposalOutcome(proposal.state, yesVotes, totalPlayers);

	return (
		<div style={proposalCardStyle}>
			<div style={proposalHeaderStyle}>
				<strong>Proposal {proposalNumber}</strong> by{' '}
				<span style={{fontWeight: 'bold'}}>
					{showSecrets && proposerRole ? formatRoleWithEmoji(proposerRole) + ' ' : ''}
					{proposal.proposer}
				</span>{' '}
				<span style={proposal.state === 'APPROVED' ? approvedBadgeStyle : rejectedBadgeStyle}>
					{outcomeText}
				</span>
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
			{showSecrets && <span style={roleCellStyle}>{formatRoleWithEmoji(playerRole)}</span>}
			<span style={nameCellStyle}>{playerName}</span>
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
const successBadgeStyle: React.CSSProperties = {
	backgroundColor: '#d4edda',
	color: '#155724',
	padding: '4px 8px',
	borderRadius: '4px',
	fontSize: '12px',
	fontWeight: '600',
};

const failBadgeStyle: React.CSSProperties = {
	backgroundColor: '#f8d7da',
	color: '#721c24',
	padding: '4px 8px',
	borderRadius: '4px',
	fontSize: '12px',
	fontWeight: '600',
};

const pendingBadgeStyle: React.CSSProperties = {
	backgroundColor: '#fff3cd',
	color: '#856404',
	padding: '4px 8px',
	borderRadius: '4px',
	fontSize: '12px',
	fontWeight: '600',
};

const approvedBadgeStyle: React.CSSProperties = {
	backgroundColor: '#d1ecf1',
	color: '#0c5460',
	padding: '2px 6px',
	borderRadius: '4px',
	fontSize: '11px',
};

const rejectedBadgeStyle: React.CSSProperties = {
	backgroundColor: '#f5c6cb',
	color: '#721c24',
	padding: '2px 6px',
	borderRadius: '4px',
	fontSize: '11px',
};

export default AnnotatedGameTimelineComponent;
