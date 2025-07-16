import type {Player} from '../models/game';

interface TeamMemberProps {
	player: Player;
	variant?: 'default' | 'compact' | 'detailed';
	showRole?: boolean;
	isSelected?: boolean;
	isProposer?: boolean;
	onClick?: () => void;
}

export function TeamMemberComponent({
	player,
	variant = 'default',
	showRole = false,
	isSelected = false,
	isProposer = false,
	onClick,
}: TeamMemberProps) {
	const variants = {
		compact: {
			padding: '0.25rem 0.5rem',
			fontSize: '0.875rem',
			gap: '0.25rem',
		},
		default: {
			padding: '0.375rem 0.75rem',
			fontSize: '0.875rem',
			gap: '0.375rem',
		},
		detailed: {
			padding: '0.5rem 1rem',
			fontSize: '1rem',
			gap: '0.5rem',
		},
	};

	const baseStyle: React.CSSProperties = {
		display: 'inline-flex',
		alignItems: 'center',
		borderRadius: '6px',
		border: '1px solid #e0e0e0',
		backgroundColor: isSelected ? '#e3f2fd' : '#fafafa',
		borderColor: isSelected ? '#1976d2' : '#e0e0e0',
		cursor: onClick ? 'pointer' : 'default',
		transition: 'all 0.2s ease',
		position: 'relative',
		...variants[variant],
	};

	const hoverStyle = onClick
		? {
				backgroundColor: isSelected ? '#bbdefb' : '#f0f0f0',
				borderColor: isSelected ? '#1565c0' : '#d0d0d0',
				transform: 'translateY(-1px)',
				boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
			}
		: {};

	const nameStyle: React.CSSProperties = {
		fontWeight: isProposer ? 700 : 600,
		color: isProposer ? '#1976d2' : '#333',
	};

	const roleStyle: React.CSSProperties = {
		color: '#666',
		fontSize: '0.85em',
		fontStyle: 'italic',
	};

	const proposerBadgeStyle: React.CSSProperties = {
		position: 'absolute',
		top: '-4px',
		right: '-4px',
		width: '8px',
		height: '8px',
		backgroundColor: '#1976d2',
		borderRadius: '50%',
		border: '2px solid white',
	};

	return (
		<div
			style={baseStyle}
			onMouseEnter={(e) => {
				if (onClick) {
					Object.assign(e.currentTarget.style, hoverStyle);
				}
			}}
			onMouseLeave={(e) => {
				Object.assign(e.currentTarget.style, {
					backgroundColor: baseStyle.backgroundColor,
					borderColor: baseStyle.borderColor,
					transform: 'none',
					boxShadow: 'none',
				});
			}}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			onKeyDown={
				onClick
					? (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								onClick();
							}
						}
					: undefined
			}
		>
			{isProposer && <div style={proposerBadgeStyle} />}
			<span style={nameStyle}>{player.name}</span>
			{showRole && player.role && <span style={roleStyle}>({player.role})</span>}
		</div>
	);
}
