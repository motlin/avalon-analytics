import type {Player} from '../models/game';
import {PlayerPillComponent} from './PlayerPill';

interface PlayerRosterProps {
	players: Player[];
	showRoles?: boolean;
	size?: 'small' | 'medium' | 'large';
	onPlayerClick?: (player: Player) => void;
}

export function PlayerRosterComponent({players, showRoles = false, size = 'medium', onPlayerClick}: PlayerRosterProps) {
	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				gap: '0.5rem',
				padding: '1rem',
				border: '1px solid #e0e0e0',
				borderRadius: '0.5rem',
				backgroundColor: '#fafafa',
			}}
		>
			{players.length === 0 ? (
				<div style={{color: '#666', fontStyle: 'italic'}}>No players in this game</div>
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
	);
}
