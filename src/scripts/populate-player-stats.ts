#!/usr/bin/env npx tsx
/**
 * Populate PlayerStats table from existing game data.
 *
 * Usage:
 *   npx tsx src/scripts/populate-player-stats.ts [--local] [--dry-run]
 *
 * Options:
 *   --local       Use local D1 database instead of remote (default: remote)
 *   --dry-run     Show what would be done without executing
 *
 * This script calculates aggregate player statistics from all games
 * and stores them in the PlayerStats table for efficient retrieval.
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

interface PlayerStats {
	playerId: string;
	name: string;
	isMapped: boolean;
	gamesPlayed: number;
	wins: number;
	goodGames: number;
	goodWins: number;
	evilGames: number;
	evilWins: number;
}

interface GamePlayer {
	name: string;
	uid: string;
}

interface GameOutcome {
	state: 'GOOD_WIN' | 'EVIL_WIN';
	roles?: Array<{name: string; role: string}>;
}

interface GameData {
	id: string;
	players: GamePlayer[];
	outcome?: GameOutcome;
}

const EVIL_ROLES = ['morgana', 'assassin', 'oberon', 'mordred', 'evil', 'evil minion', 'minion of mordred'];

function isEvilRole(role: string | undefined): boolean {
	if (!role) return false;
	return EVIL_ROLES.includes(role.toLowerCase());
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

function executeQuery<T>(sql: string, local: boolean): T[] {
	const locationFlag = local ? '--local' : '--remote';

	// Use --command for queries to get proper results (--file has different behavior for remote)
	const escapedSql = sql.replace(/"/g, '\\"');
	const output = execSync(
		`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --command "${escapedSql}" --json`,
		{
			encoding: 'utf-8',
			maxBuffer: 100 * 1024 * 1024,
		},
	);

	// Extract JSON from output (wrangler may include non-JSON header lines)
	const jsonMatch = output.match(/\[[\s\S]*\]/);
	if (!jsonMatch) {
		throw new Error(`No JSON found in wrangler output: ${output.substring(0, 200)}`);
	}

	const ResultSchema = z.array(
		z.object({
			results: z.array(z.unknown()),
		}),
	);

	const parsed = ResultSchema.parse(JSON.parse(jsonMatch[0]));
	return parsed.flatMap((r) => r.results) as T[];
}

function executeSQLBatch(statements: string[], dryRun: boolean, local: boolean): void {
	const sql = statements.join('\n');

	if (dryRun) {
		console.log('Would execute SQL:');
		console.log(sql.substring(0, 1000) + (sql.length > 1000 ? '...' : ''));
		return;
	}

	const tempFile = `/tmp/avalon-stats-${Date.now()}.sql`;
	fs.writeFileSync(tempFile, sql);

	const locationFlag = local ? '--local' : '--remote';
	execSync(`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --file="${tempFile}"`, {
		stdio: 'inherit',
	});
	fs.unlinkSync(tempFile);
}

async function getPersonMappings(
	local: boolean,
): Promise<{uidToPersonId: Map<string, string>; uidToPersonName: Map<string, string>; personIds: Set<string>}> {
	console.log('Fetching person mappings...');

	const PersonUidSchema = z.object({
		uid: z.string(),
		personId: z.string(),
	});
	const PersonSchema = z.object({
		id: z.string(),
		name: z.string(),
	});

	const personUids = executeQuery<z.infer<typeof PersonUidSchema>>('SELECT uid, personId FROM PersonUid', local);
	const persons = executeQuery<z.infer<typeof PersonSchema>>('SELECT id, name FROM Person', local);

	const personIdToName = new Map<string, string>();
	for (const person of persons) {
		personIdToName.set(person.id, person.name);
	}

	const uidToPersonId = new Map<string, string>();
	const uidToPersonName = new Map<string, string>();
	const personIds = new Set<string>();

	for (const pu of personUids) {
		uidToPersonId.set(pu.uid, pu.personId);
		const personName = personIdToName.get(pu.personId);
		if (personName) {
			uidToPersonName.set(pu.uid, personName);
		}
		personIds.add(pu.personId);
	}

	console.log(`Found ${personIds.size} mapped people with ${uidToPersonId.size} UIDs`);
	return {uidToPersonId, uidToPersonName, personIds};
}

async function getAllGames(local: boolean): Promise<GameData[]> {
	console.log('Fetching all games in batches...');

	const RawGameSchema = z.object({
		firebaseKey: z.string(),
		gameJson: z.string(),
	});

	// First get total count
	const countResult = executeQuery<{count: number}>('SELECT COUNT(*) as count FROM RawGameData', local);
	const totalCount = countResult[0]?.count ?? 0;
	console.log(`Total games: ${totalCount}`);

	const games: GameData[] = [];
	const batchSize = 500;

	for (let offset = 0; offset < totalCount; offset += batchSize) {
		console.log(`Fetching games ${offset + 1}-${Math.min(offset + batchSize, totalCount)}...`);
		const sql = `SELECT firebaseKey, gameJson FROM RawGameData LIMIT ${batchSize} OFFSET ${offset}`;
		const rawGames = executeQuery<z.infer<typeof RawGameSchema>>(sql, local);

		for (const raw of rawGames) {
			try {
				const parsed = JSON.parse(raw.gameJson);
				if (parsed.players && Array.isArray(parsed.players)) {
					games.push({
						id: raw.firebaseKey,
						players: parsed.players,
						outcome: parsed.outcome,
					});
				}
			} catch {
				// Skip invalid games
			}
		}
	}

	console.log(`Parsed ${games.length} valid games`);
	return games;
}

function calculatePlayerStats(
	games: GameData[],
	uidToPersonId: Map<string, string>,
	uidToPersonName: Map<string, string>,
): PlayerStats[] {
	const statsMap = new Map<string, PlayerStats>();

	for (const game of games) {
		if (!game.outcome) continue;

		const outcome = game.outcome;
		const isGoodWin = outcome.state === 'GOOD_WIN';

		for (const player of game.players) {
			const roleData = outcome.roles?.find((r) => r.name === player.name);
			const role = roleData?.role;
			const playerIsEvil = isEvilRole(role);
			const playerWon = (playerIsEvil && !isGoodWin) || (!playerIsEvil && isGoodWin);

			// Use person ID if mapped, otherwise use UID
			const personId = uidToPersonId.get(player.uid);
			const statsKey = personId ?? player.uid;
			const isMapped = personId !== undefined;

			let stats = statsMap.get(statsKey);
			if (!stats) {
				const displayName = uidToPersonName.get(player.uid) ?? player.name;
				stats = {
					playerId: statsKey,
					name: displayName,
					isMapped,
					gamesPlayed: 0,
					wins: 0,
					goodGames: 0,
					goodWins: 0,
					evilGames: 0,
					evilWins: 0,
				};
				statsMap.set(statsKey, stats);
			}

			stats.gamesPlayed++;

			if (playerWon) {
				stats.wins++;
			}

			if (playerIsEvil) {
				stats.evilGames++;
				if (playerWon) {
					stats.evilWins++;
				}
			} else {
				stats.goodGames++;
				if (playerWon) {
					stats.goodWins++;
				}
			}
		}
	}

	return Array.from(statsMap.values()).sort((a, b) => b.gamesPlayed - a.gamesPlayed);
}

function buildInsertStatements(stats: PlayerStats[]): string[] {
	const now = new Date().toISOString();
	const statements: string[] = [];

	// Clear existing stats
	statements.push('DELETE FROM PlayerStats;');

	for (const s of stats) {
		const id = crypto.randomUUID();
		statements.push(
			`INSERT INTO PlayerStats (id, playerId, name, isMapped, gamesPlayed, wins, goodGames, goodWins, evilGames, evilWins, createdAt, updatedAt) VALUES ('${id}', '${escapeSQL(s.playerId)}', '${escapeSQL(s.name)}', ${s.isMapped ? 1 : 0}, ${s.gamesPlayed}, ${s.wins}, ${s.goodGames}, ${s.goodWins}, ${s.evilGames}, ${s.evilWins}, '${now}', '${now}');`,
		);
	}

	return statements;
}

async function main() {
	const args = parseArgs();
	const target = args.local ? 'local' : 'remote';
	console.log(`Populate PlayerStats from games (${target})`);
	console.log(`Options: dryRun=${args.dryRun}, local=${args.local}`);

	const {uidToPersonId, uidToPersonName} = await getPersonMappings(args.local);
	const games = await getAllGames(args.local);
	const stats = calculatePlayerStats(games, uidToPersonId, uidToPersonName);

	console.log(`Calculated stats for ${stats.length} players`);

	const statements = buildInsertStatements(stats);
	console.log(`Generated ${statements.length} SQL statements`);

	// Execute in batches
	for (let i = 0; i < statements.length; i += BATCH_SIZE) {
		const batch = statements.slice(i, i + BATCH_SIZE);
		console.log(
			`Executing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(statements.length / BATCH_SIZE)} (${batch.length} statements)...`,
		);
		executeSQLBatch(batch, args.dryRun, args.local);
	}

	console.log(`\nPopulation complete: ${stats.length} player stats inserted`);
}

main().catch(console.error);
