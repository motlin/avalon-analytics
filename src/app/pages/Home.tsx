import type {RequestInfo} from 'rwsdk/worker';
import {ThemeToggle} from '../components/ThemeToggle';

export function Home({ctx}: RequestInfo) {
	return (
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Avalon Analytics</h1>
				<ThemeToggle />
			</div>
			<p>{ctx.user?.username ? `You are logged in as user ${ctx.user.username}` : 'You are not logged in'}</p>
		</div>
	);
}
