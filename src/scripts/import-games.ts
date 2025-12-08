#!/usr/bin/env npx tsx
/**
 * Import game files from local disk into D1 database.
 *
 * Usage:
 *   npx tsx src/scripts/import-games.ts [--dry-run] [--limit N] [--batch-size N]
 *
 * This script reads game JSON files from /Users/craig/projects/avalonlogs/logs
 * and inserts them into the RawGameData table via wrangler d1 execute.
 */

import {execSync} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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
}

function parseArgs(): Args {
	const args = process.argv.slice(2);
	const result: Args = {dryRun: false, limit: null, batchSize: DEFAULT_BATCH_SIZE};

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--dry-run') {
			result.dryRun = true;
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
	// Escape single quotes by doubling them
	return str.replace(/'/g, "''");
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

function buildInsertSQL(firebaseKey: string, gameJson: object, createdAt: Date): string {
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

	// Write SQL to a temp file to avoid command line length limits
	const tempFile = `/tmp/avalon-import-${Date.now()}.sql`;
	fs.writeFileSync(tempFile, sql);

	try {
		execSync(`npx wrangler d1 execute ${DATABASE_NAME} --remote --yes --file="${tempFile}"`, {
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
	console.log(`Import games from ${LOGS_DIR}`);
	console.log(`Options: dryRun=${args.dryRun}, limit=${args.limit ?? 'none'}, batchSize=${args.batchSize}`);

	const files = getGameFiles(args.limit);
	console.log(`Found ${files.length} game files to import`);

	let successCount = 0;
	let errorCount = 0;
	const statements: string[] = [];

	for (let i = 0; i < files.length; i++) {
		if (interrupted) break;

		const filename = files[i];
		const filePath = path.join(LOGS_DIR, filename);

		try {
			const content = fs.readFileSync(filePath, 'utf-8');
			const gameJson = JSON.parse(content);

			// Extract timestamp from filename for createdAt
			// Format: 2019-03-13T22:31:15.519Z_WJE
			const timestampMatch = filename.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
			const createdAt = timestampMatch ? new Date(timestampMatch[1]) : new Date();

			// Use filename as the firebaseKey
			const firebaseKey = filename;
			gameJson.id = firebaseKey;

			statements.push(buildInsertSQL(firebaseKey, gameJson, createdAt));
			successCount++;
		} catch (error) {
			console.error(`Error reading/parsing ${filename}:`, error);
			errorCount++;
		}

		// Execute batch when we reach batchSize
		if (statements.length >= args.batchSize) {
			console.log(`Executing batch ${Math.floor(i / args.batchSize) + 1} (${successCount} games so far)...`);
			executeSQLBatch(statements, args.dryRun);
			statements.length = 0;
		}
	}

	// Execute remaining statements
	if (statements.length > 0) {
		console.log(`Executing final batch (${statements.length} games)...`);
		executeSQLBatch(statements, args.dryRun);
	}

	console.log(`\nImport complete:`);
	console.log(`  Success: ${successCount}`);
	console.log(`  Errors: ${errorCount}`);
}

main().catch(console.error);
