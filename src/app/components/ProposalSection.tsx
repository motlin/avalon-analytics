import type {Mission} from '../models/game';
import {ProposalCardComponent} from './ProposalCard';

interface ProposalSectionProps {
	mission: Mission;
	missionNumber: number;
}

export function ProposalSectionComponent({mission, missionNumber}: ProposalSectionProps) {
	const approvedProposalIndex = mission.proposals.findIndex((proposal) => proposal.state === 'APPROVED');

	const sectionStyle: React.CSSProperties = {
		marginBottom: '2rem',
		padding: '1.5rem',
		border: '2px solid #e0e0e0',
		borderRadius: '12px',
		backgroundColor: '#fafafa',
	};

	const headerStyle: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '1.5rem',
		paddingBottom: '1rem',
		borderBottom: '2px solid #ddd',
	};

	const titleStyle: React.CSSProperties = {
		margin: 0,
		fontSize: '1.5rem',
		fontWeight: 'bold',
		color: '#333',
	};

	const missionStatusStyle: React.CSSProperties = {
		fontSize: '1rem',
		fontWeight: 'bold',
		padding: '0.5rem 1rem',
		borderRadius: '20px',
		color: mission.state === 'SUCCESS' ? '#2e7d33' : mission.state === 'FAIL' ? '#c62828' : '#f57c00',
		backgroundColor: mission.state === 'SUCCESS' ? '#e8f5e9' : mission.state === 'FAIL' ? '#ffebee' : '#fff3e0',
		border: `1px solid ${mission.state === 'SUCCESS' ? '#4caf50' : mission.state === 'FAIL' ? '#f44336' : '#ff9800'}`,
	};

	const proposalListStyle: React.CSSProperties = {
		display: 'flex',
		flexDirection: 'column',
		gap: '1rem',
	};

	const approvedProposalWrapperStyle: React.CSSProperties = {
		position: 'relative',
		border: '3px solid #4caf50',
		borderRadius: '12px',
		backgroundColor: '#e8f5e9',
		padding: '0.5rem',
	};

	const approvedLabelStyle: React.CSSProperties = {
		position: 'absolute',
		top: '-12px',
		left: '16px',
		backgroundColor: '#4caf50',
		color: 'white',
		padding: '0.25rem 0.75rem',
		borderRadius: '12px',
		fontSize: '0.875rem',
		fontWeight: 'bold',
	};

	return (
		<div style={sectionStyle}>
			<div style={headerStyle}>
				<h2 style={titleStyle}>Mission {missionNumber}</h2>
				<div style={missionStatusStyle}>{mission.state}</div>
			</div>

			<div style={proposalListStyle}>
				{mission.proposals.map((proposal, index) => {
					const proposalElement = (
						<ProposalCardComponent
							key={index}
							proposal={proposal}
							proposalNumber={index + 1}
							missionNumber={missionNumber}
						/>
					);

					if (index === approvedProposalIndex) {
						return (
							<div
								key={index}
								style={approvedProposalWrapperStyle}
							>
								<div style={approvedLabelStyle}>✓ Final Approved Proposal</div>
								{proposalElement}
							</div>
						);
					}

					return proposalElement;
				})}
			</div>
		</div>
	);
}
