import type {Player} from '../models/game';
import {PlayerPillComponent} from './PlayerPill';
import {Card} from '@/app/components/ui/card';

interface PlayerRosterProps {
	players: Player[];
	showRoles?: boolean;
	size?: 'small' | 'medium' | 'large';
	onPlayerClick?: (player: Player) => void;
}

export function PlayerRosterComponent({players, showRoles = false, size = 'medium', onPlayerClick}: PlayerRosterProps) {
	return (
		<Card className="p-4 bg-secondary/20">
			<div className="flex flex-wrap gap-2">
				{players.length === 0 ? (
					<div className="text-muted-foreground italic">No players in this game</div>
				) : (
					players.map((player) => (
						<PlayerPillComponent
							key={player.uid}
							player={player}
							size={size}
							showRole={showRoles}
							onClick={onPlayerClick ? () => onPlayerClick(player) : undefined}
						/>
					))
				)}
			</div>
		</Card>
	);
}
