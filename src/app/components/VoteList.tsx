import {ProposalVoteComponent} from './ProposalVote';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/app/components/ui/card';

interface VoteListProps {
	votes: Record<string, boolean>;
	title?: string;
}

export function VoteList({votes, title = 'Votes'}: VoteListProps) {
	const voteEntries = Object.entries(votes).sort(([a], [b]) => a.localeCompare(b));
	const approvalCount = voteEntries.filter(([, vote]) => vote).length;
	const totalVotes = voteEntries.length;
	const approvalPercentage = totalVotes > 0 ? Math.round((approvalCount / totalVotes) * 100) : 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>
					{approvalCount} of {totalVotes} approved ({approvalPercentage}%)
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-2">
					{voteEntries.map(([player, vote]) => (
						<ProposalVoteComponent
							key={player}
							playerName={player}
							vote={vote}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
