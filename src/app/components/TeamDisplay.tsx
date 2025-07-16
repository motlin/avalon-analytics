import type {Player} from '../models/game';
import {PlayerPillComponent} from './PlayerPill';

interface TeamDisplayProps {
	team: string[];
	players?: Player[];
	title?: string;
	showRoles?: boolean;
	size?: 'small' | 'medium' | 'large';
	onPlayerClick?: (playerName: string) => void;
}

export function TeamDisplayComponent({
	team,
	players = [],
	title = 'Team',
	showRoles = false,
	size = 'medium',
	onPlayerClick,
}: TeamDisplayProps) {
	const containerStyle: React.CSSProperties = {
		padding: '1rem',
		border: '1px solid #e0e0e0',
		borderRadius: '8px',
		backgroundColor: '#fafafa',
	};

	const titleStyle: React.CSSProperties = {
		margin: '0 0 0.75rem 0',
		fontSize: '1.125rem',
		fontWeight: 600,
		color: '#374151',
	};

	const teamContainerStyle: React.CSSProperties = {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '0.5rem',
		alignItems: 'center',
	};

	const teamSizeStyle: React.CSSProperties = {
		fontSize: '0.875rem',
		color: '#6b7280',
		marginLeft: '0.5rem',
	};

	const getPlayerFromName = (name: string): Player => {
		const foundPlayer = players.find((p) => p.name === name);
		return foundPlayer || {uid: name, name};
	};

	const handlePlayerClick = onPlayerClick ? (playerName: string) => () => onPlayerClick(playerName) : undefined;

	return (
		<div style={containerStyle}>
			<h3 style={titleStyle}>
				{title}
				<span style={teamSizeStyle}>({team.length} members)</span>
			</h3>
			<div style={teamContainerStyle}>
				{team.map((memberName) => {
					const player = getPlayerFromName(memberName);
					return (
						<PlayerPillComponent
							key={player.uid}
							player={player}
							size={size}
							showRole={showRoles}
							onClick={handlePlayerClick ? handlePlayerClick(memberName) : undefined}
						/>
					);
				})}
			</div>
		</div>
	);
}
