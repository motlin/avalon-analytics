import type {RequestInfo} from 'rwsdk/worker';

export function HomePage({}: RequestInfo) {
	return (
		<div style={{backgroundColor: '#b2ebf2', minHeight: '100vh'}}>
			<div
				style={{
					backgroundColor: '#80deea',
					padding: '16px 30px',
					textAlign: 'center',
				}}
			>
				<h1 style={{margin: 0, fontSize: '1.5rem', fontWeight: 'bold'}}>Avalon Analytics</h1>
			</div>
			<div
				style={{
					padding: '32px 16px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<p style={{fontSize: '1.25rem', marginBottom: '24px'}}>Analyze your Avalon game history</p>
				<a
					href="/games/"
					style={{
						backgroundColor: '#1976d2',
						color: 'white',
						padding: '12px 24px',
						borderRadius: '4px',
						textDecoration: 'none',
						fontSize: '1rem',
						fontWeight: 'bold',
					}}
				>
					View All Games
				</a>
			</div>
		</div>
	);
}
