import type {Mission} from '../models/game';

interface MissionCircleProps {
	mission: Mission;
	missionNumber: number;
	size?: number;
}

export function MissionCircle({mission, missionNumber, size = 60}: MissionCircleProps) {
	const getBackgroundColor = () => {
		switch (mission.state) {
			case 'SUCCESS':
				return '#4ade80';
			case 'FAIL':
				return '#f87171';
			case 'PENDING':
			default:
				return '#d1d5db';
		}
	};

	const getTextColor = () => {
		switch (mission.state) {
			case 'SUCCESS':
				return '#14532d';
			case 'FAIL':
				return '#7f1d1d';
			case 'PENDING':
			default:
				return '#374151';
		}
	};

	return (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: '50%',
				backgroundColor: getBackgroundColor(),
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				border: '3px solid',
				borderColor: mission.state === 'PENDING' ? '#9ca3af' : 'transparent',
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				transition: 'all 0.2s ease-in-out',
			}}
		>
			<span
				style={{
					fontSize: size * 0.4,
					fontWeight: 'bold',
					color: getTextColor(),
				}}
			>
				{missionNumber}
			</span>
		</div>
	);
}
