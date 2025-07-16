import type {Proposal} from '../models/game';
import {VoteList} from './VoteList';

interface VotingPanelProps {
	proposals: Proposal[];
	missionNumber?: number;
	title?: string;
}

export function VotingPanel({proposals, missionNumber, title = 'Voting Results'}: VotingPanelProps) {
	const panelStyle: React.CSSProperties = {
		border: '1px solid #ddd',
		borderRadius: '12px',
		padding: '1.5rem',
		backgroundColor: '#ffffff',
		boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
		maxWidth: '800px',
	};

	const headerStyle: React.CSSProperties = {
		fontSize: '24px',
		fontWeight: 'bold',
		marginBottom: '1.5rem',
		color: '#333333',
		textAlign: 'center',
		borderBottom: '2px solid #e0e0e0',
		paddingBottom: '1rem',
	};

	const proposalSectionStyle: React.CSSProperties = {
		marginBottom: '1.5rem',
	};

	const proposalHeaderStyle: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '1rem',
		padding: '0.75rem',
		backgroundColor: '#f8f9fa',
		borderRadius: '8px',
		border: '1px solid #e9ecef',
	};

	const proposalTitleStyle: React.CSSProperties = {
		fontSize: '18px',
		fontWeight: 'bold',
		margin: 0,
		color: '#495057',
	};

	const statusBadgeStyle = (state: string): React.CSSProperties => ({
		padding: '0.25rem 0.75rem',
		borderRadius: '20px',
		fontSize: '14px',
		fontWeight: 'bold',
		textTransform: 'uppercase',
		backgroundColor: state === 'APPROVED' ? '#d4edda' : '#f8d7da',
		color: state === 'APPROVED' ? '#155724' : '#721c24',
		border: `1px solid ${state === 'APPROVED' ? '#c3e6cb' : '#f5c6cb'}`,
	});

	const teamInfoStyle: React.CSSProperties = {
		marginBottom: '1rem',
		padding: '0.75rem',
		backgroundColor: '#f8f9fa',
		borderRadius: '6px',
	};

	const labelStyle: React.CSSProperties = {
		fontWeight: 'bold',
		color: '#666',
		marginRight: '0.5rem',
	};

	const teamMemberStyle: React.CSSProperties = {
		display: 'inline-block',
		padding: '0.25rem 0.5rem',
		margin: '0.25rem',
		backgroundColor: '#e9ecef',
		border: '1px solid #dee2e6',
		borderRadius: '4px',
		fontSize: '0.875rem',
		color: '#495057',
	};

	if (proposals.length === 0) {
		return (
			<div style={panelStyle}>
				<div style={headerStyle}>{title}</div>
				<div style={{textAlign: 'center', color: '#666', fontStyle: 'italic'}}>No proposals to display</div>
			</div>
		);
	}

	return (
		<div style={panelStyle}>
			<div style={headerStyle}>
				{missionNumber ? `Mission ${missionNumber} - ` : ''}
				{title}
			</div>

			{proposals.map((proposal, index) => {
				const proposalVotes: Record<string, boolean> = {};

				proposal.team.forEach((player) => {
					proposalVotes[player] = proposal.votes.includes(player);
				});

				return (
					<div
						key={index}
						style={proposalSectionStyle}
					>
						<div style={proposalHeaderStyle}>
							<h3 style={proposalTitleStyle}>Proposal {index + 1}</h3>
							<span style={statusBadgeStyle(proposal.state)}>{proposal.state}</span>
						</div>

						<div style={teamInfoStyle}>
							<div style={{marginBottom: '0.5rem'}}>
								<span style={labelStyle}>Proposer:</span>
								<span>{proposal.proposer}</span>
							</div>
							<div>
								<span style={labelStyle}>Team ({proposal.team.length} members):</span>
								<div style={{marginTop: '0.25rem'}}>
									{proposal.team.map((member, memberIndex) => (
										<span
											key={memberIndex}
											style={teamMemberStyle}
										>
											{member}
										</span>
									))}
								</div>
							</div>
						</div>

						<VoteList
							votes={proposalVotes}
							title={`Proposal ${index + 1} Votes`}
						/>
					</div>
				);
			})}
		</div>
	);
}
