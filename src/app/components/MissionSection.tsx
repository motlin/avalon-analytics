import type {Mission, Game} from '../models/game';
import {MissionProgressBarComponent} from './MissionProgressBar';
import {ProposalCardComponent} from './ProposalCard';
import {MissionResultComponent} from './MissionResult';

interface MissionSectionProps {
	mission: Mission;
	missionNumber: number;
	game: Game;
	showProgressBar?: boolean;
}

export function MissionSection({mission, missionNumber, game, showProgressBar = true}: MissionSectionProps) {
	const containerStyle: React.CSSProperties = {
		backgroundColor: '#ffffff',
		border: '1px solid #e5e7eb',
		borderRadius: '12px',
		padding: '24px',
		marginBottom: '24px',
		boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
	};

	const headerStyle: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '20px',
		paddingBottom: '16px',
		borderBottom: '2px solid #f3f4f6',
	};

	const titleStyle: React.CSSProperties = {
		fontSize: '24px',
		fontWeight: 'bold',
		color: '#1f2937',
		margin: 0,
	};

	const metadataStyle: React.CSSProperties = {
		display: 'flex',
		gap: '16px',
		fontSize: '14px',
		color: '#6b7280',
	};

	const metadataItemStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		gap: '4px',
	};

	const sectionStyle: React.CSSProperties = {
		marginBottom: '20px',
	};

	const sectionTitleStyle: React.CSSProperties = {
		fontSize: '18px',
		fontWeight: '600',
		color: '#374151',
		marginBottom: '12px',
	};

	const getStatusBadge = () => {
		const badgeStyle: React.CSSProperties = {
			display: 'inline-flex',
			alignItems: 'center',
			padding: '4px 12px',
			borderRadius: '20px',
			fontSize: '12px',
			fontWeight: '600',
			textTransform: 'uppercase',
		};

		switch (mission.state) {
			case 'SUCCESS':
				return <span style={{...badgeStyle, backgroundColor: '#d1fae5', color: '#065f46'}}>✓ Success</span>;
			case 'FAIL':
				return <span style={{...badgeStyle, backgroundColor: '#fee2e2', color: '#991b1b'}}>✗ Failed</span>;
			case 'PENDING':
			default:
				return <span style={{...badgeStyle, backgroundColor: '#f3f4f6', color: '#6b7280'}}>⏳ Pending</span>;
		}
	};

	return (
		<div style={containerStyle}>
			{showProgressBar && (
				<div style={sectionStyle}>
					<MissionProgressBarComponent
						missions={game.missions}
						currentMissionIndex={missionNumber - 1}
						showDetails={false}
					/>
				</div>
			)}

			<div style={headerStyle}>
				<h2 style={titleStyle}>🎯 Mission {missionNumber}</h2>
				{getStatusBadge()}
			</div>

			<div style={sectionStyle}>
				<div style={metadataStyle}>
					<div style={metadataItemStyle}>
						<span>👥</span>
						<span>Team Size: {mission.teamSize}</span>
					</div>
					<div style={metadataItemStyle}>
						<span>💥</span>
						<span>Fails Required: {mission.failsRequired}</span>
					</div>
					{mission.state !== 'PENDING' && mission.numFails !== undefined && (
						<div style={metadataItemStyle}>
							<span>📊</span>
							<span>Actual Fails: {mission.numFails}</span>
						</div>
					)}
					{mission.team && mission.team.length > 0 && (
						<div style={metadataItemStyle}>
							<span>⭐</span>
							<span>Final Team: {mission.team.join(', ')}</span>
						</div>
					)}
				</div>
			</div>

			{mission.proposals && mission.proposals.length > 0 && (
				<div style={sectionStyle}>
					<h3 style={sectionTitleStyle}>📝 Proposals ({mission.proposals.length})</h3>
					{mission.proposals.map((proposal, index) => (
						<ProposalCardComponent
							key={index}
							proposal={proposal}
							proposalNumber={index + 1}
							missionNumber={missionNumber}
						/>
					))}
				</div>
			)}

			{mission.state !== 'PENDING' && (
				<div style={sectionStyle}>
					<h3 style={sectionTitleStyle}>🏆 Mission Result</h3>
					<MissionResultComponent mission={mission} />
				</div>
			)}
		</div>
	);
}
