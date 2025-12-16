#!/usr/bin/env npx tsx
/**
 * Backfill PlayerGame table from existing RawGameData.
 *
 * Usage:
 *   npx tsx src/scripts/backfill-player-game.ts [--local] [--dry-run]
 *
 * Options:
 *   --local       Use local D1 database instead of remote (default: remote)
 *   --dry-run     Show what would be done without executing
 *
 * This script reads existing games from RawGameData and populates the PlayerGame
 * table with player-game associations.
 */

import {execSync} from 'child_process';
import * as fs from 'fs';
import {z} from 'zod';

const DATABASE_NAME = 'avalon-analytics-juicy-tyrannosaurus';
const BATCH_SIZE = 500;

interface Args {
	dryRun: boolean;
	local: boolean;
}

function parseArgs(): Args {
	const args = process.argv.slice(2);
	const result: Args = {dryRun: false, local: false};

	for (const arg of args) {
		if (arg === '--dry-run') {
			result.dryRun = true;
		} else if (arg === '--local') {
			result.local = true;
		}
	}

	return result;
}

function escapeSQL(str: string): string {
	return str.replace(/'/g, "''");
}

function extractPlayerUids(gameJson: string): string[] {
	try {
		const game = JSON.parse(gameJson) as {players?: Array<{uid?: string}>};
		if (!Array.isArray(game.players)) {
			return [];
		}
		return game.players.map((p) => p.uid).filter((uid): uid is string => typeof uid === 'string');
	} catch {
		return [];
	}
}

interface RawGame {
	firebaseKey: string;
	gameJson: string;
	createdAt: string;
}

const PAGE_SIZE = 500;

function getGamesBatch(local: boolean, offset: number): RawGame[] {
	const locationFlag = local ? '--local' : '--remote';
	const sql = `SELECT firebaseKey, gameJson, createdAt FROM RawGameData ORDER BY firebaseKey LIMIT ${PAGE_SIZE} OFFSET ${offset}`;

	const output = execSync(
		`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --json --command "${sql}"`,
		{
			encoding: 'utf-8',
			maxBuffer: 100 * 1024 * 1024,
			stdio: ['pipe', 'pipe', 'pipe'],
		},
	);

	// Extract JSON from output (wrangler adds console text before the JSON)
	const jsonStart = output.indexOf('[');
	if (jsonStart === -1) {
		throw new Error('No JSON array found in wrangler output');
	}
	const jsonOutput = output.slice(jsonStart);

	const QueryResultSchema = z.array(
		z.object({
			results: z.array(
				z.object({
					firebaseKey: z.string(),
					gameJson: z.string(),
					createdAt: z.string(),
				}),
			),
		}),
	);

	const parsed = QueryResultSchema.parse(JSON.parse(jsonOutput));
	const games: RawGame[] = [];
	for (const result of parsed) {
		games.push(...result.results);
	}

	return games;
}

function* getAllGames(local: boolean): Generator<RawGame[], void, unknown> {
	const target = local ? 'local' : 'remote';
	console.log(`Fetching games from RawGameData (${target}) in batches of ${PAGE_SIZE}...`);

	let offset = 0;
	let totalFetched = 0;

	while (true) {
		const games = getGamesBatch(local, offset);
		if (games.length === 0) {
			break;
		}

		totalFetched += games.length;
		console.log(`  Fetched ${totalFetched} games so far...`);

		yield games;

		if (games.length < PAGE_SIZE) {
			break;
		}
		offset += PAGE_SIZE;
	}

	console.log(`Total: ${totalFetched} games fetched`);
}

function executeSQLBatch(statements: string[], dryRun: boolean, local: boolean): void {
	const sql = statements.join('\n');

	if (dryRun) {
		console.log(`Would execute ${statements.length} SQL statements`);
		return;
	}

	const tempFile = `/tmp/avalon-backfill-${Date.now()}.sql`;
	fs.writeFileSync(tempFile, sql);

	const locationFlag = local ? '--local' : '--remote';

	execSync(`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --file="${tempFile}"`, {
		encoding: 'utf-8',
		stdio: ['pipe', 'pipe', 'pipe'],
	});

	fs.unlinkSync(tempFile);
}

async function main(): Promise<void> {
	const args = parseArgs();
	const target = args.local ? 'local' : 'remote';

	console.log(`\n🔄 Backfilling PlayerGame table (${target})...`);

	let totalStatements = 0;
	let batchStatements: string[] = [];
	let batchNumber = 0;

	for (const gameBatch of getAllGames(args.local)) {
		for (const game of gameBatch) {
			const playerUids = extractPlayerUids(game.gameJson);

			for (const uid of playerUids) {
				const id = crypto.randomUUID();
				batchStatements.push(
					`INSERT OR IGNORE INTO "PlayerGame" ("id", "playerUid", "firebaseKey", "createdAt") VALUES ('${escapeSQL(id)}', '${escapeSQL(uid)}', '${escapeSQL(game.firebaseKey)}', '${game.createdAt}');`,
				);
				totalStatements++;

				if (batchStatements.length >= BATCH_SIZE) {
					batchNumber++;
					console.log(`Executing insert batch ${batchNumber} (${batchStatements.length} statements)...`);
					executeSQLBatch(batchStatements, args.dryRun, args.local);
					batchStatements = [];
				}
			}
		}
	}

	if (batchStatements.length > 0) {
		batchNumber++;
		console.log(`Executing insert batch ${batchNumber} (${batchStatements.length} statements)...`);
		executeSQLBatch(batchStatements, args.dryRun, args.local);
	}

	console.log(`\n✅ Backfill complete: ${totalStatements} PlayerGame records${args.dryRun ? ' (dry run)' : ''}`);
}

main().catch((error) => {
	console.error('Error:', error);
	process.exit(1);
});
