import {ProposalVoteComponent} from './ProposalVote';

interface VoteListProps {
	votes: Record<string, boolean>;
	title?: string;
}

export function VoteList({votes, title = 'Votes'}: VoteListProps) {
	const voteEntries = Object.entries(votes).sort(([a], [b]) => a.localeCompare(b));
	const approvalCount = voteEntries.filter(([, vote]) => vote).length;
	const totalVotes = voteEntries.length;
	const approvalPercentage = totalVotes > 0 ? Math.round((approvalCount / totalVotes) * 100) : 0;

	const containerStyle: React.CSSProperties = {
		border: '1px solid #e0e0e0',
		borderRadius: '8px',
		padding: '16px',
		backgroundColor: '#ffffff',
	};

	const titleStyle: React.CSSProperties = {
		fontSize: '18px',
		fontWeight: 'bold',
		marginBottom: '12px',
		color: '#333333',
	};

	const summaryStyle: React.CSSProperties = {
		fontSize: '14px',
		color: '#666666',
		marginBottom: '16px',
	};

	const votesContainerStyle: React.CSSProperties = {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
	};

	return (
		<div style={containerStyle}>
			<div style={titleStyle}>{title}</div>
			<div style={summaryStyle}>
				{approvalCount} of {totalVotes} approved ({approvalPercentage}%)
			</div>
			<div style={votesContainerStyle}>
				{voteEntries.map(([player, vote]) => (
					<ProposalVoteComponent
						key={player}
						playerName={player}
						vote={vote}
					/>
				))}
			</div>
		</div>
	);
}
