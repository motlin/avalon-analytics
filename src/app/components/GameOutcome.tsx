interface GameOutcomeProps {
	outcome: any;
}

export function GameOutcomeComponent({outcome}: GameOutcomeProps) {
	const isGoodWin = outcome.state === 'GOOD_WIN';
	const winner = isGoodWin ? 'GOOD' : 'EVIL';

	return (
		<div
			style={{
				border: '2px solid',
				borderColor: isGoodWin ? '#4caf50' : '#f44336',
				padding: '1rem',
				backgroundColor: isGoodWin ? '#e7f5e7' : '#f5e7e7',
				marginTop: '1rem',
			}}
		>
			<h3>Game Over</h3>
			<p>
				<strong>Winner:</strong> {winner}
			</p>
			<p>
				<strong>Reason:</strong> {outcome.message}
			</p>
			{outcome.assassinated && (
				<p>
					<strong>Assassinated:</strong> {outcome.assassinated}
				</p>
			)}

			{outcome.roles && (
				<div style={{marginTop: '1rem'}}>
					<h4>Revealed Roles</h4>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
							gap: '0.5rem',
						}}
					>
						{outcome.roles.map((player: any, index: number) => (
							<div
								key={index}
								style={{
									border: '1px solid #ddd',
									padding: '0.5rem',
									backgroundColor: player.assassin ? '#ffcccc' : '#ffffff',
								}}
							>
								<strong>{player.name}</strong>: {player.role}
								{player.assassin && ' (Assassin)'}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
