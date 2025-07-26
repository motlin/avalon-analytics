import type {Proposal} from '../models/game';
import {Card, CardContent, CardHeader, CardTitle} from '@/app/components/ui/card';
import {Badge} from '@/app/components/ui/badge';

interface ProposalProps {
	proposal: Proposal;
	proposalNumber: number;
	missionNumber?: number;
}

export function ProposalComponent({proposal, proposalNumber}: ProposalProps) {
	const getStatusVariant = (state: string) => {
		switch (state) {
			case 'APPROVED':
				return 'success';
			case 'REJECTED':
				return 'destructive';
			default:
				return 'secondary';
		}
	};

	return (
		<Card className="mb-2">
			<CardHeader className="py-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">Proposal {proposalNumber}</CardTitle>
					<Badge variant={getStatusVariant(proposal.state)}>{proposal.state}</Badge>
				</div>
			</CardHeader>
			<CardContent className="py-3 space-y-1 text-sm">
				<p>
					<span className="font-medium">Proposer:</span> {proposal.proposer}
				</p>
				<p>
					<span className="font-medium">Team:</span> {proposal.team.join(', ')}
				</p>
				{proposal.votes && proposal.votes.length > 0 && (
					<p>
						<span className="font-medium">Approved by:</span>{' '}
						{Array.isArray(proposal.votes[0]) ? 'Complex vote structure' : proposal.votes.join(', ')}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
