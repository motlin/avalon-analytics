import type {Player} from '../models/game';
import {Card} from '@/app/components/ui/card';
import {Badge} from '@/app/components/ui/badge';

interface PlayerProps {
	player: Player;
}

export function PlayerComponent({player}: PlayerProps) {
	return (
		<Card className="p-2 mb-1">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<strong>{player.name}</strong>
					{player.role && (
						<Badge
							variant="outline"
							className="text-xs"
						>
							Role: {player.role}
						</Badge>
					)}
				</div>
				<span className="text-xs text-muted-foreground">
					uid:{' '}
					<a
						href={`/uid/${player.uid}`}
						className="text-blue-600 hover:text-blue-800 no-underline"
					>
						{player.uid}
					</a>
				</span>
			</div>
		</Card>
	);
}
