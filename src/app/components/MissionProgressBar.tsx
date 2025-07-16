import React from 'react';
import {Mission} from '../models/game';
import {MissionCircle} from './MissionCircle';

export interface MissionProgressBarProps {
	missions: Mission[];
	currentMissionIndex?: number;
	showDetails?: boolean;
}

export function MissionProgressBarComponent({
	missions,
	currentMissionIndex,
	showDetails = false,
}: MissionProgressBarProps) {
	const totalMissions = missions.length;
	const completedMissions = missions.filter((mission) => mission.state !== 'PENDING').length;
	const progressPercentage = (completedMissions / totalMissions) * 100;

	return (
		<div
			style={{
				padding: '20px',
				backgroundColor: '#f3f4f6',
				borderRadius: '12px',
				boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
			}}
		>
			<div
				style={{
					marginBottom: '16px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<h3 style={{margin: 0, color: '#374151', fontSize: '18px'}}>🎯 Mission Progress</h3>
				<span style={{color: '#6b7280', fontSize: '14px'}}>
					{completedMissions} of {totalMissions} missions completed
				</span>
			</div>

			<div style={{position: 'relative', marginBottom: '24px'}}>
				<div
					style={{
						height: '8px',
						backgroundColor: '#e5e7eb',
						borderRadius: '4px',
						overflow: 'hidden',
					}}
				>
					<div
						style={{
							height: '100%',
							width: `${progressPercentage}%`,
							backgroundColor: '#3b82f6',
							borderRadius: '4px',
							transition: 'width 0.3s ease',
						}}
					/>
				</div>
			</div>

			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					position: 'relative',
				}}
			>
				{missions.map((mission, index) => {
					const isCurrentMission = index === currentMissionIndex;
					const missionCircleSize = isCurrentMission ? '56px' : '48px';

					return (
						<div
							key={index}
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								flex: 1,
								position: 'relative',
							}}
						>
							{index < missions.length - 1 && (
								<div
									style={{
										position: 'absolute',
										top: '24px',
										left: '50%',
										width: '100%',
										height: '2px',
										backgroundColor: mission.state !== 'PENDING' ? '#3b82f6' : '#e5e7eb',
										zIndex: 0,
									}}
								/>
							)}

							<div
								style={{
									position: 'relative',
									zIndex: 1,
									transition: 'transform 0.2s ease',
									transform: isCurrentMission ? 'scale(1.1)' : 'scale(1)',
									cursor: 'pointer',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = isCurrentMission ? 'scale(1.15)' : 'scale(1.05)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = isCurrentMission ? 'scale(1.1)' : 'scale(1)';
								}}
								title={`Mission ${index + 1}: ${mission.state === 'PENDING' ? 'Pending' : mission.state === 'SUCCESS' ? 'Success' : 'Failed'}`}
							>
								<MissionCircle
									missionNumber={index + 1}
									status={mission.state}
									size={missionCircleSize}
								/>
								{isCurrentMission && (
									<div
										style={{
											position: 'absolute',
											top: '-8px',
											left: '50%',
											transform: 'translateX(-50%)',
											backgroundColor: '#3b82f6',
											color: 'white',
											padding: '2px 8px',
											borderRadius: '4px',
											fontSize: '12px',
											fontWeight: 'bold',
											whiteSpace: 'nowrap',
											boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
										}}
									>
										Current
									</div>
								)}
							</div>

							{showDetails && (
								<div
									style={{
										marginTop: '8px',
										textAlign: 'center',
										fontSize: '12px',
									}}
								>
									<div style={{color: '#374151', fontWeight: '500'}}>Team: {mission.teamSize}</div>
									<div style={{color: '#6b7280'}}>Fails: {mission.failsRequired}</div>
									{mission.state !== 'PENDING' && mission.numFails !== undefined && (
										<div
											style={{
												color: mission.state === 'SUCCESS' ? '#059669' : '#dc2626',
												fontWeight: 'bold',
												marginTop: '4px',
											}}
										>
											{mission.state === 'SUCCESS' ? '✓' : '✗'} {mission.numFails} fails
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			<div
				style={{
					marginTop: '20px',
					display: 'flex',
					justifyContent: 'space-around',
					fontSize: '14px',
					color: '#6b7280',
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
					<div
						style={{
							width: '12px',
							height: '12px',
							borderRadius: '50%',
							backgroundColor: '#4ade80',
						}}
					/>
					<span>Success</span>
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
					<div
						style={{
							width: '12px',
							height: '12px',
							borderRadius: '50%',
							backgroundColor: '#f87171',
						}}
					/>
					<span>Fail</span>
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
					<div
						style={{
							width: '12px',
							height: '12px',
							borderRadius: '50%',
							backgroundColor: '#d1d5db',
						}}
					/>
					<span>Pending</span>
				</div>
			</div>
		</div>
	);
}
