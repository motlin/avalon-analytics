import type {Game} from '../models/game';

interface MissionSummaryTableProps {
	game: Game;
}

export function MissionSummaryTable({game}: MissionSummaryTableProps) {
	const headerStyle = {
		backgroundColor: '#f3f4f6',
		padding: '0.75rem',
		fontWeight: 600,
		borderBottom: '2px solid #e5e7eb',
		textAlign: 'left' as const,
	};

	const cellStyle = {
		padding: '0.75rem',
		borderBottom: '1px solid #e5e7eb',
	};

	const proposalCellStyle = {
		...cellStyle,
		maxWidth: '300px',
		fontSize: '0.875rem',
	};

	return (
		<div
			style={{
				overflowX: 'auto',
				backgroundColor: '#ffffff',
				borderRadius: '0.5rem',
				boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
			}}
		>
			<table style={{width: '100%', borderCollapse: 'collapse'}}>
				<thead>
					<tr>
						<th style={headerStyle}>Mission</th>
						<th style={headerStyle}>Team Size</th>
						<th style={headerStyle}>Fails Required</th>
						<th style={headerStyle}>Proposals</th>
						<th style={headerStyle}>Result</th>
						<th style={headerStyle}>Fails</th>
					</tr>
				</thead>
				<tbody>
					{game.missions.map((mission, index) => {
						const hasBeenPlayed = mission.proposals.length > 0 || mission.state !== 'PENDING';
						if (!hasBeenPlayed) return null;

						const proposalSummary = mission.proposals.map((proposal, pIndex) => (
							<div
								key={pIndex}
								style={{marginBottom: pIndex < mission.proposals.length - 1 ? '0.5rem' : 0}}
							>
								<div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
									<span
										style={{
											padding: '0.125rem 0.5rem',
											borderRadius: '0.25rem',
											fontSize: '0.75rem',
											fontWeight: 600,
											backgroundColor: proposal.state === 'APPROVED' ? '#10b981' : '#ef4444',
											color: '#ffffff',
										}}
									>
										{proposal.state}
									</span>
									<span>by {proposal.proposer}</span>
								</div>
								{proposal.state === 'APPROVED' && (
									<div style={{marginTop: '0.25rem', color: '#6b7280'}}>
										Team: {proposal.team.join(', ')}
									</div>
								)}
							</div>
						));

						return (
							<tr key={index}>
								<td style={{...cellStyle, fontWeight: 600}}>{index + 1}</td>
								<td style={cellStyle}>{mission.teamSize}</td>
								<td style={cellStyle}>{mission.failsRequired}</td>
								<td style={proposalCellStyle}>{proposalSummary}</td>
								<td
									style={{
										...cellStyle,
										fontWeight: 600,
										color:
											mission.state === 'SUCCESS'
												? '#10b981'
												: mission.state === 'FAIL'
													? '#ef4444'
													: '#6b7280',
									}}
								>
									{mission.state}
								</td>
								<td style={cellStyle}>
									{mission.state !== 'PENDING' && mission.numFails !== undefined
										? `${mission.numFails} / ${mission.failsRequired}`
										: '-'}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			{game.outcome && (
				<div
					style={{
						padding: '1rem',
						borderTop: '2px solid #e5e7eb',
						backgroundColor: game.outcome.winner === 'GOOD' ? '#dbeafe' : '#fee2e2',
					}}
				>
					<div
						style={{
							fontSize: '1.125rem',
							fontWeight: 600,
							color: game.outcome.winner === 'GOOD' ? '#1e40af' : '#991b1b',
						}}
					>
						{game.outcome.winner} WINS
					</div>
					<div style={{color: '#6b7280', marginTop: '0.25rem'}}>{game.outcome.reason}</div>
				</div>
			)}
		</div>
	);
}
