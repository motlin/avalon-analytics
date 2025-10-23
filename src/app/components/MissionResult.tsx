import type {Mission} from '../models/game';

interface MissionResultProps {
	mission: Mission;
	missionNumber?: number;
}

function MissionResultComponent({mission, missionNumber}: MissionResultProps) {
	if (mission.state === 'PENDING') {
		return null;
	}

	const isSuccess = mission.state === 'SUCCESS';
	const resultIcon = isSuccess ? '✅' : '❌';
	const resultColor = isSuccess ? '#059669' : '#dc2626';
	const resultBgColor = isSuccess ? '#f0fdf4' : '#fef2f2';
	const resultBorderColor = isSuccess ? '#86efac' : '#fecaca';

	const cardStyle: React.CSSProperties = {
		border: '1px solid #e5e7eb',
		borderRadius: '12px',
		padding: '20px',
		marginBottom: '16px',
		backgroundColor: '#ffffff',
		boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
		position: 'relative',
		overflow: 'hidden',
	};

	const headerStyle: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '16px',
	};

	const titleStyle: React.CSSProperties = {
		fontSize: '20px',
		fontWeight: '600',
		color: '#111827',
		margin: 0,
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
	};

	const resultBadgeStyle: React.CSSProperties = {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '6px',
		padding: '6px 12px',
		borderRadius: '8px',
		backgroundColor: resultBgColor,
		border: `1px solid ${resultBorderColor}`,
		color: resultColor,
		fontWeight: '600',
		fontSize: '14px',
	};

	const teamSectionStyle: React.CSSProperties = {
		marginBottom: '16px',
	};

	const labelStyle: React.CSSProperties = {
		fontSize: '14px',
		fontWeight: '500',
		color: '#6b7280',
		marginBottom: '8px',
		display: 'block',
	};

	const teamMemberStyle: React.CSSProperties = {
		display: 'inline-flex',
		alignItems: 'center',
		padding: '6px 12px',
		margin: '4px',
		backgroundColor: '#f3f4f6',
		border: '1px solid #e5e7eb',
		borderRadius: '20px',
		fontSize: '14px',
		color: '#374151',
		fontWeight: '500',
	};

	const failsSectionStyle: React.CSSProperties = {
		backgroundColor: '#f9fafb',
		borderRadius: '8px',
		padding: '12px 16px',
		marginTop: '16px',
		border: '1px solid #e5e7eb',
	};

	const failsTextStyle: React.CSSProperties = {
		fontSize: '14px',
		color: '#111827',
		margin: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	};

	const failsCountStyle: React.CSSProperties = {
		fontWeight: '700',
		fontSize: '18px',
		color: mission.numFails === 0 ? '#059669' : '#dc2626',
	};

	const accentBarStyle: React.CSSProperties = {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: '4px',
		backgroundColor: resultColor,
	};

	return (
		<div style={cardStyle}>
			<div style={accentBarStyle} />

			<div style={headerStyle}>
				<h3 style={titleStyle}>🎯 {missionNumber ? `Mission ${missionNumber}` : 'Mission'} Result</h3>
				<div style={resultBadgeStyle}>
					{resultIcon} {mission.state}
				</div>
			</div>

			{mission.team && mission.team.length > 0 && (
				<div style={teamSectionStyle}>
					<label style={labelStyle}>Team Members ({mission.team.length}):</label>
					<div>
						{mission.team.map((member, index) => (
							<span
								key={index}
								style={teamMemberStyle}
							>
								👤 {member}
							</span>
						))}
					</div>
				</div>
			)}

			{mission.numFails !== undefined && (
				<div style={failsSectionStyle}>
					<div style={failsTextStyle}>
						<span>
							<strong>Fails Required:</strong> {mission.failsRequired}
						</span>
						<span style={failsCountStyle}>
							{mission.numFails} {mission.numFails === 1 ? 'Fail' : 'Fails'}
						</span>
					</div>
					{mission.numFails > 0 && !isSuccess && (
						<div style={{marginTop: '8px', fontSize: '13px', color: '#6b7280'}}>
							⚠️ Mission failed with {mission.numFails}{' '}
							{mission.numFails === 1 ? 'fail vote' : 'fail votes'}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default MissionResultComponent;
export {MissionResultComponent};
