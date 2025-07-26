import React, {useState} from 'react';
import type {Game, Mission, Proposal} from '../models/game';
import {MissionProgressBarComponent} from './MissionProgressBar';
import {ProposalCardComponent} from './ProposalCard';
import {PlayerPillComponent} from './PlayerPill';
import {GameConclusionComponent} from './GameConclusion';
import {Badge as UiBadge} from './ui/badge';

export type BadgeStatus = 'success' | 'fail' | 'pending' | 'approved' | 'rejected';

interface BadgeProps {
	status: BadgeStatus;
	text?: string;
}

const statusConfig: Record<BadgeStatus, {backgroundColor: string; color: string; defaultText: string}> = {
	success: {
		backgroundColor: '#d4edda',
		color: '#155724',
		defaultText: 'Success',
	},
	fail: {
		backgroundColor: '#f8d7da',
		color: '#721c24',
		defaultText: 'Fail',
	},
	pending: {
		backgroundColor: '#fff3cd',
		color: '#856404',
		defaultText: 'Pending',
	},
	approved: {
		backgroundColor: '#d1ecf1',
		color: '#0c5460',
		defaultText: 'Approved',
	},
	rejected: {
		backgroundColor: '#f5c6cb',
		color: '#721c24',
		defaultText: 'Rejected',
	},
};

export function Badge({status, text}: BadgeProps) {
	const config = statusConfig[status];
	const variantMap: Record<BadgeStatus, 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
		success: 'success',
		fail: 'destructive',
		pending: 'warning',
		approved: 'secondary',
		rejected: 'destructive',
	};

	return <UiBadge variant={variantMap[status]}>{text || config.defaultText}</UiBadge>;
}

interface GameTimelineProps {
	game: Game;
	showSecrets?: boolean;
}

