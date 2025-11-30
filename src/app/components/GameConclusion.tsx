interface GameConclusionProps {
	winner: 'GOOD' | 'EVIL';
	reason: string;
	assassinated?: string;
	roles?: Array<{
		name: string;
		role: string;
		assassin?: boolean;
	}>;
}

export function GameConclusionComponent({winner, reason, assassinated, roles}: GameConclusionProps) {
	const isGoodWin = winner === 'GOOD';
	const assassin = roles?.find((r) => r.assassin)?.name;
	const assassinatedRole = roles?.find((r) => r.name === assassinated)?.role;

	return (
		<div
			style={{
				border: '3px solid',
				borderColor: isGoodWin ? '#4caf50' : '#f44336',
				borderRadius: '8px',
				padding: '2rem',
				backgroundColor: isGoodWin ? '#f1f8f4' : '#fef4f4',
				marginTop: '2rem',
				boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
			}}
		>
			<div
				style={{
					textAlign: 'center',
					marginBottom: '1.5rem',
				}}
			>
				<h2
					style={{
						fontSize: '2rem',
						color: isGoodWin ? '#2e7d32' : '#c62828',
						marginBottom: '0.5rem',
					}}
				>
					{isGoodWin ? '✨ Good Triumphs!' : '🔥 Evil Prevails!'}
				</h2>
				<p
					style={{
						fontSize: '1.25rem',
						color: '#555',
						margin: 0,
					}}
				>
					{reason}
				</p>
			</div>

			{assassinated && (
				<div
					style={{
						textAlign: 'center',
						padding: '1rem',
						backgroundColor: '#fff3cd',
						border: '1px solid #ffeaa7',
						borderRadius: '4px',
						marginBottom: '1.5rem',
					}}
				>
					<p
						style={{
							margin: 0,
							fontSize: '1.1rem',
							color: '#856404',
						}}
					>
						🗡️ <strong>{assassin || 'The Assassin'}</strong> assassinated <strong>{assassinated}</strong>
						{assassinatedRole && ` (${assassinatedRole})`}
					</p>
				</div>
			)}
		</div>
	);
}
