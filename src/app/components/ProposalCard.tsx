import type {Proposal} from '../models/game';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';
import {Badge} from './ui/badge';

interface ProposalCardProps {
	proposal: Proposal;
	proposalNumber: number;
	missionNumber?: number;
}

export function ProposalCardComponent({proposal, proposalNumber, missionNumber}: ProposalCardProps) {
	const approvalPercentage =
		proposal.votes.length > 0 ? Math.round((proposal.votes.length / proposal.team.length) * 100) : 0;

	return (
		<Card className="mb-4">
			<CardHeader className="pb-3">
				<div className="flex justify-between items-center">
					<CardTitle className="text-lg">
						{missionNumber ? `Mission ${missionNumber} - ` : ''}Proposal {proposalNumber}
					</CardTitle>
					<Badge variant={proposal.state === 'APPROVED' ? 'success' : 'destructive'}>{proposal.state}</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<div>
					<span className="font-semibold text-muted-foreground mr-2">Proposer:</span>
					<span>{proposal.proposer}</span>
				</div>

				<div>
					<span className="font-semibold text-muted-foreground mr-2">
						Team ({proposal.team.length} members):
					</span>
					<div className="mt-2">
						{proposal.team.map((member, index) => (
							<Badge
								key={index}
								variant="outline"
								className="mr-2 mb-2"
							>
								{member}
							</Badge>
						))}
					</div>
				</div>

				{proposal.votes && proposal.votes.length > 0 && (
					<div className="pt-4 border-t">
						<div className="mb-2">
							<span className="font-semibold text-muted-foreground mr-2">Approved by:</span>
							<span>
								{proposal.votes.length} of {proposal.team.length} players ({approvalPercentage}%)
							</span>
						</div>
						<div>
							{proposal.votes.map((voter, index) => (
								<Badge
									key={index}
									variant="success"
									className="mr-2 mb-2"
								>
									{voter}
								</Badge>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
