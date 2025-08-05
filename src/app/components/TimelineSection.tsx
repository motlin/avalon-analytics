import {useState} from 'react';
import type {Game, Mission, Proposal} from '../models/game';

export interface TimelineSectionProps {
	game: Game;
	showPlayerNames?: boolean;
	expandedByDefault?: boolean;
}

interface TimelineEvent {
	type: 'game_start' | 'proposal' | 'vote' | 'mission' | 'game_end';
	timestamp: Date;
	missionNumber?: number;
	proposalNumber?: number;
	description: string;
	details?: string;
	outcome?: 'success' | 'fail' | 'approved' | 'rejected';
	participants?: string[];
}

function buildTimelineEvents(game: Game): TimelineEvent[] {
	const events: TimelineEvent[] = [];

	events.push({
		type: 'game_start',
		timestamp: game.timeCreated,
		description: '🎮 Game Started',
		details: `${game.players.length} players joined`,
	});

	game.missions.forEach((mission, missionIndex) => {
		if (mission.proposals.length === 0 && mission.state === 'PENDING') {
			return;
		}

		mission.proposals.forEach((proposal, proposalIndex) => {
			events.push({
				type: 'proposal',
				timestamp: new Date(game.timeCreated.getTime() + missionIndex * 3600000 + proposalIndex * 600000),
				missionNumber: missionIndex + 1,
				proposalNumber: proposalIndex + 1,
				description: `📋 Proposal ${proposalIndex + 1} for Mission ${missionIndex + 1}`,
				details: `Proposed by ${proposal.proposer}`,
				participants: proposal.team,
			});

			events.push({
				type: 'vote',
				timestamp: new Date(
					game.timeCreated.getTime() + missionIndex * 3600000 + proposalIndex * 600000 + 300000,
				),
				missionNumber: missionIndex + 1,
				proposalNumber: proposalIndex + 1,
				description: `🗳️ Vote on Proposal ${proposalIndex + 1}`,
				outcome: proposal.state === 'APPROVED' ? 'approved' : 'rejected',
				details: `${proposal.votes.length} approvals out of ${game.players.length} players`,
			});
		});

		if (mission.state !== 'PENDING') {
			const lastProposal = mission.proposals[mission.proposals.length - 1];
			if (lastProposal && lastProposal.state === 'APPROVED') {
				events.push({
					type: 'mission',
					timestamp: new Date(
						game.timeCreated.getTime() +
							missionIndex * 3600000 +
							mission.proposals.length * 600000 +
							600000,
					),
					missionNumber: missionIndex + 1,
					description: `⚔️ Mission ${missionIndex + 1} Executed`,
					outcome: mission.state === 'SUCCESS' ? 'success' : 'fail',
					details: mission.numFails !== undefined ? `${mission.numFails} fail(s)` : undefined,
					participants: mission.team,
				});
			}
		}
	});

	if (game.timeFinished && game.outcome) {
		events.push({
			type: 'game_end',
			timestamp: game.timeFinished,
			description: `🏁 Game Ended`,
			outcome: game.outcome.winner === 'GOOD' ? 'success' : 'fail',
			details: game.outcome.reason,
		});
	}

	return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export function TimelineSection({game, showPlayerNames = true, expandedByDefault = false}: TimelineSectionProps) {
	const [expandedEvents, setExpandedEvents] = useState<Set<number>>(
		expandedByDefault ? new Set(Array.from({length: 100}, (_, i) => i)) : new Set(),
	);

	const events = buildTimelineEvents(game);

	const toggleEventExpansion = (index: number) => {
		setExpandedEvents((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(index)) {
				newSet.delete(index);
			} else {
				newSet.add(index);
			}
			return newSet;
		});
	};

	const getEventIcon = (event: TimelineEvent) => {
		switch (event.type) {
			case 'game_start':
				return '🎮';
			case 'proposal':
				return '📋';
			case 'vote':
				return event.outcome === 'approved' ? '✅' : '❌';
			case 'mission':
				return event.outcome === 'success' ? '🎯' : '💥';
			case 'game_end':
				return '🏁';
			default:
				return '📌';
		}
	};

	const getEventColor = (event: TimelineEvent) => {
		if (event.outcome === 'success' || event.outcome === 'approved') {
			return '#059669';
		}
		if (event.outcome === 'fail' || event.outcome === 'rejected') {
			return '#dc2626';
		}
		return '#6b7280';
	};

	const getPlayerName = (uid: string) => {
		const player = game.players.find((p) => p.uid === uid);
		return player ? player.name : uid;
	};

	return (
		<div
			style={{
				backgroundColor: '#f9fafb',
				borderRadius: '12px',
				padding: '24px',
				boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
			}}
		>
			<h2 style={{margin: '0 0 24px 0', color: '#111827', fontSize: '24px', fontWeight: 'bold'}}>
				⏱️ Game Timeline
			</h2>

			<div style={{position: 'relative'}}>
				<div
					style={{
						position: 'absolute',
						left: '20px',
						top: '0',
						bottom: '0',
						width: '2px',
						backgroundColor: '#e5e7eb',
					}}
				/>

				{events.map((event, index) => {
					const isExpanded = expandedEvents.has(index);
					const hasExpandableContent = event.participants && event.participants.length > 0;

					return (
						<div
							key={index}
							style={{
								position: 'relative',
								marginBottom: index < events.length - 1 ? '24px' : '0',
								paddingLeft: '48px',
							}}
						>
							<div
								style={{
									position: 'absolute',
									left: '12px',
									top: '0',
									width: '16px',
									height: '16px',
									borderRadius: '50%',
									backgroundColor: getEventColor(event),
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: '10px',
									border: '3px solid #ffffff',
									boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
								}}
							/>

							<div
								style={{
									backgroundColor: '#ffffff',
									borderRadius: '8px',
									padding: '16px',
									boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
									border: '1px solid #e5e7eb',
									cursor: hasExpandableContent ? 'pointer' : 'default',
								}}
								onClick={() => hasExpandableContent && toggleEventExpansion(index)}
							>
								<div
									style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'}}
								>
									<div style={{flex: 1}}>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '8px',
												marginBottom: '4px',
											}}
										>
											<span style={{fontSize: '20px'}}>{getEventIcon(event)}</span>
											<h3
												style={{
													margin: '0',
													color: '#111827',
													fontSize: '16px',
													fontWeight: '600',
												}}
											>
												{event.description}
											</h3>
										</div>
										{event.details && (
											<p style={{margin: '0', color: '#6b7280', fontSize: '14px'}}>
												{event.details}
											</p>
										)}
									</div>
									<div style={{textAlign: 'right'}}>
										<time
											style={{
												color: '#9ca3af',
												fontSize: '12px',
												fontFamily: 'monospace',
											}}
										>
											{event.timestamp.toLocaleTimeString('en-US', {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</time>
										{hasExpandableContent && (
											<div
												style={{
													marginTop: '4px',
													color: '#6b7280',
													fontSize: '12px',
												}}
											>
												{isExpanded ? '▼' : '▶'} {event.participants?.length || 0} players
											</div>
										)}
									</div>
								</div>

								{isExpanded && event.participants && (
									<div
										style={{
											marginTop: '12px',
											paddingTop: '12px',
											borderTop: '1px solid #e5e7eb',
										}}
									>
										<div style={{fontSize: '14px', color: '#374151'}}>
											<strong>Team:</strong>{' '}
											{showPlayerNames
												? event.participants.map((uid) => getPlayerName(uid)).join(', ')
												: `${event.participants.length} players`}
										</div>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			<div
				style={{
					marginTop: '24px',
					padding: '16px',
					backgroundColor: '#f3f4f6',
					borderRadius: '8px',
					fontSize: '14px',
					color: '#6b7280',
				}}
			>
				<div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'}}>
					<div>
						<strong>Game Duration:</strong>{' '}
						{game.timeFinished
							? `${Math.round((game.timeFinished.getTime() - game.timeCreated.getTime()) / 60000)} minutes`
							: 'In Progress'}
					</div>
					<div>
						<strong>Total Events:</strong> {events.length}
					</div>
					{game.outcome && (
						<div>
							<strong>Winner:</strong>{' '}
							<span style={{color: game.outcome.winner === 'GOOD' ? '#059669' : '#dc2626'}}>
								{game.outcome.winner}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
