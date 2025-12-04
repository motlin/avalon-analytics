import {db} from '@/db';

export interface PersonWithUids {
	id: string;
	name: string;
	uids: string[];
}

/**
 * Service to resolve player UIDs to person names using the database mapping.
 * Handles the case where one person may have multiple anonymous accounts (UIDs).
 */
export class PersonService {
	private uidToPersonName: Map<string, string> = new Map();
	private uidToPersonId: Map<string, string> = new Map();
	private initialized = false;

	/**
	 * Loads all person-UID mappings from the database.
	 * Should be called once at service initialization.
	 */
	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}

		const people = await db.person.findMany({
			include: {uids: true},
		});

		for (const person of people) {
			for (const personUid of person.uids) {
				this.uidToPersonName.set(personUid.uid, person.name);
				this.uidToPersonId.set(personUid.uid, person.id);
			}
		}

		this.initialized = true;
	}

	/**
	 * Resolves a UID to a person's name.
	 * Returns undefined if the UID is not mapped to any person.
	 */
	getPersonName(uid: string): string | undefined {
		return this.uidToPersonName.get(uid);
	}

	/**
	 * Resolves a UID to a person's ID.
	 * Returns undefined if the UID is not mapped to any person.
	 */
	getPersonId(uid: string): string | undefined {
		return this.uidToPersonId.get(uid);
	}

	/**
	 * Returns true if the UID is mapped to a person.
	 */
	hasMapping(uid: string): boolean {
		return this.uidToPersonName.has(uid);
	}

	/**
	 * Gets all UIDs for a given person ID.
	 */
	async getUidsForPerson(personId: string): Promise<string[]> {
		const person = await db.person.findUnique({
			where: {id: personId},
			include: {uids: true},
		});

		if (!person) {
			return [];
		}

		return person.uids.map((u) => u.uid);
	}

	/**
	 * Gets all people with their UIDs.
	 */
	async getAllPeople(): Promise<PersonWithUids[]> {
		const people = await db.person.findMany({
			include: {uids: true},
			orderBy: {name: 'asc'},
		});

		return people.map((p) => ({
			id: p.id,
			name: p.name,
			uids: p.uids.map((u) => u.uid),
		}));
	}

	/**
	 * Gets all UIDs that are not mapped to any person.
	 * Useful for discovering unknown players that may need to be added.
	 */
	filterUnmappedUids(uids: string[]): string[] {
		return uids.filter((uid) => !this.uidToPersonName.has(uid));
	}

	/**
	 * Creates a map from UID to display name.
	 * Uses person name if mapped, falls back to in-game name if provided.
	 */
	createDisplayNameMap(players: Array<{uid: string; name: string}>): Map<string, string> {
		const displayNames = new Map<string, string>();

		for (const player of players) {
			const personName = this.getPersonName(player.uid);
			displayNames.set(player.uid, personName ?? player.name);
		}

		return displayNames;
	}
}

let personService: PersonService | null = null;

/**
 * Gets the singleton PersonService instance.
 * Call initialize() before using other methods.
 */
export function getPersonService(): PersonService {
	if (!personService) {
		personService = new PersonService();
	}
	return personService;
}

/**
 * Resets the person service singleton.
 * Useful for testing or when database changes require a refresh.
 */
export function resetPersonService(): void {
	personService = null;
}
