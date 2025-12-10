import {env} from 'cloudflare:workers';
import {route} from 'rwsdk/router';
import {resetPersonService} from '../../services/person';
import {db, setupDb} from '@/db';
import {ExportPage} from './ExportPage';

export const adminRoutes = [
	route('/admin/export', [ExportPage]),
	route('/admin/map-uid', async ({request}) => {
		if (request.method !== 'POST') {
			return new Response('Method not allowed', {status: 405});
		}

		const formData = await request.formData();
		const uid = formData.get('uid') as string;
		const personId = formData.get('personId') as string;
		const newPersonName = formData.get('newPersonName') as string;
		const redirectTo = formData.get('redirectTo') as string;

		if (!uid) {
			return new Response('Missing uid', {status: 400});
		}

		try {
			await setupDb(env);

			let targetPersonId = personId;

			// If newPersonName is provided, create a new person
			if (newPersonName && !personId) {
				const newPerson = await db.person.create({
					data: {
						id: crypto.randomUUID(),
						name: newPersonName,
						createdAt: new Date(),
					},
				});
				targetPersonId = newPerson.id;
			}

			if (!targetPersonId) {
				return new Response('Missing personId or newPersonName', {status: 400});
			}

			// Check if UID is already mapped
			const existingMapping = await db.personUid.findUnique({
				where: {uid},
			});

			if (existingMapping) {
				return new Response('UID is already mapped to a person', {status: 400});
			}

			// Create the mapping
			await db.personUid.create({
				data: {
					id: crypto.randomUUID(),
					uid,
					personId: targetPersonId,
					createdAt: new Date(),
				},
			});

			// Reset the person service cache so it picks up the new mapping
			resetPersonService();

			// Redirect back to the person page
			const headers = new Headers();
			headers.set('Location', redirectTo || `/person/${targetPersonId}`);

			return new Response(null, {
				status: 302,
				headers,
			});
		} catch (error) {
			console.error('Failed to map UID to person:', error);
			return new Response('Internal server error', {status: 500});
		}
	}),
	route('/admin/unmap-uid', async ({request}) => {
		if (request.method !== 'POST') {
			return new Response('Method not allowed', {status: 405});
		}

		const formData = await request.formData();
		const uid = formData.get('uid') as string;
		const redirectTo = formData.get('redirectTo') as string;

		if (!uid) {
			return new Response('Missing uid', {status: 400});
		}

		try {
			await setupDb(env);

			// Delete the mapping
			await db.personUid.delete({
				where: {uid},
			});

			// Reset the person service cache
			resetPersonService();

			// Redirect back
			const headers = new Headers();
			headers.set('Location', redirectTo || '/players');

			return new Response(null, {
				status: 302,
				headers,
			});
		} catch (error) {
			console.error('Failed to unmap UID:', error);
			return new Response('Internal server error', {status: 500});
		}
	}),
];
