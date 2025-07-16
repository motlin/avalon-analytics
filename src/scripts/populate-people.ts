import {env} from 'cloudflare:workers';
import {defineScript} from 'rwsdk/worker';
import {db, setupDb} from '@/db';

interface PersonConfig {
	name: string;
	uid: string;
}

export default defineScript(async () => {
	await setupDb(env);

	const people: PersonConfig[] = [
		{
			name: 'CRAIGM',
			uid: 'KkpBQyWuNYgUzo9EWlgdcjI3E8Z2',
		},
		{
			name: 'JOSH',
			uid: 'QUhqe355N6bZesBOdQyXNgg2WC13',
		},
		{
			name: 'ANDREW',
			uid: 'Fz8u217SmBbU8xnuTZXCv8BqMrh2',
		},
		{
			name: 'VINAY',
			uid: 'OAeXkQCbwIPtZGuSbmNYSDN1kKA2',
		},
		{
			name: 'BJORN',
			uid: 'JDQAvdKckbUVuAE67zDLiKHLmdB3',
		},
		{
			name: 'JOSHC',
			uid: '5jPjVRuXF5hAEXBuKhSjbSqy4Nq2',
		},
	];

	console.log(`📋 Found ${people.length} people to populate`);

	for (const person of people) {
		const existing = await db.person.findFirst({
			where: {
				OR: [{name: person.name}, {uid: person.uid}],
			},
		});

		if (existing) {
			console.log(`⏭️  Skipping ${person.name} (already exists)`);
			continue;
		}

		await db.person.create({
			data: {
				name: person.name,
				uid: person.uid,
			},
		});

		console.log(`✅ Added ${person.name} (${person.uid})`);
	}

	console.log('🎭 Finished populating people');
});
