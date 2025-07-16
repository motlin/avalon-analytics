import {type Game, GameSchema, type Stats, StatsSchema} from '../models/game';

interface FirestoreValue {
	stringValue?: string;
	integerValue?: string;
	doubleValue?: number;
	booleanValue?: boolean;
	timestampValue?: string;
	arrayValue?: {values: FirestoreValue[]};
	mapValue?: {fields: Record<string, FirestoreValue>};
}

interface FirestoreDocument {
	name: string;
	fields: Record<string, FirestoreValue>;
	createTime: string;
	updateTime: string;
}

export class FirestoreRestService {
	private projectId: string;
	private apiKey: string;
	private baseUrl: string;

	constructor(env: any) {
		if (!env) {
			throw new Error('Environment object is required');
		}

		this.projectId = env.FIREBASE_PROJECT_ID;
		this.apiKey = env.FIREBASE_API_KEY;

		if (!this.projectId || !this.apiKey) {
			throw new Error(
				'Missing required Firebase configuration: FIREBASE_PROJECT_ID and FIREBASE_API_KEY must be set',
			);
		}

		console.log('🔍 FirestoreRestService initialized with project:', this.projectId);
		this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
	}

	private convertFirestoreValue(value: FirestoreValue): any {
		if (value.stringValue !== undefined) return value.stringValue;
		if (value.integerValue !== undefined) return parseInt(value.integerValue);
		if (value.doubleValue !== undefined) return value.doubleValue;
		if (value.booleanValue !== undefined) return value.booleanValue;
		if (value.timestampValue !== undefined) {
			const date = new Date(value.timestampValue);
			return {
				_seconds: Math.floor(date.getTime() / 1000),
				_nanoseconds: (date.getTime() % 1000) * 1000000,
			};
		}
		if (value.arrayValue) {
			return value.arrayValue.values?.map((v) => this.convertFirestoreValue(v)) || [];
		}
		if (value.mapValue) {
			const result: Record<string, any> = {};
			for (const [key, val] of Object.entries(value.mapValue.fields || {})) {
				result[key] = this.convertFirestoreValue(val);
			}
			return result;
		}
		return null;
	}

	private convertDocumentToObject(doc: FirestoreDocument): Record<string, any> {
		const result: Record<string, any> = {};
		const docId = doc.name.split('/').pop() || '';
		result.id = docId;

		for (const [key, value] of Object.entries(doc.fields || {})) {
			result[key] = this.convertFirestoreValue(value);
		}

		return result;
	}

	private validateGame(data: Record<string, any>): Game | null {
		try {
			return GameSchema.parse(data);
		} catch (error) {
			console.error(`Failed to validate game ${data.id}:`, error);
			return null;
		}
	}

	async getGameLogs(limitCount = 50, pageToken?: string): Promise<{games: Game[]; nextPageToken?: string}> {
		let url = `${this.baseUrl}/logs?pageSize=${limitCount}&orderBy=timeCreated desc&key=${this.apiKey}`;

		if (pageToken) {
			url += `&pageToken=${encodeURIComponent(pageToken)}`;
		}

		try {
			const response = await fetch(url);
			if (!response.ok) {
				const errorText = await response.text();
				console.error('Firestore API error response:', errorText);
				throw new Error(`Firestore API error: ${response.status}`);
			}

			const data = (await response.json()) as {
				documents?: FirestoreDocument[];
				nextPageToken?: string;
			};
			const games: Game[] = [];

			if (data.documents) {
				for (const doc of data.documents) {
					const gameData = this.convertDocumentToObject(doc);
					const game = this.validateGame(gameData);
					if (game) {
						games.push(game);
					}
				}
			}

			return {
				games,
				nextPageToken: data.nextPageToken,
			};
		} catch (error) {
			console.error('Failed to fetch game logs:', error);
			throw error;
		}
	}

	async getGameLogById(gameId: string): Promise<Game | null> {
		const url = `${this.baseUrl}/logs/${gameId}?key=${this.apiKey}`;

		try {
			const response = await fetch(url);
			if (response.status === 404) {
				return null;
			}
			if (!response.ok) {
				throw new Error(`Firestore API error: ${response.status}`);
			}

			const doc = (await response.json()) as FirestoreDocument;
			const gameData = this.convertDocumentToObject(doc);
			return this.validateGame(gameData);
		} catch (error) {
			console.error('Failed to fetch game by ID:', error);
			throw error;
		}
	}

	async getStats(): Promise<Stats | null> {
		const url = `${this.baseUrl}/stats/global?key=${this.apiKey}`;

		try {
			const response = await fetch(url);
			if (response.status === 404) {
				return null;
			}
			if (!response.ok) {
				throw new Error(`Firestore API error: ${response.status}`);
			}

			const doc = (await response.json()) as FirestoreDocument;
			const statsData = this.convertDocumentToObject(doc);

			try {
				return StatsSchema.parse(statsData);
			} catch (error) {
				console.error('Failed to validate stats:', error);
				return null;
			}
		} catch (error) {
			console.error('Failed to fetch stats:', error);
			throw error;
		}
	}
}

let firestoreRestService: FirestoreRestService;

export function setupFirestoreRestService(env: any) {
	firestoreRestService = new FirestoreRestService(env);
}

export function getFirestoreRestService(): FirestoreRestService {
	if (!firestoreRestService) {
		throw new Error('FirestoreRestService not initialized. Call setupFirestoreRestService(env) first.');
	}
	return firestoreRestService;
}
