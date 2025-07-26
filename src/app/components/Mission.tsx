import type {ReactNode} from 'react';
import type {Mission} from '../models/game';
import {Card, CardContent, CardHeader, CardTitle} from '@/app/components/ui/card';

interface MissionProps {
	mission: Mission;
	missionNumber: number;
	children?: ReactNode;
}

export function MissionComponent({mission, missionNumber, children}: MissionProps) {
	return (
		<Card className="mb-4">
			<CardHeader>
				<CardTitle>Mission {missionNumber}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">Team Size: {mission.teamSize}</p>
				<p className="text-sm text-muted-foreground">Fails Required: {mission.failsRequired}</p>
				{children}
			</CardContent>
		</Card>
	);
}
