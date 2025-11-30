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

			{roles && roles.length > 0 && (
				<div>
					<h3
						style={{
							fontSize: '1.5rem',
							marginBottom: '1rem',
							color: '#333',
							textAlign: 'center',
						}}
					>
						Revealed Identities
					</h3>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
							gap: '1rem',
						}}
					>
						{roles.map((player, index) => {
							const isEvil = [
								'MORDRED',
								'MORGANA',
								'ASSASSIN',
								'OBERON',
								'EVIL MINION',
								'Mordred',
								'Morgana',
								'Assassin',
								'Minion of Mordred',
								'Oberon',
							].includes(player.role);

							return (
								<div
									key={index}
									style={{
										border: '2px solid',
										borderColor: isEvil ? '#ef5350' : '#66bb6a',
										borderRadius: '6px',
										padding: '1rem',
										backgroundColor: isEvil ? '#ffebee' : '#e8f5e9',
										boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
									}}
								>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
										}}
									>
										<strong
											style={{
												fontSize: '1.1rem',
												color: '#333',
											}}
										>
											{player.name}
										</strong>
										{player.assassin && (
											<span
												style={{
													fontSize: '1.2rem',
												}}
											>
												🗡️
											</span>
										)}
									</div>
									<div
										style={{
											marginTop: '0.5rem',
											fontSize: '0.95rem',
											color: isEvil ? '#c62828' : '#2e7d32',
											fontWeight: 500,
										}}
									>
										{player.role}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
