import type {Proposal} from '../models/game';

interface ProposalProps {
	proposal: Proposal;
	proposalNumber: number;
	missionNumber?: number;
}

export function ProposalComponent({proposal, proposalNumber}: ProposalProps) {
	return (
		<div style={{border: '1px solid #ddd', padding: '0.5rem', marginBottom: '0.5rem'}}>
			<h4>Proposal {proposalNumber}</h4>
			<p>Proposer: {proposal.proposer}</p>
			<p>Team: {proposal.team.join(', ')}</p>
			<p>Status: {proposal.state}</p>
			{proposal.votes && proposal.votes.length > 0 && (
				<p>
					Approved by:{' '}
					{Array.isArray(proposal.votes[0]) ? 'Complex vote structure' : proposal.votes.join(', ')}
				</p>
			)}
		</div>
	);
}
