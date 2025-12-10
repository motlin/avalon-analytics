#!/usr/bin/env npx tsx
/**
 * Import game files from local disk into D1 database.
 *
 * Usage:
 *   npx tsx src/scripts/import-games.ts [--local] [--dry-run] [--limit N] [--batch-size N]
 *
 * Options:
 *   --local       Use local D1 database instead of remote (default: remote)
 *   --dry-run     Show what would be done without executing
 *   --limit N     Limit number of games to import
 *   --batch-size N  Number of games per SQL batch (default: 1000)
 *
 * This script reads game JSON files from /Users/craig/projects/avalonlogs/logs
 * and inserts them into the RawGameData table via wrangler d1 execute.
 */

import {execSync} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {z} from 'zod';

const LOGS_DIR = '/Users/craig/projects/avalonlogs/logs';
const DATABASE_NAME = 'avalon-analytics-juicy-tyrannosaurus';
const DEFAULT_BATCH_SIZE = 1000;

let interrupted = false;
process.on('SIGINT', () => {
	console.log('\nInterrupted by user, exiting...');
	interrupted = true;
	process.exit(1);
});

interface Args {
	dryRun: boolean;
	limit: number | null;
	batchSize: number;
	local: boolean;
}

function parseArgs(): Args {
	const args = process.argv.slice(2);
	const result: Args = {dryRun: false, limit: null, batchSize: DEFAULT_BATCH_SIZE, local: false};

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--dry-run') {
			result.dryRun = true;
		} else if (args[i] === '--local') {
			result.local = true;
		} else if (args[i] === '--limit' && args[i + 1]) {
			result.limit = parseInt(args[i + 1], 10);
			i++;
		} else if (args[i] === '--batch-size' && args[i + 1]) {
			result.batchSize = parseInt(args[i + 1], 10);
			i++;
		}
	}

	return result;
}

function escapeSQL(str: string): string {
	return str.replace(/'/g, "''");
}

function extractPlayerUids(game: object): string[] {
	const gameObj = game as {players?: Array<{uid?: string}>};
	if (!Array.isArray(gameObj.players)) {
		return [];
	}
	return gameObj.players.map((p) => p.uid).filter((uid): uid is string => typeof uid === 'string');
}

function getGameFiles(limit: number | null): string[] {
	const files = fs.readdirSync(LOGS_DIR).filter((f) => !f.startsWith('.'));

	// Sort by filename (which is timestamp-based) for consistent ordering
	files.sort();

	if (limit !== null) {
		return files.slice(0, limit);
	}

	return files;
}

function buildInsertSQL(firebaseKey: string, gameJson: object, createdAt: Date): string[] {
	const jsonStr = escapeSQL(JSON.stringify(gameJson));
	const createdAtStr = createdAt.toISOString();
	const statements: string[] = [];

	statements.push(
		`INSERT OR IGNORE INTO "RawGameData" ("firebaseKey", "gameJson", "createdAt") VALUES ('${escapeSQL(firebaseKey)}', '${jsonStr}', '${createdAtStr}');`,
	);

	const playerUids = extractPlayerUids(gameJson);
	for (const uid of playerUids) {
		const id = crypto.randomUUID();
		statements.push(
			`INSERT OR IGNORE INTO "PlayerGame" ("id", "playerUid", "firebaseKey", "createdAt") VALUES ('${escapeSQL(id)}', '${escapeSQL(uid)}', '${escapeSQL(firebaseKey)}', '${createdAtStr}');`,
		);
	}

	return statements;
}

function getExistingGameIds(local: boolean): Set<string> {
	const target = local ? 'local' : 'remote';
	console.log(`Fetching existing game IDs from D1 (${target})...`);

	const sql = 'SELECT firebaseKey FROM RawGameData';
	const tempFile = `/tmp/avalon-query-${Date.now()}.sql`;
	fs.writeFileSync(tempFile, sql);

	const locationFlag = local ? '--local' : '--remote';
	const output = execSync(
		`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --file="${tempFile}" --json`,
		{
			encoding: 'utf-8',
		},
	);

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

function executeSQLBatch(statements: string[], dryRun: boolean, local: boolean): void {
	const sql = statements.join('\n');

	if (dryRun) {
		console.log('Would execute SQL:');
		console.log(sql.substring(0, 500) + (sql.length > 500 ? '...' : ''));
		return;
	}

	// Write SQL to a temp file to avoid command line length limits
	const tempFile = `/tmp/avalon-import-${Date.now()}.sql`;
	fs.writeFileSync(tempFile, sql);

	const locationFlag = local ? '--local' : '--remote';
	try {
		execSync(`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --file="${tempFile}"`, {
			stdio: 'inherit',
		});
	} catch (error) {
		fs.unlinkSync(tempFile);
		// Check if killed by SIGINT
		if (error && typeof error === 'object' && 'signal' in error && error.signal === 'SIGINT') {
			console.log('\nInterrupted by user, exiting...');
			process.exit(1);
		}
		throw error;
	}
	fs.unlinkSync(tempFile);
}

async function main() {
	const args = parseArgs();
	const target = args.local ? 'local' : 'remote';
	console.log(`Import games from ${LOGS_DIR} to D1 (${target})`);
	console.log(
		`Options: dryRun=${args.dryRun}, limit=${args.limit ?? 'none'}, batchSize=${args.batchSize}, local=${args.local}`,
	);

	const existingIds = getExistingGameIds(args.local);
	const allFiles = getGameFiles(args.limit);
	const files = allFiles.filter((filename) => !existingIds.has(filename));

	console.log(`Found ${allFiles.length} game files, ${files.length} new to import`);

	if (files.length === 0) {
		console.log('No new games to import');
		return;
	}

	let successCount = 0;
	let errorCount = 0;
	const statements: string[] = [];

	for (let index = 0; index < files.length; index++) {
		if (interrupted) break;

		const filename = files[index];
		const filePath = path.join(LOGS_DIR, filename);

		try {
			const content = fs.readFileSync(filePath, 'utf-8');
			const gameJson = JSON.parse(content);

			const timestampMatch = filename.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
			const createdAt = timestampMatch ? new Date(timestampMatch[1]) : new Date();

			const firebaseKey = filename;
			gameJson.id = firebaseKey;

			statements.push(...buildInsertSQL(firebaseKey, gameJson, createdAt));
			successCount++;
		} catch (error) {
			console.error(`Error reading/parsing ${filename}:`, error);
			errorCount++;
		}

		if (statements.length >= args.batchSize) {
			console.log(`Executing batch ${Math.floor(index / args.batchSize) + 1} (${successCount} games so far)...`);
			executeSQLBatch(statements, args.dryRun, args.local);
			statements.length = 0;
		}
	}

	if (statements.length > 0) {
		console.log(`Executing final batch (${statements.length} games)...`);
		executeSQLBatch(statements, args.dryRun, args.local);
	}

	console.log(`\nImport complete:`);
	console.log(`  Success: ${successCount}`);
	console.log(`  Errors: ${errorCount}`);
}

main().catch(console.error);
