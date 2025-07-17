import type {Player} from '../models/game';
import {cn} from '@/lib/utils';

interface PlayerPillProps {
	player: Player;
	size?: 'small' | 'medium' | 'large';
	showRole?: boolean;
	onClick?: () => void;
}

export function PlayerPillComponent({player, size = 'medium', showRole = false, onClick}: PlayerPillProps) {
	const sizeClasses = {
		small: 'px-2 py-1 text-xs',
		medium: 'px-3 py-1.5 text-sm',
		large: 'px-4 py-2 text-base',
	};

	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 rounded-full bg-secondary border border-border transition-colors',
				sizeClasses[size],
				onClick && 'cursor-pointer hover:bg-secondary/80 hover:border-input',
			)}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
		>
			<span className="font-semibold">{player.name}</span>
			{showRole && player.role && <span className="text-muted-foreground text-[0.9em]">({player.role})</span>}
		</span>
	);
}
