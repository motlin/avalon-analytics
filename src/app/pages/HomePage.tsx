import type {RequestInfo} from 'rwsdk/worker';

export function HomePage({}: RequestInfo) {
	return (
		<div>
			<h1>Welcome to Avalon Analytics</h1>
			<p>
				<a href="/games/">View All Games</a>
			</p>
		</div>
	);
}
