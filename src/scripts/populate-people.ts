import {env} from 'cloudflare:workers';
import {defineScript} from 'rwsdk/worker';
import {db, setupDb} from '@/db';

interface PersonConfig {
	fullName: string;
	uuids: string[];
	dateRanges?: Array<{
		startDate?: string;
		endDate?: string;
	}>;
}

// People mapping imported from avalon-log-scraper config.json5
const people: PersonConfig[] = [
	{
		fullName: 'Craig Motlin',
		uuids: ['KkpBQyWuNYgUzo9EWlgdcjI3E8Z2', 'uPT4Wazq4eVJGCp3SCbVOYqHaV22'],
	},
	{
		fullName: 'Josh Cho',
		uuids: [
			'HubiExy96fMyJzRvdUIOUtGpwov2',
			'ztIfQeTlR5bFoehW76VROSpKsBw1',
			'Qx6Ymo7Re0TfiHooOYW3yYnQ0bT2',
			'Iw9rvD95ftRLXZdzR6Ok5EXl25e2',
			'SOUlnCmIjgSXTtWO2hwVvKSdmhb2',
			'SoMmquxGnJegtjYNmzdTnMsvJzR2',
			'rFSo2VvMe3bpuQlq7epDAsJbGb13',
			'yimoGj1psHfLWBrDGO655yhfSqF2',
			'KLDruXdLRzdnvFv96Sx0MnmPTLf2',
			'UYUCDn6eIbMWZhH5JvwmWLSgnB22',
			'5jPjVRuXF5hAEXBuKhSjbSqy4Nq2',
			'uaJLsSFiArexJtYYqKrRJBHY1Jj2',
			'fnzgA9xZEwRYWbuCk4c6Z8Kus732',
			'TAEhMGBqUkUl8ldvWCW7GBk1Xf52',
			'YrsnA2TTUOVjy6epmMFO5af1Vcv2',
			'Sm9uYMgRZgh0XunBVXh7vSzcFS23',
			'88VzWTnKuJX7y3I5dEcXyJ3aO6P2',
			'h3oL8ULLygXFB9tbIVojBRtDOYJ3',
		],
		dateRanges: [{startDate: '2023-08-07'}],
	},
	{
		fullName: 'Steven Chen',
		uuids: [
			'LFh33CYIbiQjlVEd1VLtlOVirrm1',
			'2optfcFMq5Tl5nN3683oBkkjJrf1',
			'H4oFKTKTUkWRtZ7p2JZOOCrv2qk1',
			'Ai0jkHidkSPGMwfQ3A9IqLmgJ5q1',
			'r8rhGQ01qhhlJ6o0Z0uMsArNPG63',
			'UkfkdyhBrXgcf5Ff2FnzFQaNZIo1',
			'TcC23syBzYcQbhS0aX5FO1NDzBI2',
			'C4YRmwWzoXMHSARDrFIMFKauVuV2',
			'YMhVWadVYiMxYXcggsewhA0QWgI2',
			'FF2WRClTIffNn5Cyno8WFj3j1lX2',
			'ryJEerFzGCg1uSCJu3e4XCZIsHC2',
			'nDYuRnqyXSPxBRUUznC4dom8gZl2',
			'eTfswLlwfpeDEygsatkpELwVYzm2',
			'8OmVj2JuQiQb3JKfSrxaZeoZW6E2',
			'FSDZ08ud3gOtF7GbN9w7SZpaYPq1',
			'CQ3pC9UOHWVxhxJIIYHYDhx3aS93',
			'i7Nd7JMsxne0R2BbtAIBNhCH1Po2',
			'KIkxRmGNHDRAxsT5WDlWwtFLyer1',
			'kNBQq5mHzpcyKUNe0SQYVlqxbVp2',
			'u0x17librFT6ylzWPzvAgH9iljV2',
			'GkVpzYlVpOhYmzg6IrK1NOhXAvr1',
			'hCwk2D7gDnNvty6wtKVBEVkiAd62',
			'r4qEM2e01EfH0L66IcSeB9wQiR73',
			'sHFTGRCKshRef3MG3KraZ9irFzX2',
		],
	},
	{
		fullName: 'Andrew Rapport',
		uuids: [
			'Fz8u217SmBbU8xnuTZXCv8BqMrh2',
			'TPvGSZasXmb3QrzA1eDeHig9K023',
			'jlDo6LCSX6byvmeQ4k84BHNwsBr2',
			'mCQvYJE8qXVvUAKkMw0G1dfGih32',
		],
	},
	{
		fullName: 'Zehua Lyu',
		uuids: [
			'AIJ3gVomIKVI8eYgL69kQlfWpEI3',
			'O3QPeR2WI4NfJADulX1YZDwEyY72',
			'uqTaqUdWpqRWT4CwHt4j6V2dmSx1',
			'StFNNEG5OmNPEHJShRnBfrUaUVI3',
			'Zw4mV2rsP4WwwFUnhqRhK9FfU2B2',
			'yQTNvhT36uQknznYbPaykiyamqB2',
			'IMBRWdESZqQKsHdHNnYrRZfWukP2',
			'y0vynhwdlZTCT3DzyAwdiYBU2jv1',
		],
	},
	{
		fullName: 'Rob Golshan',
		uuids: [
			'rkj79zqVHeNm8a37qpxUkx96dim2',
			'6C6IftW9DHZQQDBYM5MqjHKDzkq1',
			'UldqZPuRFHSXEHI5xiq28kKkk5M2',
			'snnnvSyrztRLjqyUoMejrVddNoo1',
			'G39qdDABZsZND2BoSK8naeCkQq42',
			'JYFRixEf6Da9AB8XuBC9FJqJ2VE3',
			'o5qWrSsvc3ZCr9XpU3PND4sKz633',
			'KkdYmeVIUVdayugM0SNKrntOHF92',
			'EveGfuhgcAOLNymvE7QRmYK3yWp1',
			'UjC606BDcNRVxEmW07tuBcGFo2i1',
			'kXi9FIrtFAhRl5bJDxri1R1uUkb2',
			'azcdrRTveQgtcqFvdRoErWeIbv52',
			'5v4hAQyYOWNmGb8gCP6U1mMoyeH2',
			'bfTXrBr1MRgNlQsZ4HfrvzrDFE82',
			'peFNu4zIuORO2AT1Ug8byOrSuDu1',
			'gAoQgMDTNRNxLeC0NhMs0pNgv0q2',
			'pD0kmN5poyVmEAK2AIbK2by7Qbx2',
		],
	},
	{
		fullName: 'Vinay Viswanadha',
		uuids: [
			'lmNuIA15hrTsOWRFGHLWQ8KPBcg2',
			'mqQy98czswdRS46mXfhMHRUNGLc2',
			'ruI8dOzxU9gUbhojgt9ZFzIFkIc2',
			'OAeXkQCbwIPtZGuSbmNYSDN1kKA2',
			'KKUp8kNJYiT1bRI8PI9UP6fxAXw1',
			'yPx0DoQktBgKdEQre12iC0OBR7E3',
			'K8q3LLdyZ8cRSELfFjqFgPqpBBw1',
			'Cge7usLm94Z6GXtFl8SErsHhfed2',
			'ab6lQ1SzPxUGFMQoO73Mets14Dr1',
			'b3oVZvv3TVVTq7tjB8PZj2UnOjP2',
			'pyuOGEqpVCSd1Xpr30uNZFrFgVx1',
			'JFmbYA1HbQY3ayyJDh4RNEb7b8j1',
			'p5c5CPAWhwefAWvT2iG5NqEuOEz2',
			'DoT2Ahc2oqPNIWAylbnyrbj8NKG2',
		],
	},
	{
		fullName: 'Jared Bass',
		uuids: ['wqfRyNPzBWPGRpvume6YNBKUeLh1', 'pREvrkkbIkfKP0kKasUoTI2E2Lr2'],
	},
	{
		fullName: 'Justin Wang',
		uuids: ['PU8n22WDl6UajwGWaxWFTQu0fOA2', 'UCagxlYH3wO8RZC8V9rvBAj26ho2'],
	},
	{
		fullName: 'Allen Li',
		uuids: [
			'mix8pDsdGYXqnNDijOn4VielgNp1',
			'Tbzfh3CZnbgf2gtocnG53EefcKZ2',
			'5wJLXwcbFUPyTiLQQFwhSyYgo8S2',
			'F8zswZe0jiXHwA92csr2My7xuOO2',
			'BcFmqOFBQeeX1cUP0nI0RybTnIf1',
			'eIBTxwD0wbdpTKfxVwTYfuV1dcW2',
		],
	},
	{
		fullName: 'Michael Hankin',
		uuids: ['T7JOmln5gNSQ1irVbjoGp8O9ATJ2'],
	},
	{
		fullName: 'Tifany Tong',
		uuids: [
			'IaUj5qxwvxNJglAW2tkUwDlxnGZ2',
			'ipMQ74rvb3Soz2pb9muzdXuLqDy1',
			'kwU3c8v4eLQWb3kZv86leISbbjx1',
			'KXuPsxGIlOPI4EAT8ztligVvUHw1',
			'5ZNxPHA5zFX53AaA2pG7wX9uVmv2',
			'9nUkZJYDMeOyUBnExrjbhsux6cf1',
			'MpVHd2AYsDSlDDpKFgDDHmHe5v52',
			'fcjVFhA4N9giV3Gu6KwhkzbIjPZ2',
			'25H3DvRolKR34aK0CyO6yrWlO402',
			'el4tTSCCstet4aSjoTeZ1fUC2tr1',
			'ZQULyipV0eVx1on16yQfwRCJQrG2',
			'etofrVOEYDWR4vzT0IfEbcFDWSm2',
			'4FQN0LaMRLalXNh1gHKESP2I2Bq1',
			'rAM7RXtM5JZUPN5QElEtiT925xz1',
			'GIw211TEZ8coLmPqe3Ur4Yaixnf2',
			'dcDrPmd0wUNcns7V2DoN7zauBap1',
			'XpqHNMK676TuibBZsFWREnzcNEF3',
			'W83wjdBdUSd32UV19h92Jw766173',
			'L0juG850npNupm4qwYRMl7wNWiq1',
			'If6NjaFB8oRYXNnxDoXjtTXiRgb2',
			'4zISAGQU8TeQVeHcKa9vnFaROEJ2',
			'pT9WQpL6vxNL91FgdW5gpfCNWjs1',
			'C745fv7MYPbvJLGU9V03YRT1wME2',
		],
	},
	{
		fullName: 'Bjorn Bjornsson',
		uuids: [
			'F76Vr62YYxUltDuMyaJqwDsusEe2',
			'sAhDKEamJofP0GSnqtVj8wTtXMg2',
			'gyP5NZq74oVSB99YaU1ztAvL6192',
			'ff95xlTjLHQZp7cukitOG9ADTty1',
			'rrB3kPelp0PGikXrXGy3Lo6VvTV2',
			'JDQAvdKckbUVuAE67zDLiKHLmdB3',
			'BVk8JIrX4AadgFWF0DPwjXnHUMF2',
			'EPf7QqQmFkbuXKlED2cXrb8v9HL2',
			'BLMFSrlbKMR6BgHnk8OI6inxljJ3',
			'Y4SNrKXXbASF1rGsOmjsji0ZrW33',
			'vT34BizugcPMFgqGwJTazTiMOTk2',
		],
	},
	{
		fullName: 'Shu Fang',
		uuids: [
			'o39cLAkEcOUFcNdhvxNx0Qrr9qF3',
			'WJsCKGDYVHfwZS4y18S8XIUt8kG2',
			'Kl6ZboYyhLMlFcM6yCvkA14wiQU2',
			'ot8I8o3eXjfrSMLYsqERS0eiUBx1',
		],
	},
	{
		fullName: 'Andres Montoya',
		uuids: ['xTBvZKK7VqVCsAg3sSAxbJEuQWH2', 'tzNPuXLWgLO8jiBI1szD5NXBF1g2'],
	},
	{
		fullName: 'Nathan Ang',
		uuids: ['V53DuzXwqkWbl4DYYxsIIZfDyjA3'],
	},
	{
		fullName: 'Ryan Petrich',
		uuids: ['R63C2r6QZlT3cvaIY2sO8K4DrHg2'],
	},
	{
		fullName: 'Matt Metlis',
		uuids: ['pTXCU5GmfnNem0mQAsy1Lmc6WVu2'],
	},
	{
		fullName: 'Mandeep Bedi',
		uuids: [
			'q4Yk4uVjiZdIGAkBvOMyAtosgAf2',
			'73lvv07ruCSR5JFQzwDksbNAyFL2',
			'nIuEnKm1GUf1OyMEAkdzjuuHGQj1',
			'JLQ4UvLgOKSjgXPttzcuBmIjoBS2',
		],
	},
	{
		fullName: 'Leah Peterson',
		uuids: ['b8l89fjfmgbIhNsXW6GYqu4jPBj1'],
	},
	{
		fullName: 'Alex Li',
		uuids: ['Ipvgq9H46EcJXzqBskxtK0YCoI42'],
	},
	{
		fullName: 'Nate Jones',
		uuids: ['rg4cbZTPNZVii5ZV8JdpGaLag2O2', 'OlK1hriBd5eCevtOkCp7iAoKld53'],
	},
	{
		fullName: 'Josh Kern',
		uuids: [
			'AKvuJwDnjhTbaLoOGcywuKO1S013',
			'QUhqe355N6bZesBOdQyXNgg2WC13',
			'HlLK955dl8cdRVvHBf2s6Dq2jWm2',
			'vqDKpYoXAJPLLDHVfmRHc7q8BTm2',
			'kJAscfJrajatPVGbL76ftCQFlwI2',
			'vrWnO1ewa4Xpb79F0Y2iQ1EKTy33',
			'MZKOagEGowXlsO8V2ArKkEqr9my2',
			'JKbD9rPWncYDhFTq0oC5i9K10Sa2',
			'7ckbMYcDpqQSP7pnE56CEhCpslr1',
			'z0oCoRhTTSMcG1t2Y82GBe1ylII3',
			'TLvd7JGC5qeXDDrKrSXN7Ih4OD12',
			'nvk5ufhhqTaRHPmATmuqyToUWJ83',
			'xxo7PZn4alQDxpnBJzoDB1VZXcj1',
			'nQt10QZtf2X6ttmq1CuJWHMSOeq1',
			'hFf7ejYF7jgFGl8EtmyV36381JB2',
			'iW8icQta3hg3cEnJxP2B80xf18p1',
			'i2VEtmKHwxODRCS5UFLzHOO11992',
			'6Zjm24r3h3g0u1tRS4Z5CzYPjmt1',
			'yR38iIfWOqfadPvAf4RMEKqNpv93',
			'0HlljMM7saQNthOxoup0IJIpVQ83',
		],
	},
	{
		fullName: 'Ken Kaurov',
		uuids: ['sTASfTmbLkOIYqjTzlVuyh5Z8qp2'],
	},
	{
		fullName: 'Flora Cheng',
		uuids: ['xZLkr6BbEXZjxfe0RIMHL7QbnEZ2'],
	},
	{
		fullName: 'Luke Mo',
		uuids: ['xsd8LG6MrbXCA9Uobui0Jf9QqJW2', 'GG7CLNG461XjvryNp4C9Y0aIIeA3', '0HbPRm8uZpMTGVUipMLK4mqGh302'],
	},
	{
		fullName: 'Rachel Levy',
		uuids: [
			'IhTgiVy6z2eozUvWxhdUmHjRpxv1',
			'BZHinVGky3ZJ0SCEhl7P79NagEn1',
			'k0KY8CHhWKWfBtRNa2ThoWhaVjq2',
			'gNexj8Rf2ZTq8wAtD7QNDPkV0cE2',
		],
		dateRanges: [{startDate: '2024-08-05'}],
	},
	{
		fullName: 'Rachel Hu',
		uuids: ['q65NXp26qfhKD9Wz8xACYfQOOaJ2', 'GaEv78wSpqS29HOCwjBzxRht2zj1', 'xrAL0nvsDJMIa4aTyG1qDjiJAru1'],
		dateRanges: [{startDate: '2024-05-28', endDate: '2024-08-03'}],
	},
	{
		fullName: 'Kathleen Kusworo',
		uuids: ['8N4iy4mM9ZNEHDg9IEVdKBmCXo22', 'uDY3YxudPTOJPUTz6FNpJNT5Zhz1'],
	},
	{
		fullName: 'Yousef Amin',
		uuids: ['LbJWjLmN4GTHDeH6dPf4cOXd7H32', 'kAM6Yi2FqVMvi5zuUUa7fwC9jY92', 'dEPCGTXrPoQmzJtTlyokgnPWTSH2'],
	},
	{
		fullName: 'Luca',
		uuids: ['MQGFVUSyqjSb7E3kCEQmuaMutTI2'],
	},
	{
		fullName: 'Sam Mincheva',
		uuids: ['HJBQW9sd6VfOU6ohCI3oCUn7c7p2'],
	},
];

