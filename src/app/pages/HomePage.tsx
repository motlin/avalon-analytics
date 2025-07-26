import type {RequestInfo} from 'rwsdk/worker';
import {ThemeToggle} from '../components/ThemeToggle';

export function HomePage({}: RequestInfo) {
	return (
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Welcome to Avalon Analytics</h1>
				<ThemeToggle />
			</div>
			<p>
				<a
					href="/games/"
					className="text-primary hover:underline"
				>
					View All Games
				</a>
			</p>
		</div>
	);
}
