import type {Proposal} from '../models/game';

interface ProposalCardProps {
	proposal: Proposal;
	proposalNumber: number;
	missionNumber?: number;
}

export function ProposalCardComponent({proposal, proposalNumber, missionNumber}: ProposalCardProps) {
	const approvalPercentage =
		proposal.votes.length > 0 ? Math.round((proposal.votes.length / proposal.team.length) * 100) : 0;

	const cardStyle: React.CSSProperties = {
		border: '1px solid #ddd',
		borderRadius: '8px',
		padding: '1rem',
		marginBottom: '1rem',
		backgroundColor: '#ffffff',
		boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
	};

	const headerStyle: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '1rem',
		paddingBottom: '0.5rem',
		borderBottom: '1px solid #e0e0e0',
	};

	const statusStyle: React.CSSProperties = {
		fontWeight: 'bold',
		color: proposal.state === 'APPROVED' ? '#4caf50' : '#f44336',
	};

	const teamSectionStyle: React.CSSProperties = {
		marginBottom: '0.75rem',
	};

	const labelStyle: React.CSSProperties = {
		fontWeight: 'bold',
		marginRight: '0.5rem',
		color: '#666',
	};

	const teamMemberStyle: React.CSSProperties = {
		display: 'inline-block',
		padding: '0.25rem 0.5rem',
		margin: '0.25rem',
		backgroundColor: '#f5f5f5',
		border: '1px solid #e0e0e0',
		borderRadius: '4px',
		fontSize: '0.875rem',
	};

	const voteSectionStyle: React.CSSProperties = {
		marginTop: '0.75rem',
		paddingTop: '0.75rem',
		borderTop: '1px solid #e0e0e0',
	};

	return (
		<div style={cardStyle}>
			<div style={headerStyle}>
				<h3 style={{margin: 0}}>
					{missionNumber ? `Mission ${missionNumber} - ` : ''}Proposal {proposalNumber}
				</h3>
				<span style={statusStyle}>{proposal.state}</span>
			</div>

			<div style={teamSectionStyle}>
				<span style={labelStyle}>Proposer:</span>
				<span>{proposal.proposer}</span>
			</div>

			<div style={teamSectionStyle}>
				<span style={labelStyle}>Team ({proposal.team.length} members):</span>
				<div>
					{proposal.team.map((member, index) => (
						<span
							key={index}
							style={teamMemberStyle}
						>
							{member}
						</span>
					))}
				</div>
			</div>

			{proposal.votes && proposal.votes.length > 0 && (
				<div style={voteSectionStyle}>
					<span style={labelStyle}>Approved by:</span>
					<span>
						{proposal.votes.length} of {proposal.team.length} players ({approvalPercentage}%)
					</span>
					<div style={{marginTop: '0.25rem'}}>
						{proposal.votes.map((voter, index) => (
							<span
								key={index}
								style={{...teamMemberStyle, backgroundColor: '#e8f5e9'}}
							>
								{voter}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