export default defineScript(async () => {
	await setupDb(env);

	console.log(`Found ${people.length} people to populate`);

	for (const person of people) {
		// Check if person already exists by name
		const existingPerson = await db.person.findFirst({
			where: {name: person.fullName},
			include: {uids: true},
		});

		if (existingPerson) {
			// Add any new UIDs that don't exist yet
			const existingUids = new Set(existingPerson.uids.map((u) => u.uid));
			const newUids = person.uuids.filter((uid) => !existingUids.has(uid));

			if (newUids.length > 0) {
				for (const uid of newUids) {
					// Check if UID is already assigned to another person
					const existingUidEntry = await db.personUid.findUnique({
						where: {uid},
					});

					if (!existingUidEntry) {
						await db.personUid.create({
							data: {
								uid,
								personId: existingPerson.id,
							},
						});
						console.log(`Added UID ${uid} to ${person.fullName}`);
					}
				}
			} else {
				console.log(`Skipping ${person.fullName} (already exists with all UIDs)`);
			}
			continue;
		}

		// Create new person with all UIDs
		await db.person.create({
			data: {
				name: person.fullName,
				uids: {
					create: person.uuids.map((uid) => ({uid})),
				},
			},
		});

		console.log(`Added ${person.fullName} with ${person.uuids.length} UIDs`);
	}

	console.log('Finished populating people');
});