export function GameTimelineComponent({game, showSecrets: initialShowSecrets = false}: GameTimelineProps) {
	const [showSecrets, setShowSecrets] = useState(initialShowSecrets);

	const getOutcomeText = () => {
		if (!game.outcome) return '';
		const winner = game.outcome.winner;
		const reason = game.outcome.reason || game.outcome.message;
		return `${winner} Victory - ${reason}`;
	};

	const getMissionLabel = (mission: Mission, index: number) => {
		const isDoubleFail = mission.failsRequired === 2;
		return `Mission ${index + 1}${isDoubleFail ? ' ⚡' : ''}`;
	};

	const getApprovedProposal = (mission: Mission): Proposal | undefined => {
		return mission.proposals.find((proposal) => proposal.state === 'APPROVED');
	};

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

	const headerStyle: React.CSSProperties = {
		textAlign: 'center',
		marginBottom: '16px',
	};

	const titleStyle: React.CSSProperties = {
		fontSize: '28px',
		fontWeight: 'bold',
		marginBottom: '8px',
	};

	const outcomeTextStyle: React.CSSProperties = {
		color: '#6b7280',
		backgroundColor: showSecrets ? 'transparent' : '#1f2937',
		padding: '2px 8px',
		borderRadius: '4px',
		display: 'inline-block',
		transition: 'all 0.3s ease',
	};

	const revealButtonStyle: React.CSSProperties = {
		backgroundColor: showSecrets ? '#dc2626' : '#4f46e5',
		color: 'white',
		border: 'none',
		padding: '8px 16px',
		borderRadius: '6px',
		fontSize: '14px',
		fontWeight: '500',
		cursor: 'pointer',
		marginBottom: '24px',
	};

	const missionSectionStyle: React.CSSProperties = {
		marginBottom: '48px',
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

	const missionResultStyle: React.CSSProperties = {
		backgroundColor: '#f3f4f6',
		borderRadius: '6px',
		padding: '16px',
		marginTop: '16px',
	};

	const secretContentStyle: React.CSSProperties = {
		display: showSecrets ? 'block' : 'none',
		marginTop: '8px',
	};

	const playerListStyle: React.CSSProperties = {
		marginTop: '48px',
		paddingTop: '32px',
		borderTop: '1px solid #e5e7eb',
	};

	const playerGridStyle: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'center',
		flexWrap: 'wrap',
		gap: '8px',
	};

	return (
		<div style={containerStyle}>
			<h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px'}}>
				Avalon Game Timeline - Detailed View
			</h2>

			<button
				style={revealButtonStyle}
				onClick={() => setShowSecrets(!showSecrets)}
			>
				{showSecrets ? 'Hide Secrets' : 'Reveal Secrets'}
			</button>

			<div style={cardStyle}>
				<div style={headerStyle}>
					<h3 style={titleStyle}>Game Timeline</h3>
					{game.outcome && <p style={outcomeTextStyle}>{showSecrets ? getOutcomeText() : ''}</p>}
				</div>

				<div style={{marginBottom: '48px'}}>
					<MissionProgressBarComponent missions={game.missions} />
				</div>

				{game.missions.map((mission, missionIndex) => {
					const isDoubleFail = mission.failsRequired === 2;
					const approvedProposal = getApprovedProposal(mission);
					const missionNotPlayed = mission.state === 'PENDING' && !approvedProposal;

					const missionWrapperStyle: React.CSSProperties = isDoubleFail
						? {
								...missionSectionStyle,
								border: '2px solid #7c3aed',
								borderRadius: '8px',
								padding: '24px',
								marginLeft: '-24px',
								marginRight: '-24px',
							}
						: missionSectionStyle;

					return (
						<div
							key={missionIndex}
							style={missionWrapperStyle}
						>
							<div style={missionHeaderStyle}>
								<div style={missionLabelStyle}>
									<h4 style={{fontWeight: '600', marginBottom: '4px'}}>
										{getMissionLabel(mission, missionIndex)}
									</h4>
									<p style={{fontSize: '14px', color: '#6b7280', marginBottom: '2px'}}>
										{mission.teamSize} players
									</p>
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
										<div style={{...cardStyle, padding: '16px', opacity: 0.6}}>
											<Badge
												status="pending"
												text="NOT PLAYED"
											/>
											<p style={{fontSize: '14px', color: '#6b7280', marginTop: '8px'}}>
												Mission not completed - Game ended after Mission {missionIndex}
											</p>
											{showSecrets && game.outcome && (
												<div style={secretContentStyle}>
													<p style={{fontSize: '14px', fontWeight: '500', color: '#7c3aed'}}>
														Secret: {getOutcomeText()}
													</p>
												</div>
											)}
										</div>
									) : (
										<>
											<div style={{marginBottom: '12px'}}>
												<Badge
													status={mission.state === 'SUCCESS' ? 'success' : 'fail'}
													text={`MISSION ${mission.state === 'SUCCESS' ? 'PASSED' : 'FAILED'}`}
												/>
											</div>

											<h5 style={{fontWeight: '600', marginBottom: '12px'}}>Proposals</h5>

											{mission.proposals.map((proposal, proposalIndex) => (
												<ProposalCardComponent
													key={proposalIndex}
													proposal={proposal}
													proposalNumber={proposalIndex + 1}
												/>
											))}

											{approvedProposal && (
												<div style={missionResultStyle}>
													<h5 style={{fontWeight: '600', marginBottom: '8px'}}>
														Mission Result
													</h5>
													<p style={{fontSize: '14px'}}>
														Number of fail cards: {mission.numFails || 0}
													</p>
													<p
														style={{
															fontSize: '14px',
															color: mission.state === 'SUCCESS' ? '#6b7280' : '#dc2626',
														}}
													>
														Mission {mission.state === 'SUCCESS' ? 'succeeded' : 'failed'}
														{isDoubleFail &&
															mission.state === 'SUCCESS' &&
															' (2 fails were required)'}
													</p>
													{showSecrets && (
														<div style={secretContentStyle}>
															<p
																style={{
																	fontSize: '14px',
																	fontWeight: '500',
																	color:
																		mission.state === 'SUCCESS'
																			? '#3b82f6'
																			: '#dc2626',
																}}
															>
																Secret:{' '}
																{mission.state === 'SUCCESS'
																	? 'No evil players sabotaged this mission'
																	: `${mission.numFails} player(s) sabotaged this mission`}
															</p>
														</div>
													)}
												</div>
											)}
										</>
									)}
								</div>
							</div>
						</div>
					);
				})}

				{game.outcome && (
					<div style={missionSectionStyle}>
						<GameConclusionComponent
							winner={(game.outcome.winner || 'GOOD') as 'GOOD' | 'EVIL'}
							reason={game.outcome.reason || game.outcome.message || ''}
							roles={game.players.map((player) => ({
								name: player.name,
								role: player.role || 'Unknown',
								assassin: player.role === 'Evil Minion',
							}))}
						/>
					</div>
				)}

				<div style={playerListStyle}>
					<h4 style={{fontWeight: '600', marginBottom: '12px', textAlign: 'center'}}>Players</h4>
					<div style={playerGridStyle}>
						{game.players.map((player) => (
							<PlayerPillComponent
								key={player.uid}
								player={player}
								showRole={showSecrets}
								size="large"
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
