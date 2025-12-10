#!/usr/bin/env npx tsx
/**
 * Populate PlayerGame table from existing RawGameData.
 *
 * Usage:
 *   npx tsx src/scripts/populate-player-games.ts [--local] [--dry-run]
 *
 * Options:
 *   --local       Use local D1 database instead of remote (default: remote)
 *   --dry-run     Show what would be done without executing
 *
 * This script reads all games from RawGameData, extracts player UIDs,
 * and creates PlayerGame entries for efficient player-to-game lookups.
 */

import {execSync} from 'child_process';
import * as fs from 'fs';
import {z} from 'zod';

const DATABASE_NAME = 'avalon-analytics-juicy-tyrannosaurus';

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

function extractJson(output: string): string {
	const jsonStart = output.indexOf('[');
	if (jsonStart === -1) {
		throw new Error('No JSON array found in output');
	}
	return output.slice(jsonStart);
}

async function getExistingPlayerGames(local: boolean): Promise<Set<string>> {
	const target = local ? 'local' : 'remote';
	console.log(`Fetching existing PlayerGame entries from D1 (${target})...`);

	const sql = 'SELECT playerUid, firebaseKey FROM PlayerGame';
	const locationFlag = local ? '--local' : '--remote';

	try {
		const output = execSync(
			`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --command="${sql}" --json`,
			{
				encoding: 'utf-8',
				maxBuffer: 500 * 1024 * 1024,
			},
		);

		const QueryResultSchema = z.array(
			z.object({
				results: z.array(z.object({playerUid: z.string(), firebaseKey: z.string()})),
			}),
		);

		const parsed = QueryResultSchema.parse(JSON.parse(extractJson(output)));
		const existingKeys = new Set<string>();
		for (const result of parsed) {
			for (const row of result.results) {
				existingKeys.add(`${row.playerUid}:${row.firebaseKey}`);
			}
		}

		console.log(`Found ${existingKeys.size} existing PlayerGame entries`);
		return existingKeys;
	} catch {
		console.log('PlayerGame table may not exist yet, returning empty set');
		return new Set<string>();
	}
}

async function getRawGameData(local: boolean): Promise<Array<{firebaseKey: string; gameJson: string}>> {
	const target = local ? 'local' : 'remote';
	console.log(`Fetching RawGameData from D1 (${target})...`);

	const sql = 'SELECT firebaseKey, gameJson FROM RawGameData';
	const locationFlag = local ? '--local' : '--remote';
	const output = execSync(
		`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --command="${sql}" --json`,
		{
			encoding: 'utf-8',
			maxBuffer: 500 * 1024 * 1024,
		},
	);

	const QueryResultSchema = z.array(
		z.object({
			results: z.array(z.object({firebaseKey: z.string(), gameJson: z.string()})),
		}),
	);

	const parsed = QueryResultSchema.parse(JSON.parse(extractJson(output)));
	const games: Array<{firebaseKey: string; gameJson: string}> = [];
	for (const result of parsed) {
		for (const row of result.results) {
			games.push(row);
		}
	}

	console.log(`Found ${games.length} games in RawGameData`);
	return games;
}

function extractPlayerUids(gameJson: string): string[] {
	const gameData = JSON.parse(gameJson);
	const players = gameData.players;
	if (!Array.isArray(players)) {
		return [];
	}
	return players
		.map((p: {uid?: string}) => p.uid)
		.filter((uid: string | undefined): uid is string => typeof uid === 'string');
}

function executeSQLBatch(statements: string[], dryRun: boolean, local: boolean): void {
	const sql = statements.join('\n');

	if (dryRun) {
		console.log('Would execute SQL:');
		console.log(sql.substring(0, 500) + (sql.length > 500 ? '...' : ''));
		return;
	}

	const tempFile = `/tmp/avalon-populate-pg-${Date.now()}.sql`;
	fs.writeFileSync(tempFile, sql);

	const locationFlag = local ? '--local' : '--remote';
	try {
		execSync(`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --file="${tempFile}"`, {
			stdio: 'inherit',
		});
	} finally {
		fs.unlinkSync(tempFile);
	}
}

async function main() {
	const args = parseArgs();
	const target = args.local ? 'local' : 'remote';
	console.log(`Populate PlayerGame table from RawGameData (${target})`);
	console.log(`Options: dryRun=${args.dryRun}, local=${args.local}`);

	const existingPlayerGames = await getExistingPlayerGames(args.local);
	const rawGames = await getRawGameData(args.local);

	const statements: string[] = [];
	let newCount = 0;
	let skipCount = 0;

	for (const game of rawGames) {
		const playerUids = extractPlayerUids(game.gameJson);
		const now = new Date().toISOString();

		for (const uid of playerUids) {
			const key = `${uid}:${game.firebaseKey}`;
			if (existingPlayerGames.has(key)) {
				skipCount++;
				continue;
			}

			const id = crypto.randomUUID();
			statements.push(
				`INSERT OR IGNORE INTO "PlayerGame" ("id", "playerUid", "firebaseKey", "createdAt") VALUES ('${escapeSQL(id)}', '${escapeSQL(uid)}', '${escapeSQL(game.firebaseKey)}', '${now}');`,
			);
			newCount++;
		}
	}

	console.log(`Found ${newCount} new PlayerGame entries to create (${skipCount} already exist)`);

	if (statements.length === 0) {
		console.log('No new PlayerGame entries to create');
		return;
	}

	const batchSize = 1000;
	for (let i = 0; i < statements.length; i += batchSize) {
		const batch = statements.slice(i, i + batchSize);
		console.log(`Executing batch ${Math.floor(i / batchSize) + 1} (${batch.length} statements)...`);
		executeSQLBatch(batch, args.dryRun, args.local);
	}

	console.log(`\nPopulation complete:`);
	console.log(`  New entries: ${newCount}`);
	console.log(`  Skipped (existing): ${skipCount}`);
}

main().catch(console.error);
