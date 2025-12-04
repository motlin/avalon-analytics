import {env} from 'cloudflare:workers';
import {prefix, render, route} from 'rwsdk/router';
import {defineApp, ErrorResponse} from 'rwsdk/worker';
import {Document} from '@/app/Document';
import {setCommonHeaders} from '@/app/headers';
import {gameRoutes} from '@/app/pages/game/routes';
import {Home} from '@/app/pages/Home';
import {HomePage} from '@/app/pages/HomePage';
import {playersRoutes} from '@/app/pages/players/routes';
import {uidRoutes} from '@/app/pages/uid/routes';
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
	async ({ctx, request, response}) => {
		console.log('🔍 Worker env keys:', Object.keys(env));
		// Note: setupDb() is NOT called here to avoid Prisma WASM loading issues
		// It will be called lazily when db access is actually needed
		setupFirestoreRestService(env);

		// Only set up sessions if AUTH_SECRET_KEY is configured
		if (env.AUTH_SECRET_KEY) {
			setupSessionStore(env);
			try {
				ctx.session = await sessions.load(request);
			} catch (error) {
				if (error instanceof ErrorResponse && error.code === 401) {
					await sessions.remove(request, response.headers);
					response.headers.set('Location', '/user/login');

					return new Response(null, {
						status: 302,
						headers: response.headers,
					});
				}
				throw error;
			}
		} else {
			console.warn('AUTH_SECRET_KEY not configured, sessions disabled');
			ctx.session = null;
		}

		if (ctx.session?.userId) {
			// Lazy initialize Prisma only when we need to look up the user
			try {
				await setupDb(env);
				ctx.user = await db.user.findUnique({
					where: {
						id: ctx.session.userId,
					},
				});
			} catch (error) {
				console.error('Failed to load user from DB:', error);
				// Continue without user - pages that need auth will redirect
				ctx.user = null;
			}
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
		...playersRoutes,
		...uidRoutes,
	]),
]);
