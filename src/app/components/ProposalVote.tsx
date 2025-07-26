import {Badge} from '@/app/components/ui/badge';

interface ProposalVoteProps {
	playerName: string;
	vote: boolean;
}

export function ProposalVoteComponent({playerName, vote}: ProposalVoteProps) {
	return (
		<Badge
			variant={vote ? 'success' : 'destructive'}
			className="m-0.5"
		>
			{playerName}: {vote ? '✓' : '✗'}
		</Badge>
	);
}
