export interface Role {
	name: string;
	team: 'good' | 'evil';
	sees?: string[];
	description: string;
	selected: boolean;
	selectable?: boolean;
	filler?: boolean;
	assassinationPriority?: number;
}

export const ROLES: Role[];

export function getMissionPhases(playerCount: number): any[];
