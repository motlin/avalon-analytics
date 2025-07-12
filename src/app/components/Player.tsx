import type {Player} from '../models/game';

interface PlayerProps {
	player: Player;
}

export function PlayerComponent({player}: PlayerProps) {
	return (
		<div
			style={{
				border: '1px solid #e0e0e0',
				padding: '0.5rem',
				marginBottom: '0.25rem',
				backgroundColor: '#fafafa',
			}}
		>
			<strong>{player.name}</strong>
			{player.role && <span> - Role: {player.role}</span>}
			<span style={{fontSize: '0.8em', color: '#666'}}> (uid: {player.uid})</span>
		</div>
	);
}
