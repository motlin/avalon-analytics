import type {Mission} from '../models/game';
import {Card, CardContent, CardHeader, CardTitle} from '@/app/components/ui/card';
import {Badge} from '@/app/components/ui/badge';
import {cn} from '@/lib/utils';

interface MissionResultProps {
	mission: Mission;
	missionNumber?: number;
}

export function MissionResultComponent({mission, missionNumber}: MissionResultProps) {
	if (mission.state === 'PENDING') {
		return null;
	}

	const isSuccess = mission.state === 'SUCCESS';
	const resultIcon = isSuccess ? '✅' : '❌';

	return (
		<Card className="relative overflow-hidden mb-4">
			<div className={cn('absolute top-0 left-0 right-0 h-1', isSuccess ? 'bg-green-600' : 'bg-red-600')} />

			<CardHeader className="pb-4">
				<div className="flex justify-between items-center">
					<CardTitle className="flex items-center gap-2">
						🎯 {missionNumber ? `Mission ${missionNumber}` : 'Mission'} Result
					</CardTitle>
					<Badge
						variant={isSuccess ? 'success' : 'destructive'}
						className="gap-1.5"
					>
						{resultIcon} {mission.state}
					</Badge>
				</div>
			</CardHeader>

			<CardContent>
				{mission.team && mission.team.length > 0 && (
					<div className="mb-4">
						<label className="text-sm font-medium text-muted-foreground mb-2 block">
							Team Members ({mission.team.length}):
						</label>
						<div className="flex flex-wrap gap-2">
							{mission.team.map((member, index) => (
								<Badge
									key={index}
									variant="secondary"
									className="gap-1"
								>
									👤 {member}
								</Badge>
							))}
						</div>
					</div>
				)}

				{mission.numFails !== undefined && (
					<div className="bg-secondary/50 rounded-lg p-3 mt-4 border">
						<div className="flex items-center justify-between text-sm">
							<span>
								<strong>Fails Required:</strong> {mission.failsRequired}
							</span>
							<span
								className={cn(
									'font-bold text-lg',
									mission.numFails === 0 ? 'text-green-600' : 'text-red-600',
								)}
							>
								{mission.numFails} {mission.numFails === 1 ? 'Fail' : 'Fails'}
							</span>
						</div>
						{mission.numFails > 0 && !isSuccess && (
							<div className="mt-2 text-xs text-muted-foreground">
								⚠️ Mission failed with {mission.numFails}{' '}
								{mission.numFails === 1 ? 'fail vote' : 'fail votes'}
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
