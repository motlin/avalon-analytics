import {env} from 'cloudflare:workers';
import {prefix, render, route} from 'rwsdk/router';
import {defineApp, ErrorResponse} from 'rwsdk/worker';
import {Document} from '@/app/Document';
import {setCommonHeaders} from '@/app/headers';
import {gameRoutes} from '@/app/pages/game/routes';
import {Home} from '@/app/pages/Home';
import {HomePage} from '@/app/pages/HomePage';
import {userRoutes} from '@/app/pages/user/routes';
import {setupFirestoreRestService} from '@/app/services/firestore-rest';
import {db, setupDb, type User} from '@/db';
import type {Session} from './session/durableObject';
import {sessions, setupSessionStore} from './session/store';

export {SessionDurableObject} from './session/durableObject';

export type AppContext = {
	session: Session | null;
	user: User | null;
};

export default defineApp([
	setCommonHeaders(),
	async ({ctx, request, headers}) => {
		console.log('🔍 Worker env keys:', Object.keys(env));
		await setupDb(env);
		setupSessionStore(env);
		setupFirestoreRestService(env);

		try {
			ctx.session = await sessions.load(request);
		} catch (error) {
			if (error instanceof ErrorResponse && error.code === 401) {
				await sessions.remove(request, headers);
				headers.set('Location', '/user/login');

				return new Response(null, {
					status: 302,
					headers,
				});
			}

			throw error;
		}

		if (ctx.session?.userId) {
			ctx.user = await db.user.findUnique({
				where: {
					id: ctx.session.userId,
				},
			});
		}
	},
	render(Document, [
		route('/', HomePage),
		route('/protected', [
			({ctx}) => {
				if (!ctx.user) {
					return new Response(null, {
						status: 302,
						headers: {Location: '/user/login'},
					});
				}
			},
			Home,
		]),
		prefix('/user', userRoutes),
		...gameRoutes,
	]),
]);
