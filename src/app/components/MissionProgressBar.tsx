import * as React from 'react';
import {Mission} from '../models/game';
import {MissionCircle} from './MissionCircle';
import {Card, CardContent, CardHeader, CardTitle} from '@/app/components/ui/card';
import {Badge} from '@/app/components/ui/badge';
import {cn} from '@/lib/utils';

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
		<Card className="bg-secondary/20">
			<CardHeader className="pb-4">
				<div className="flex justify-between items-center">
					<CardTitle className="flex items-center gap-2">🎯 Mission Progress</CardTitle>
					<span className="text-sm text-muted-foreground">
						{completedMissions} of {totalMissions} missions completed
					</span>
				</div>
			</CardHeader>
			<CardContent>
				<div className="relative mb-6">
					<div className="h-2 bg-secondary rounded-md overflow-hidden">
						<div
							className="h-full bg-primary rounded-md transition-all duration-300 ease-in-out"
							style={{width: `${progressPercentage}%`}}
						/>
					</div>
				</div>

				<div className="flex justify-between items-center relative">
					{missions.map((mission, index) => {
						const isCurrentMission = index === currentMissionIndex;
						const missionCircleSize = isCurrentMission ? 56 : 48;

						return (
							<div
								key={index}
								className="flex flex-col items-center flex-1 relative"
							>
								{index < missions.length - 1 && (
									<div
										className={cn(
											'absolute top-6 left-1/2 w-full h-0.5 z-0',
											mission.state !== 'PENDING' ? 'bg-primary' : 'bg-secondary',
										)}
									/>
								)}

								<div
									className={cn(
										'relative z-10 transition-transform duration-200 cursor-pointer hover:scale-105',
										isCurrentMission && 'scale-110',
									)}
									title={`Mission ${index + 1}: ${mission.state === 'PENDING' ? 'Pending' : mission.state === 'SUCCESS' ? 'Success' : 'Failed'}`}
								>
									<MissionCircle
										mission={mission}
										missionNumber={index + 1}
										size={missionCircleSize}
									/>
									{isCurrentMission && (
										<Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs">
											Current
										</Badge>
									)}
								</div>

								{showDetails && (
									<div className="mt-2 text-center text-xs space-y-1">
										<div className="font-medium">Team: {mission.teamSize}</div>
										<div className="text-muted-foreground">Fails: {mission.failsRequired}</div>
										{mission.state !== 'PENDING' && mission.numFails !== undefined && (
											<div
												className={cn(
													'font-bold mt-1',
													mission.state === 'SUCCESS' ? 'text-green-600' : 'text-red-600',
												)}
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

				<div className="mt-5 flex justify-around text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-green-400" />
						<span>Success</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-red-400" />
						<span>Fail</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-secondary" />
						<span>Pending</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
