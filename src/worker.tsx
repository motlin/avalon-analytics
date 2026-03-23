import {env} from 'cloudflare:workers';
import {render, route} from 'rwsdk/router';
import {defineApp} from 'rwsdk/worker';
import {Document} from '@/app/Document';
import {setCommonHeaders} from '@/app/headers';
import {adminRoutes} from '@/app/pages/admin/routes';
import {gameRoutes} from '@/app/pages/game/routes';
import {HomePage} from '@/app/pages/HomePage';
import {peopleRoutes} from '@/app/pages/people/routes';
import {personRoutes} from '@/app/pages/person/routes';
import {playersRoutes} from '@/app/pages/players/routes';
import {predicateRoutes} from '@/app/pages/predicate/routes';
import {setupFirestoreRestService} from '@/app/services/firestore-rest';

export default defineApp([
	setCommonHeaders(),
	async () => {
		console.log('🔍 Worker env keys:', Object.keys(env));
		// Note: setupDb() is NOT called here to avoid Prisma WASM loading issues
		// It will be called lazily when db access is actually needed
		setupFirestoreRestService(env);
	},
	render(Document, [
		route('/', HomePage),
		...adminRoutes,
		...gameRoutes,
		...peopleRoutes,
		...personRoutes,
		...playersRoutes,
		...predicateRoutes,
	]),
]);
