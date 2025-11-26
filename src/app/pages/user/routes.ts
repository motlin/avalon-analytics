import {route} from 'rwsdk/router';
import {sessions} from '@/session/store';
import {Login} from './Login';

export const userRoutes = [
	route('/login', [Login]),
	route('/logout', async ({request}) => {
		const headers = new Headers();
		await sessions.remove(request, headers);
		headers.set('Location', '/');

		return new Response(null, {
			status: 302,
			headers,
		});
	}),
];
