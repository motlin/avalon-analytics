#!/usr/bin/env npx tsx
/**
 * Ingest new games from Firestore into D1 database.
 *
 * Usage:
 *   npx tsx src/scripts/ingest-firestore.ts [--dry-run] [--limit N]
 *
 * This script fetches games from Firestore that aren't yet in D1
 * and inserts them via wrangler d1 execute.
 */

import {execSync} from 'child_process';
import * as fs from 'fs';
import {z} from 'zod';

const DATABASE_NAME = 'avalon-analytics-juicy-tyrannosaurus';
const BATCH_SIZE = 100;

let interrupted = false;
process.on('SIGINT', () => {
	console.log('\nInterrupted by user, exiting...');
	interrupted = true;
	process.exit(1);
});

const FIREBASE_PROJECT_ID = 'georgyo-avalon';
const FIREBASE_API_KEY = 'AIzaSyCwhCvO8NbTusBaHmHHnNT7yC0_11UL2RI';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

interface Args {
	dryRun: boolean;
	limit: number | null;
}

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

interface FirestoreListResponse {
	documents?: FirestoreDocument[];
	nextPageToken?: string;
}

function parseArgs(): Args {
	const args = process.argv.slice(2);
	const result: Args = {dryRun: false, limit: null};

	for (let index = 0; index < args.length; index++) {
		if (args[index] === '--dry-run') {
			result.dryRun = true;
		} else if (args[index] === '--limit' && args[index + 1]) {
			result.limit = parseInt(args[index + 1], 10);
			index++;
		}
	}

	return result;
}

function convertFirestoreValue(value: FirestoreValue): unknown {
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
		return value.arrayValue.values?.map((v) => convertFirestoreValue(v)) ?? [];
	}
	if (value.mapValue) {
		const result: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(value.mapValue.fields ?? {})) {
			result[key] = convertFirestoreValue(val);
		}
		return result;
	}
	return null;
}

function convertDocumentToObject(doc: FirestoreDocument): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	const docId = doc.name.split('/').pop() ?? '';
	result.id = docId;

	for (const [key, value] of Object.entries(doc.fields ?? {})) {
		result[key] = convertFirestoreValue(value);
	}

	return result;
}

async function getExistingGameIds(): Promise<Set<string>> {
	console.log('Fetching existing game IDs from D1...');

	const sql = 'SELECT firebaseKey FROM RawGameData';
	const tempFile = `/tmp/avalon-query-${Date.now()}.sql`;
	fs.writeFileSync(tempFile, sql);

	const output = execSync(`npx wrangler d1 execute ${DATABASE_NAME} --remote --yes --file="${tempFile}" --json`, {
		encoding: 'utf-8',
	});

	fs.unlinkSync(tempFile);

	const QueryResultSchema = z.array(
		z.object({
			results: z.array(z.object({firebaseKey: z.string()})),
		}),
	);

	const parsed = QueryResultSchema.parse(JSON.parse(output));
	const existingIds = new Set<string>();
	for (const result of parsed) {
		for (const row of result.results) {
			existingIds.add(row.firebaseKey);
		}
	}

	console.log(`Found ${existingIds.size} existing games in D1`);
	return existingIds;
}

async function fetchGamesFromFirestore(limit: number | null): Promise<Record<string, unknown>[]> {
	const games: Record<string, unknown>[] = [];
	let pageToken: string | undefined;
	const pageSize = 100;

	console.log('Fetching games from Firestore...');

	while (true) {
		let url = `${FIRESTORE_BASE_URL}/logs?pageSize=${pageSize}&orderBy=timeCreated desc&key=${FIREBASE_API_KEY}`;
		if (pageToken) {
			url += `&pageToken=${encodeURIComponent(pageToken)}`;
		}

		const response = await fetch(url);
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Firestore API error ${response.status}: ${errorText}`);
		}

		const data = (await response.json()) as FirestoreListResponse;

		if (data.documents) {
			for (const doc of data.documents) {
				games.push(convertDocumentToObject(doc));
				if (limit !== null && games.length >= limit) {
					console.log(`Fetched ${games.length} games from Firestore (limit reached)`);
					return games;
				}
			}
		}

		console.log(`Fetched ${games.length} games so far...`);

		if (!data.nextPageToken) {
			break;
		}
		pageToken = data.nextPageToken;
	}

	console.log(`Fetched ${games.length} total games from Firestore`);
	return games;
}

function escapeSQL(str: string): string {
	return str.replace(/'/g, "''");
}

function buildInsertSQL(firebaseKey: string, gameJson: Record<string, unknown>, createdAt: Date): string {
	const jsonStr = escapeSQL(JSON.stringify(gameJson));
	const createdAtStr = createdAt.toISOString();
	return `INSERT OR IGNORE INTO "RawGameData" ("firebaseKey", "gameJson", "createdAt") VALUES ('${escapeSQL(firebaseKey)}', '${jsonStr}', '${createdAtStr}');`;
}

function executeSQLBatch(statements: string[], dryRun: boolean): void {
	const sql = statements.join('\n');

	if (dryRun) {
		console.log('Would execute SQL:');
		console.log(sql.substring(0, 500) + (sql.length > 500 ? '...' : ''));
		return;
	}

	const tempFile = `/tmp/avalon-ingest-${Date.now()}.sql`;
	fs.writeFileSync(tempFile, sql);

	execSync(`npx wrangler d1 execute ${DATABASE_NAME} --remote --yes --file="${tempFile}"`, {
		stdio: 'inherit',
	});

	fs.unlinkSync(tempFile);
}

function extractTimeCreated(game: Record<string, unknown>): Date {
	const timeCreated = game.timeCreated as {_seconds?: number; _nanoseconds?: number} | undefined;
	if (timeCreated?._seconds !== undefined) {
		return new Date(timeCreated._seconds * 1000 + (timeCreated._nanoseconds ?? 0) / 1000000);
	}
	return new Date();
}

async function main() {
	const args = parseArgs();
	console.log('Ingest games from Firestore to D1');
	console.log(`Options: dryRun=${args.dryRun}, limit=${args.limit ?? 'none'}`);

	const existingIds = await getExistingGameIds();
	const firestoreGames = await fetchGamesFromFirestore(args.limit);

	const newGames = firestoreGames.filter((game) => {
		const gameId = game.id as string;
		return !existingIds.has(gameId);
	});

	console.log(`Found ${newGames.length} new games to ingest`);

	if (newGames.length === 0) {
		console.log('No new games to ingest');
		return;
	}

	let successCount = 0;
	let errorCount = 0;
	const statements: string[] = [];

	for (let index = 0; index < newGames.length; index++) {
		if (interrupted) break;

		const game = newGames[index];
		const gameId = game.id as string;

		const createdAt = extractTimeCreated(game);
		statements.push(buildInsertSQL(gameId, game, createdAt));
		successCount++;

		if (statements.length >= BATCH_SIZE) {
			console.log(`Executing batch ${Math.floor(index / BATCH_SIZE) + 1} (${successCount} games so far)...`);
			executeSQLBatch(statements, args.dryRun);
			statements.length = 0;
		}
	}

	if (statements.length > 0) {
		console.log(`Executing final batch (${statements.length} games)...`);
		executeSQLBatch(statements, args.dryRun);
	}

	console.log(`\nIngestion complete:`);
	console.log(`  Success: ${successCount}`);
	console.log(`  Errors: ${errorCount}`);
}

main().catch(console.error);
