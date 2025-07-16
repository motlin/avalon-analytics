import type {Player} from '../models/game';

interface PlayerPillProps {
	player: Player;
	size?: 'small' | 'medium' | 'large';
	showRole?: boolean;
	onClick?: () => void;
}

export function PlayerPillComponent({player, size = 'medium', showRole = false, onClick}: PlayerPillProps) {
	const sizes = {
		small: {
			padding: '0.25rem 0.5rem',
			fontSize: '0.75rem',
		},
		medium: {
			padding: '0.375rem 0.75rem',
			fontSize: '0.875rem',
		},
		large: {
			padding: '0.5rem 1rem',
			fontSize: '1rem',
		},
	};

	const baseStyle = {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '0.25rem',
		borderRadius: '9999px',
		backgroundColor: '#fafafa',
		border: '1px solid #e0e0e0',
		cursor: onClick ? 'pointer' : 'default',
		transition: 'all 0.2s ease',
		...sizes[size],
	};

	const hoverStyle = onClick
		? {
				backgroundColor: '#f0f0f0',
				borderColor: '#d0d0d0',
			}
		: {};

	return (
		<span
			style={baseStyle}
			onMouseEnter={(e) => {
				if (onClick) {
					Object.assign(e.currentTarget.style, hoverStyle);
				}
			}}
			onMouseLeave={(e) => {
				Object.assign(e.currentTarget.style, {
					backgroundColor: baseStyle.backgroundColor,
					borderColor: baseStyle.border.split(' ')[2],
				});
			}}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
		>
			<span style={{fontWeight: 600}}>{player.name}</span>
			{showRole && player.role && <span style={{color: '#666', fontSize: '0.9em'}}>({player.role})</span>}
		</span>
	);
}
