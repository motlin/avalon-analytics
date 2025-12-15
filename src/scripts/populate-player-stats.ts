#!/usr/bin/env npx tsx
/**
 * Populate statistics tables from existing game data.
 *
 * Usage:
 *   npx tsx src/scripts/populate-player-stats.ts [--local] [--dry-run] [--full] [--resume=N]
 *
 * Options:
 *   --local       Use local D1 database instead of remote (default: remote)
 *   --dry-run     Show what would be done without executing
 *   --full        Force full recomputation instead of incremental update
 *   --resume=N    Resume from batch N, skipping DELETE statements (useful after network failures)
 *
 * By default, this script performs incremental updates - only processing new games
 * since the last run. Use --full to recompute all statistics from scratch.
 *
 * Remote execution reliability:
 *   - Uses retry logic with exponential backoff for failed batches
 *   - Use --resume=N to continue from a specific batch after network failures
 */

import {execSync} from 'child_process';
import * as fs from 'fs';
import {z} from 'zod';

const DATABASE_NAME = 'avalon-analytics-juicy-tyrannosaurus';
const BATCH_SIZE = 1000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

interface Args {
	dryRun: boolean;
	local: boolean;
	full: boolean;
	resumeFromBatch: number | null;
}

// Role normalization
const ROLE_ALIASES: Record<string, string> = {
	MERLIN: 'MERLIN',
	PERCIVAL: 'PERCIVAL',
	'LOYAL FOLLOWER': 'LOYAL FOLLOWER',
	'LOYAL SERVANT': 'LOYAL FOLLOWER',
	MORDRED: 'MORDRED',
	MORGANA: 'MORGANA',
	OBERON: 'OBERON',
	'EVIL MINION': 'EVIL MINION',
	'MINION OF MORDRED': 'EVIL MINION',
	ASSASSIN: 'ASSASSIN',
};

const EVIL_ROLES = ['MORDRED', 'MORGANA', 'OBERON', 'EVIL MINION', 'ASSASSIN'];
const ALL_ROLES = ['MERLIN', 'PERCIVAL', 'LOYAL FOLLOWER', 'MORDRED', 'MORGANA', 'OBERON', 'EVIL MINION', 'ASSASSIN'];

type OutcomeReason =
	| 'Three successful missions'
	| 'Three failed missions'
	| 'Five rejected proposals'
	| 'Merlin assassinated'
	| 'Failed to assassinate Merlin';

interface RoleStats {
	games: number;
	wins: number;
	losses: number;
	threeMissionFails: number;
	threeMissionSuccesses: number;
	fiveRejectedProposals: number;
	merlinAssassinated: number;
	wasAssassinated: number;
}

interface YearlyStats {
	games: number;
	wins: number;
	goodGames: number;
	goodWins: number;
	evilGames: number;
	evilWins: number;
}

interface LossReasons {
	threeMissionFails: number;
	threeMissionSuccessEvil: number;
	fiveRejectedProposals: number;
	merlinAssassinated: number;
}

interface MerlinStats {
	gamesPlayed: number;
	wins: number;
	timesAssassinated: number;
	survivedAssassination: number;
}

interface AssassinStats {
	gamesPlayed: number;
	wins: number;
	successfulAssassinations: number;
	failedAssassinations: number;
}

interface FullStats {
	name: string;
	isMapped: boolean;
	gamesPlayed: number;
	wins: number;
	goodGames: number;
	goodWins: number;
	evilGames: number;
	evilWins: number;
	roleStats: Map<string, RoleStats>;
	yearlyStats: Map<number, YearlyStats>;
	lossReasons: LossReasons;
	merlinStats: MerlinStats;
	assassinStats: AssassinStats;
	evilTeammateStats: AssassinStats;
}

interface GamePlayer {
	name: string;
	uid: string;
}

interface GameOutcome {
	state: 'GOOD_WIN' | 'EVIL_WIN';
	roles?: Array<{name: string; role: string; assassin?: boolean}>;
	reason?: string;
	message?: string;
	assassinated?: string;
}

interface GameData {
	id: string;
	players: GamePlayer[];
	outcome?: GameOutcome;
	timeCreated: Date;
}

function normalizeRole(role: string | undefined): string | null {
	if (!role) return null;
	const upperRole = role.toUpperCase();
	return ROLE_ALIASES[upperRole] ?? null;
}

function isEvilRole(role: string | null): boolean {
	return role !== null && EVIL_ROLES.includes(role);
}

function getOutcomeReason(outcome: GameOutcome): OutcomeReason | null {
	const reason = outcome.reason ?? outcome.message;
	if (!reason) return null;

	const reasonMap: Record<string, OutcomeReason> = {
		'Three successful missions': 'Three successful missions',
		'Three failed missions': 'Three failed missions',
		'Five rejected proposals': 'Five rejected proposals',
		'Merlin assassinated': 'Merlin assassinated',
		'Failed to assassinate Merlin': 'Failed to assassinate Merlin',
	};

	return reasonMap[reason] ?? null;
}

/**
 * Normalize game data to handle schema evolution.
 *
 * Old schema: role="ASSASSIN" without assassin boolean
 * New schema: role="EVIL MINION" with assassin=true
 *
 * This function normalizes assassins to role="ASSASSIN" so all
 * downstream code can simply check the role.
 */
function normalizeGameData(game: GameData): GameData {
	if (!game.outcome?.roles) {
		return game;
	}

	const normalizedRoles = game.outcome.roles.map((roleData) => {
		const {assassin, ...rest} = roleData;
		if (assassin === true || normalizeRole(roleData.role) === 'ASSASSIN') {
			return {...rest, role: 'ASSASSIN'};
		}
		return rest;
	});

	return {
		...game,
		outcome: {
			...game.outcome,
			roles: normalizedRoles,
		},
	};
}

function createEmptyStats(name: string, isMapped: boolean): FullStats {
	return {
		name,
		isMapped,
		gamesPlayed: 0,
		wins: 0,
		goodGames: 0,
		goodWins: 0,
		evilGames: 0,
		evilWins: 0,
		roleStats: new Map(),
		yearlyStats: new Map(),
		lossReasons: {
			threeMissionFails: 0,
			threeMissionSuccessEvil: 0,
			fiveRejectedProposals: 0,
			merlinAssassinated: 0,
		},
		merlinStats: {
			gamesPlayed: 0,
			wins: 0,
			timesAssassinated: 0,
			survivedAssassination: 0,
		},
		assassinStats: {
			gamesPlayed: 0,
			wins: 0,
			successfulAssassinations: 0,
			failedAssassinations: 0,
		},
		evilTeammateStats: {
			gamesPlayed: 0,
			wins: 0,
			successfulAssassinations: 0,
			failedAssassinations: 0,
		},
	};
}

function createEmptyRoleStats(): RoleStats {
	return {
		games: 0,
		wins: 0,
		losses: 0,
		threeMissionFails: 0,
		threeMissionSuccesses: 0,
		fiveRejectedProposals: 0,
		merlinAssassinated: 0,
		wasAssassinated: 0,
	};
}

function createEmptyYearlyStats(): YearlyStats {
	return {
		games: 0,
		wins: 0,
		goodGames: 0,
		goodWins: 0,
		evilGames: 0,
		evilWins: 0,
	};
}

function parseArgs(): Args {
	const args = process.argv.slice(2);
	const result: Args = {dryRun: false, local: false, full: false, resumeFromBatch: null};

	for (const arg of args) {
		if (arg === '--dry-run') {
			result.dryRun = true;
		} else if (arg === '--local') {
			result.local = true;
		} else if (arg === '--full') {
			result.full = true;
		} else if (arg.startsWith('--resume=')) {
			const batchNumber = parseInt(arg.substring('--resume='.length), 10);
			if (isNaN(batchNumber) || batchNumber < 1) {
				throw new Error(`Invalid --resume value: ${arg}. Must be a positive integer.`);
			}
			result.resumeFromBatch = batchNumber;
		}
	}

	return result;
}

function sleep(milliseconds: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function escapeSQL(str: string): string {
	return str.replace(/'/g, "''");
}

function executeQuery<T>(sql: string, local: boolean): T[] {
	const locationFlag = local ? '--local' : '--remote';

	const escapedSql = sql.replace(/"/g, '\\"');
	const output = execSync(
		`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --command "${escapedSql}" --json`,
		{
			encoding: 'utf-8',
			maxBuffer: 100 * 1024 * 1024,
		},
	);

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

async function executeSQLBatchWithRetry(
	statements: string[],
	dryRun: boolean,
	local: boolean,
	batchNumber: number,
): Promise<void> {
	const sql = statements.join('\n');

	if (dryRun) {
		console.log('Would execute SQL:');
		console.log(sql.substring(0, 1000) + (sql.length > 1000 ? '...' : ''));
		return;
	}

	const tempFile = `.llm/avalon-stats-${Date.now()}.sql`;
	fs.writeFileSync(tempFile, sql);

	const locationFlag = local ? '--local' : '--remote';
	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			execSync(`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --file="${tempFile}"`, {
				stdio: 'inherit',
			});
			fs.unlinkSync(tempFile);
			return;
		} catch (error) {
			lastError = error as Error;
			if (attempt < MAX_RETRIES) {
				const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
				console.log(
					`⚠️  Batch ${batchNumber} failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delayMs}ms...`,
				);
				await sleep(delayMs);
			}
		}
	}

	// Clean up temp file before throwing
	try {
		fs.unlinkSync(tempFile);
	} catch {
		// Ignore cleanup errors
	}

	throw new Error(
		`Batch ${batchNumber} failed after ${MAX_RETRIES} attempts. Use --resume=${batchNumber} to retry from this batch. Error: ${lastError?.message}`,
	);
}

async function getPersonMappings(local: boolean): Promise<{
	uidToPersonId: Map<string, string>;
	personIdToName: Map<string, string>;
	personIdToUids: Map<string, string[]>;
}> {
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
	const personIdToUids = new Map<string, string[]>();

	for (const pu of personUids) {
		uidToPersonId.set(pu.uid, pu.personId);

		const uids = personIdToUids.get(pu.personId) ?? [];
		uids.push(pu.uid);
		personIdToUids.set(pu.personId, uids);
	}

	console.log(`Found ${personIdToName.size} people with ${uidToPersonId.size} UIDs`);
	return {uidToPersonId, personIdToName, personIdToUids};
}

async function getAllGames(local: boolean): Promise<GameData[]> {
	console.log('Fetching all games in batches...');

	const RawGameSchema = z.object({
		firebaseKey: z.string(),
		gameJson: z.string(),
		createdAt: z.string(),
	});

	const countResult = executeQuery<{count: number}>('SELECT COUNT(*) as count FROM RawGameData', local);
	const totalCount = countResult[0]?.count ?? 0;
	console.log(`Total games: ${totalCount}`);

	const games: GameData[] = [];
	const batchSize = 500;

	for (let offset = 0; offset < totalCount; offset += batchSize) {
		console.log(`Fetching games ${offset + 1}-${Math.min(offset + batchSize, totalCount)}...`);
		const sql = `SELECT firebaseKey, gameJson, createdAt FROM RawGameData LIMIT ${batchSize} OFFSET ${offset}`;
		const rawGames = executeQuery<z.infer<typeof RawGameSchema>>(sql, local);

		for (const raw of rawGames) {
			try {
				const parsed = JSON.parse(raw.gameJson);
				if (parsed.players && Array.isArray(parsed.players)) {
					const game: GameData = {
						id: raw.firebaseKey,
						players: parsed.players,
						outcome: parsed.outcome,
						timeCreated: new Date(raw.createdAt),
					};
					games.push(normalizeGameData(game));
				}
			} catch {
				// Skip invalid games
			}
		}
	}

	console.log(`Parsed ${games.length} valid games`);
	return games;
}

async function getLastStatsProcessedTime(local: boolean): Promise<Date> {
	console.log('Fetching last stats processed time...');

	const StateSchema = z.object({
		lastStatsProcessedTime: z.string().nullable(),
	});

	const result = executeQuery<z.infer<typeof StateSchema>>(
		'SELECT lastStatsProcessedTime FROM GameIngestionState WHERE id = 1',
		local,
	);

	if (result.length === 0 || !result[0]?.lastStatsProcessedTime) {
		console.log('No previous stats processing time found, using Unix epoch');
		return new Date('1970-01-01T00:00:00Z');
	}

	const lastTime = new Date(result[0].lastStatsProcessedTime);
	console.log(`Last stats processed: ${lastTime.toISOString()}`);
	return lastTime;
}

async function getGamesSince(local: boolean, since: Date): Promise<GameData[]> {
	console.log(`Fetching games since ${since.toISOString()}...`);

	const RawGameSchema = z.object({
		firebaseKey: z.string(),
		gameJson: z.string(),
		createdAt: z.string(),
	});

	const sinceISO = since.toISOString();
	const countResult = executeQuery<{count: number}>(
		`SELECT COUNT(*) as count FROM RawGameData WHERE createdAt > '${sinceISO}'`,
		local,
	);
	const totalCount = countResult[0]?.count ?? 0;
	console.log(`New games since last run: ${totalCount}`);

	if (totalCount === 0) {
		return [];
	}

	const games: GameData[] = [];
	const batchSize = 500;

	for (let offset = 0; offset < totalCount; offset += batchSize) {
		console.log(`Fetching games ${offset + 1}-${Math.min(offset + batchSize, totalCount)}...`);
		const sql = `SELECT firebaseKey, gameJson, createdAt FROM RawGameData WHERE createdAt > '${sinceISO}' ORDER BY createdAt ASC LIMIT ${batchSize} OFFSET ${offset}`;
		const rawGames = executeQuery<z.infer<typeof RawGameSchema>>(sql, local);

		for (const raw of rawGames) {
			try {
				const parsed = JSON.parse(raw.gameJson);
				if (parsed.players && Array.isArray(parsed.players)) {
					const game: GameData = {
						id: raw.firebaseKey,
						players: parsed.players,
						outcome: parsed.outcome,
						timeCreated: new Date(raw.createdAt),
					};
					games.push(normalizeGameData(game));
				}
			} catch {
				// Skip invalid games
			}
		}
	}

	console.log(`Parsed ${games.length} new valid games`);
	return games;
}

function getAffectedUidsAndPersonIds(
	games: GameData[],
	uidToPersonId: Map<string, string>,
): {affectedUids: Set<string>; affectedPersonIds: Set<string>} {
	const affectedUids = new Set<string>();
	const affectedPersonIds = new Set<string>();

	for (const game of games) {
		for (const player of game.players) {
			affectedUids.add(player.uid);
			const personId = uidToPersonId.get(player.uid);
			if (personId) {
				affectedPersonIds.add(personId);
			}
		}
	}

	return {affectedUids, affectedPersonIds};
}

function processGameForStats(game: GameData, playerUid: string, stats: FullStats): void {
	if (!game.outcome) return;

	const player = game.players.find((p) => p.uid === playerUid);
	if (!player) return;

	const roleData = game.outcome.roles?.find((r) => r.name === player.name);
	const normalizedRole = normalizeRole(roleData?.role);
	const isEvil = isEvilRole(normalizedRole);
	const playerWon = (isEvil && game.outcome.state === 'EVIL_WIN') || (!isEvil && game.outcome.state === 'GOOD_WIN');
	const outcomeReason = getOutcomeReason(game.outcome);
	const wasAssassinated = game.outcome.assassinated === player.name;
	const year = game.timeCreated.getFullYear();

	// Overall stats
	stats.gamesPlayed++;
	if (playerWon) {
		stats.wins++;
	}

	// Alignment stats
	if (isEvil) {
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

	if (normalizedRole) {
		const roleForStats = normalizedRole;
		let roleStats = stats.roleStats.get(roleForStats);
		if (!roleStats) {
			roleStats = createEmptyRoleStats();
			stats.roleStats.set(roleForStats, roleStats);
		}

		roleStats.games++;
		if (playerWon) {
			roleStats.wins++;
		} else {
			roleStats.losses++;
		}

		if (outcomeReason === 'Three failed missions') {
			roleStats.threeMissionFails++;
		} else if (outcomeReason === 'Three successful missions' || outcomeReason === 'Failed to assassinate Merlin') {
			roleStats.threeMissionSuccesses++;
		} else if (outcomeReason === 'Five rejected proposals') {
			roleStats.fiveRejectedProposals++;
		} else if (outcomeReason === 'Merlin assassinated') {
			roleStats.merlinAssassinated++;
		}

		if (wasAssassinated) {
			roleStats.wasAssassinated++;
		}
	}

	// Yearly stats
	let yearlyStats = stats.yearlyStats.get(year);
	if (!yearlyStats) {
		yearlyStats = createEmptyYearlyStats();
		stats.yearlyStats.set(year, yearlyStats);
	}

	yearlyStats.games++;
	if (playerWon) yearlyStats.wins++;
	if (isEvil) {
		yearlyStats.evilGames++;
		if (playerWon) yearlyStats.evilWins++;
	} else {
		yearlyStats.goodGames++;
		if (playerWon) yearlyStats.goodWins++;
	}

	// Loss reasons (only when player lost)
	if (!playerWon) {
		if (outcomeReason === 'Three failed missions') {
			stats.lossReasons.threeMissionFails++;
		} else if (outcomeReason === 'Three successful missions' || outcomeReason === 'Failed to assassinate Merlin') {
			stats.lossReasons.threeMissionSuccessEvil++;
		} else if (outcomeReason === 'Five rejected proposals') {
			stats.lossReasons.fiveRejectedProposals++;
		} else if (outcomeReason === 'Merlin assassinated') {
			stats.lossReasons.merlinAssassinated++;
		}
	}

	// Merlin stats
	if (normalizedRole === 'MERLIN') {
		stats.merlinStats.gamesPlayed++;
		if (playerWon) {
			stats.merlinStats.wins++;
			stats.merlinStats.survivedAssassination++;
		} else if (wasAssassinated) {
			stats.merlinStats.timesAssassinated++;
		}
	}

	if (normalizedRole === 'ASSASSIN') {
		stats.assassinStats.gamesPlayed++;
		if (playerWon) {
			stats.assassinStats.wins++;
		}
		if (outcomeReason === 'Merlin assassinated') {
			stats.assassinStats.successfulAssassinations++;
		} else if (
			game.outcome.state === 'GOOD_WIN' &&
			game.outcome.assassinated &&
			outcomeReason === 'Three successful missions'
		) {
			stats.assassinStats.failedAssassinations++;
		}
	} else if (isEvil) {
		stats.evilTeammateStats.gamesPlayed++;
		if (playerWon) {
			stats.evilTeammateStats.wins++;
		}
		if (outcomeReason === 'Merlin assassinated') {
			stats.evilTeammateStats.successfulAssassinations++;
		} else if (
			game.outcome.state === 'GOOD_WIN' &&
			game.outcome.assassinated &&
			outcomeReason === 'Three successful missions'
		) {
			stats.evilTeammateStats.failedAssassinations++;
		}
	}
}

function calculatePlayerStats(games: GameData[], uidToPersonId: Map<string, string>): Map<string, FullStats> {
	const statsMap = new Map<string, FullStats>();

	// Index games by UID for faster lookup
	const gamesByUid = new Map<string, GameData[]>();
	for (const game of games) {
		for (const player of game.players) {
			const uid = player.uid;
			const playerGames = gamesByUid.get(uid) ?? [];
			playerGames.push(game);
			gamesByUid.set(uid, playerGames);
		}
	}

	// Calculate stats for each UID
	for (const [uid, playerGames] of gamesByUid) {
		const isMapped = uidToPersonId.has(uid);
		const firstName = playerGames[0]?.players.find((p) => p.uid === uid)?.name ?? uid;
		const stats = createEmptyStats(firstName, isMapped);

		for (const game of playerGames) {
			processGameForStats(game, uid, stats);
		}

		statsMap.set(uid, stats);
	}

	return statsMap;
}

function calculatePersonStats(
	games: GameData[],
	personIdToUids: Map<string, string[]>,
	personIdToName: Map<string, string>,
): Map<string, FullStats> {
	const statsMap = new Map<string, FullStats>();

	// Index games by UID for faster lookup
	const gamesByUid = new Map<string, GameData[]>();
	for (const game of games) {
		for (const player of game.players) {
			const uid = player.uid;
			const playerGames = gamesByUid.get(uid) ?? [];
			playerGames.push(game);
			gamesByUid.set(uid, playerGames);
		}
	}

	// Calculate stats for each person (aggregating all their UIDs)
	for (const [personId, uids] of personIdToUids) {
		const name = personIdToName.get(personId) ?? personId;
		const stats = createEmptyStats(name, true);

		// Collect all unique games for this person
		const seenGames = new Set<string>();

		for (const uid of uids) {
			const playerGames = gamesByUid.get(uid) ?? [];
			for (const game of playerGames) {
				if (seenGames.has(game.id)) continue;
				seenGames.add(game.id);
				processGameForStats(game, uid, stats);
			}
		}

		statsMap.set(personId, stats);
	}

	return statsMap;
}

function buildPlayerInsertStatements(statsMap: Map<string, FullStats>, now: string): string[] {
	const statements: string[] = [];

	// Clear existing data
	statements.push('DELETE FROM PlayerEvilTeammateStats;');
	statements.push('DELETE FROM PlayerAssassinStats;');
	statements.push('DELETE FROM PlayerMerlinStats;');
	statements.push('DELETE FROM PlayerLossReasons;');
	statements.push('DELETE FROM PlayerYearlyStats;');
	statements.push('DELETE FROM PlayerRoleStats;');
	statements.push('DELETE FROM PlayerStats;');

	for (const [uid, stats] of statsMap) {
		// Base stats
		statements.push(
			`INSERT INTO PlayerStats (uid, name, isMapped, gamesPlayed, wins, goodGames, goodWins, evilGames, evilWins, createdAt, updatedAt) VALUES ('${escapeSQL(uid)}', '${escapeSQL(stats.name)}', ${stats.isMapped ? 1 : 0}, ${stats.gamesPlayed}, ${stats.wins}, ${stats.goodGames}, ${stats.goodWins}, ${stats.evilGames}, ${stats.evilWins}, '${now}', '${now}');`,
		);

		// Role stats (for all roles, including ones with 0 games)
		for (const role of ALL_ROLES) {
			const roleStats = stats.roleStats.get(role) ?? createEmptyRoleStats();
			statements.push(
				`INSERT INTO PlayerRoleStats (uid, role, games, wins, losses, threeMissionFails, threeMissionSuccesses, fiveRejectedProposals, merlinAssassinated, wasAssassinated) VALUES ('${escapeSQL(uid)}', '${role}', ${roleStats.games}, ${roleStats.wins}, ${roleStats.losses}, ${roleStats.threeMissionFails}, ${roleStats.threeMissionSuccesses}, ${roleStats.fiveRejectedProposals}, ${roleStats.merlinAssassinated}, ${roleStats.wasAssassinated});`,
			);
		}

		// Yearly stats
		for (const [year, yearlyStats] of stats.yearlyStats) {
			statements.push(
				`INSERT INTO PlayerYearlyStats (uid, year, games, wins, goodGames, goodWins, evilGames, evilWins) VALUES ('${escapeSQL(uid)}', ${year}, ${yearlyStats.games}, ${yearlyStats.wins}, ${yearlyStats.goodGames}, ${yearlyStats.goodWins}, ${yearlyStats.evilGames}, ${yearlyStats.evilWins});`,
			);
		}

		// Loss reasons
		statements.push(
			`INSERT INTO PlayerLossReasons (uid, threeMissionFails, threeMissionSuccessEvil, fiveRejectedProposals, merlinAssassinated) VALUES ('${escapeSQL(uid)}', ${stats.lossReasons.threeMissionFails}, ${stats.lossReasons.threeMissionSuccessEvil}, ${stats.lossReasons.fiveRejectedProposals}, ${stats.lossReasons.merlinAssassinated});`,
		);

		// Merlin stats
		statements.push(
			`INSERT INTO PlayerMerlinStats (uid, gamesPlayed, wins, timesAssassinated, survivedAssassination) VALUES ('${escapeSQL(uid)}', ${stats.merlinStats.gamesPlayed}, ${stats.merlinStats.wins}, ${stats.merlinStats.timesAssassinated}, ${stats.merlinStats.survivedAssassination});`,
		);

		// Assassin stats
		statements.push(
			`INSERT INTO PlayerAssassinStats (uid, gamesPlayed, wins, successfulAssassinations, failedAssassinations) VALUES ('${escapeSQL(uid)}', ${stats.assassinStats.gamesPlayed}, ${stats.assassinStats.wins}, ${stats.assassinStats.successfulAssassinations}, ${stats.assassinStats.failedAssassinations});`,
		);

		// Evil teammate stats
		statements.push(
			`INSERT INTO PlayerEvilTeammateStats (uid, gamesPlayed, wins, successfulAssassinations, failedAssassinations) VALUES ('${escapeSQL(uid)}', ${stats.evilTeammateStats.gamesPlayed}, ${stats.evilTeammateStats.wins}, ${stats.evilTeammateStats.successfulAssassinations}, ${stats.evilTeammateStats.failedAssassinations});`,
		);
	}

	return statements;
}

function buildPlayerInsertStatementsWithoutDelete(statsMap: Map<string, FullStats>, now: string): string[] {
	const statements: string[] = [];

	// No DELETE statements - used when resuming after a failed batch

	for (const [uid, stats] of statsMap) {
		// Base stats (use INSERT OR REPLACE to handle duplicates from previous run)
		statements.push(
			`INSERT OR REPLACE INTO PlayerStats (uid, name, isMapped, gamesPlayed, wins, goodGames, goodWins, evilGames, evilWins, createdAt, updatedAt) VALUES ('${escapeSQL(uid)}', '${escapeSQL(stats.name)}', ${stats.isMapped ? 1 : 0}, ${stats.gamesPlayed}, ${stats.wins}, ${stats.goodGames}, ${stats.goodWins}, ${stats.evilGames}, ${stats.evilWins}, '${now}', '${now}');`,
		);

		// Role stats (for all roles, including ones with 0 games)
		for (const role of ALL_ROLES) {
			const roleStats = stats.roleStats.get(role) ?? createEmptyRoleStats();
			statements.push(
				`INSERT OR REPLACE INTO PlayerRoleStats (uid, role, games, wins, losses, threeMissionFails, threeMissionSuccesses, fiveRejectedProposals, merlinAssassinated, wasAssassinated) VALUES ('${escapeSQL(uid)}', '${role}', ${roleStats.games}, ${roleStats.wins}, ${roleStats.losses}, ${roleStats.threeMissionFails}, ${roleStats.threeMissionSuccesses}, ${roleStats.fiveRejectedProposals}, ${roleStats.merlinAssassinated}, ${roleStats.wasAssassinated});`,
			);
		}

		// Yearly stats
		for (const [year, yearlyStats] of stats.yearlyStats) {
			statements.push(
				`INSERT OR REPLACE INTO PlayerYearlyStats (uid, year, games, wins, goodGames, goodWins, evilGames, evilWins) VALUES ('${escapeSQL(uid)}', ${year}, ${yearlyStats.games}, ${yearlyStats.wins}, ${yearlyStats.goodGames}, ${yearlyStats.goodWins}, ${yearlyStats.evilGames}, ${yearlyStats.evilWins});`,
			);
		}

		// Loss reasons
		statements.push(
			`INSERT OR REPLACE INTO PlayerLossReasons (uid, threeMissionFails, threeMissionSuccessEvil, fiveRejectedProposals, merlinAssassinated) VALUES ('${escapeSQL(uid)}', ${stats.lossReasons.threeMissionFails}, ${stats.lossReasons.threeMissionSuccessEvil}, ${stats.lossReasons.fiveRejectedProposals}, ${stats.lossReasons.merlinAssassinated});`,
		);

		// Merlin stats
		statements.push(
			`INSERT OR REPLACE INTO PlayerMerlinStats (uid, gamesPlayed, wins, timesAssassinated, survivedAssassination) VALUES ('${escapeSQL(uid)}', ${stats.merlinStats.gamesPlayed}, ${stats.merlinStats.wins}, ${stats.merlinStats.timesAssassinated}, ${stats.merlinStats.survivedAssassination});`,
		);

		// Assassin stats
		statements.push(
			`INSERT OR REPLACE INTO PlayerAssassinStats (uid, gamesPlayed, wins, successfulAssassinations, failedAssassinations) VALUES ('${escapeSQL(uid)}', ${stats.assassinStats.gamesPlayed}, ${stats.assassinStats.wins}, ${stats.assassinStats.successfulAssassinations}, ${stats.assassinStats.failedAssassinations});`,
		);
	}

	return statements;
}

function buildPlayerUpsertStatements(statsMap: Map<string, FullStats>, now: string): string[] {
	const statements: string[] = [];

	for (const [uid, stats] of statsMap) {
		// Delete existing related records for this UID before inserting new ones
		// This ensures clean replacement for the affected players only
		statements.push(`DELETE FROM PlayerEvilTeammateStats WHERE uid = '${escapeSQL(uid)}';`);
		statements.push(`DELETE FROM PlayerAssassinStats WHERE uid = '${escapeSQL(uid)}';`);
		statements.push(`DELETE FROM PlayerMerlinStats WHERE uid = '${escapeSQL(uid)}';`);
		statements.push(`DELETE FROM PlayerLossReasons WHERE uid = '${escapeSQL(uid)}';`);
		statements.push(`DELETE FROM PlayerYearlyStats WHERE uid = '${escapeSQL(uid)}';`);
		statements.push(`DELETE FROM PlayerRoleStats WHERE uid = '${escapeSQL(uid)}';`);
		statements.push(`DELETE FROM PlayerStats WHERE uid = '${escapeSQL(uid)}';`);

		// Base stats
		statements.push(
			`INSERT INTO PlayerStats (uid, name, isMapped, gamesPlayed, wins, goodGames, goodWins, evilGames, evilWins, createdAt, updatedAt) VALUES ('${escapeSQL(uid)}', '${escapeSQL(stats.name)}', ${stats.isMapped ? 1 : 0}, ${stats.gamesPlayed}, ${stats.wins}, ${stats.goodGames}, ${stats.goodWins}, ${stats.evilGames}, ${stats.evilWins}, '${now}', '${now}');`,
		);

		// Role stats (for all roles, including ones with 0 games)
		for (const role of ALL_ROLES) {
			const roleStats = stats.roleStats.get(role) ?? createEmptyRoleStats();
			statements.push(
				`INSERT INTO PlayerRoleStats (uid, role, games, wins, losses, threeMissionFails, threeMissionSuccesses, fiveRejectedProposals, merlinAssassinated, wasAssassinated) VALUES ('${escapeSQL(uid)}', '${role}', ${roleStats.games}, ${roleStats.wins}, ${roleStats.losses}, ${roleStats.threeMissionFails}, ${roleStats.threeMissionSuccesses}, ${roleStats.fiveRejectedProposals}, ${roleStats.merlinAssassinated}, ${roleStats.wasAssassinated});`,
			);
		}

		// Yearly stats
		for (const [year, yearlyStats] of stats.yearlyStats) {
			statements.push(
				`INSERT INTO PlayerYearlyStats (uid, year, games, wins, goodGames, goodWins, evilGames, evilWins) VALUES ('${escapeSQL(uid)}', ${year}, ${yearlyStats.games}, ${yearlyStats.wins}, ${yearlyStats.goodGames}, ${yearlyStats.goodWins}, ${yearlyStats.evilGames}, ${yearlyStats.evilWins});`,
			);
		}

		// Loss reasons
		statements.push(
			`INSERT INTO PlayerLossReasons (uid, threeMissionFails, threeMissionSuccessEvil, fiveRejectedProposals, merlinAssassinated) VALUES ('${escapeSQL(uid)}', ${stats.lossReasons.threeMissionFails}, ${stats.lossReasons.threeMissionSuccessEvil}, ${stats.lossReasons.fiveRejectedProposals}, ${stats.lossReasons.merlinAssassinated});`,
		);

		// Merlin stats
		statements.push(
			`INSERT INTO PlayerMerlinStats (uid, gamesPlayed, wins, timesAssassinated, survivedAssassination) VALUES ('${escapeSQL(uid)}', ${stats.merlinStats.gamesPlayed}, ${stats.merlinStats.wins}, ${stats.merlinStats.timesAssassinated}, ${stats.merlinStats.survivedAssassination});`,
		);

		// Assassin stats
		statements.push(
			`INSERT INTO PlayerAssassinStats (uid, gamesPlayed, wins, successfulAssassinations, failedAssassinations) VALUES ('${escapeSQL(uid)}', ${stats.assassinStats.gamesPlayed}, ${stats.assassinStats.wins}, ${stats.assassinStats.successfulAssassinations}, ${stats.assassinStats.failedAssassinations});`,
		);

		// Evil teammate stats
		statements.push(
			`INSERT INTO PlayerEvilTeammateStats (uid, gamesPlayed, wins, successfulAssassinations, failedAssassinations) VALUES ('${escapeSQL(uid)}', ${stats.evilTeammateStats.gamesPlayed}, ${stats.evilTeammateStats.wins}, ${stats.evilTeammateStats.successfulAssassinations}, ${stats.evilTeammateStats.failedAssassinations});`,
		);
	}

	return statements;
}

function buildPersonInsertStatements(statsMap: Map<string, FullStats>, now: string): string[] {
	const statements: string[] = [];

	// Clear existing data
	statements.push('DELETE FROM PersonEvilTeammateStats;');
	statements.push('DELETE FROM PersonAssassinStats;');
	statements.push('DELETE FROM PersonMerlinStats;');
	statements.push('DELETE FROM PersonLossReasons;');
	statements.push('DELETE FROM PersonYearlyStats;');
	statements.push('DELETE FROM PersonRoleStats;');
	statements.push('DELETE FROM PersonStats;');

	for (const [personId, stats] of statsMap) {
		// Base stats
		statements.push(
			`INSERT INTO PersonStats (personId, gamesPlayed, wins, goodGames, goodWins, evilGames, evilWins, createdAt, updatedAt) VALUES ('${escapeSQL(personId)}', ${stats.gamesPlayed}, ${stats.wins}, ${stats.goodGames}, ${stats.goodWins}, ${stats.evilGames}, ${stats.evilWins}, '${now}', '${now}');`,
		);

		// Role stats
		for (const role of ALL_ROLES) {
			const roleStats = stats.roleStats.get(role) ?? createEmptyRoleStats();
			statements.push(
				`INSERT INTO PersonRoleStats (personId, role, games, wins, losses, threeMissionFails, threeMissionSuccesses, fiveRejectedProposals, merlinAssassinated, wasAssassinated) VALUES ('${escapeSQL(personId)}', '${role}', ${roleStats.games}, ${roleStats.wins}, ${roleStats.losses}, ${roleStats.threeMissionFails}, ${roleStats.threeMissionSuccesses}, ${roleStats.fiveRejectedProposals}, ${roleStats.merlinAssassinated}, ${roleStats.wasAssassinated});`,
			);
		}

		// Yearly stats
		for (const [year, yearlyStats] of stats.yearlyStats) {
			statements.push(
				`INSERT INTO PersonYearlyStats (personId, year, games, wins, goodGames, goodWins, evilGames, evilWins) VALUES ('${escapeSQL(personId)}', ${year}, ${yearlyStats.games}, ${yearlyStats.wins}, ${yearlyStats.goodGames}, ${yearlyStats.goodWins}, ${yearlyStats.evilGames}, ${yearlyStats.evilWins});`,
			);
		}

		// Loss reasons
		statements.push(
			`INSERT INTO PersonLossReasons (personId, threeMissionFails, threeMissionSuccessEvil, fiveRejectedProposals, merlinAssassinated) VALUES ('${escapeSQL(personId)}', ${stats.lossReasons.threeMissionFails}, ${stats.lossReasons.threeMissionSuccessEvil}, ${stats.lossReasons.fiveRejectedProposals}, ${stats.lossReasons.merlinAssassinated});`,
		);

		// Merlin stats
		statements.push(
			`INSERT INTO PersonMerlinStats (personId, gamesPlayed, wins, timesAssassinated, survivedAssassination) VALUES ('${escapeSQL(personId)}', ${stats.merlinStats.gamesPlayed}, ${stats.merlinStats.wins}, ${stats.merlinStats.timesAssassinated}, ${stats.merlinStats.survivedAssassination});`,
		);

		// Assassin stats
		statements.push(
			`INSERT INTO PersonAssassinStats (personId, gamesPlayed, wins, successfulAssassinations, failedAssassinations) VALUES ('${escapeSQL(personId)}', ${stats.assassinStats.gamesPlayed}, ${stats.assassinStats.wins}, ${stats.assassinStats.successfulAssassinations}, ${stats.assassinStats.failedAssassinations});`,
		);

		// Evil teammate stats
		statements.push(
			`INSERT INTO PersonEvilTeammateStats (personId, gamesPlayed, wins, successfulAssassinations, failedAssassinations) VALUES ('${escapeSQL(personId)}', ${stats.evilTeammateStats.gamesPlayed}, ${stats.evilTeammateStats.wins}, ${stats.evilTeammateStats.successfulAssassinations}, ${stats.evilTeammateStats.failedAssassinations});`,
		);
	}

	return statements;
}

function buildPersonInsertStatementsWithoutDelete(statsMap: Map<string, FullStats>, now: string): string[] {
	const statements: string[] = [];

	// No DELETE statements - used when resuming after a failed batch

	for (const [personId, stats] of statsMap) {
		// Base stats (use INSERT OR REPLACE to handle duplicates from previous run)
		statements.push(
			`INSERT OR REPLACE INTO PersonStats (personId, gamesPlayed, wins, goodGames, goodWins, evilGames, evilWins, createdAt, updatedAt) VALUES ('${escapeSQL(personId)}', ${stats.gamesPlayed}, ${stats.wins}, ${stats.goodGames}, ${stats.goodWins}, ${stats.evilGames}, ${stats.evilWins}, '${now}', '${now}');`,
		);

		// Role stats
		for (const role of ALL_ROLES) {
			const roleStats = stats.roleStats.get(role) ?? createEmptyRoleStats();
			statements.push(
				`INSERT OR REPLACE INTO PersonRoleStats (personId, role, games, wins, losses, threeMissionFails, threeMissionSuccesses, fiveRejectedProposals, merlinAssassinated, wasAssassinated) VALUES ('${escapeSQL(personId)}', '${role}', ${roleStats.games}, ${roleStats.wins}, ${roleStats.losses}, ${roleStats.threeMissionFails}, ${roleStats.threeMissionSuccesses}, ${roleStats.fiveRejectedProposals}, ${roleStats.merlinAssassinated}, ${roleStats.wasAssassinated});`,
			);
		}

		// Yearly stats
		for (const [year, yearlyStats] of stats.yearlyStats) {
			statements.push(
				`INSERT OR REPLACE INTO PersonYearlyStats (personId, year, games, wins, goodGames, goodWins, evilGames, evilWins) VALUES ('${escapeSQL(personId)}', ${year}, ${yearlyStats.games}, ${yearlyStats.wins}, ${yearlyStats.goodGames}, ${yearlyStats.goodWins}, ${yearlyStats.evilGames}, ${yearlyStats.evilWins});`,
			);
		}

		// Loss reasons
		statements.push(
			`INSERT OR REPLACE INTO PersonLossReasons (personId, threeMissionFails, threeMissionSuccessEvil, fiveRejectedProposals, merlinAssassinated) VALUES ('${escapeSQL(personId)}', ${stats.lossReasons.threeMissionFails}, ${stats.lossReasons.threeMissionSuccessEvil}, ${stats.lossReasons.fiveRejectedProposals}, ${stats.lossReasons.merlinAssassinated});`,
		);

		// Merlin stats
		statements.push(
			`INSERT OR REPLACE INTO PersonMerlinStats (personId, gamesPlayed, wins, timesAssassinated, survivedAssassination) VALUES ('${escapeSQL(personId)}', ${stats.merlinStats.gamesPlayed}, ${stats.merlinStats.wins}, ${stats.merlinStats.timesAssassinated}, ${stats.merlinStats.survivedAssassination});`,
		);

		// Assassin stats
		statements.push(
			`INSERT OR REPLACE INTO PersonAssassinStats (personId, gamesPlayed, wins, successfulAssassinations, failedAssassinations) VALUES ('${escapeSQL(personId)}', ${stats.assassinStats.gamesPlayed}, ${stats.assassinStats.wins}, ${stats.assassinStats.successfulAssassinations}, ${stats.assassinStats.failedAssassinations});`,
		);
	}

	return statements;
}

function buildPersonUpsertStatements(statsMap: Map<string, FullStats>, now: string): string[] {
	const statements: string[] = [];

	for (const [personId, stats] of statsMap) {
		// Delete existing related records for this person before inserting new ones
		// This ensures clean replacement for the affected people only
		statements.push(`DELETE FROM PersonAssassinStats WHERE personId = '${escapeSQL(personId)}';`);
		statements.push(`DELETE FROM PersonMerlinStats WHERE personId = '${escapeSQL(personId)}';`);
		statements.push(`DELETE FROM PersonLossReasons WHERE personId = '${escapeSQL(personId)}';`);
		statements.push(`DELETE FROM PersonYearlyStats WHERE personId = '${escapeSQL(personId)}';`);
		statements.push(`DELETE FROM PersonRoleStats WHERE personId = '${escapeSQL(personId)}';`);
		statements.push(`DELETE FROM PersonStats WHERE personId = '${escapeSQL(personId)}';`);

		// Base stats
		statements.push(
			`INSERT INTO PersonStats (personId, gamesPlayed, wins, goodGames, goodWins, evilGames, evilWins, createdAt, updatedAt) VALUES ('${escapeSQL(personId)}', ${stats.gamesPlayed}, ${stats.wins}, ${stats.goodGames}, ${stats.goodWins}, ${stats.evilGames}, ${stats.evilWins}, '${now}', '${now}');`,
		);

		// Role stats
		for (const role of ALL_ROLES) {
			const roleStats = stats.roleStats.get(role) ?? createEmptyRoleStats();
			statements.push(
				`INSERT INTO PersonRoleStats (personId, role, games, wins, losses, threeMissionFails, threeMissionSuccesses, fiveRejectedProposals, merlinAssassinated, wasAssassinated) VALUES ('${escapeSQL(personId)}', '${role}', ${roleStats.games}, ${roleStats.wins}, ${roleStats.losses}, ${roleStats.threeMissionFails}, ${roleStats.threeMissionSuccesses}, ${roleStats.fiveRejectedProposals}, ${roleStats.merlinAssassinated}, ${roleStats.wasAssassinated});`,
			);
		}

		// Yearly stats
		for (const [year, yearlyStats] of stats.yearlyStats) {
			statements.push(
				`INSERT INTO PersonYearlyStats (personId, year, games, wins, goodGames, goodWins, evilGames, evilWins) VALUES ('${escapeSQL(personId)}', ${year}, ${yearlyStats.games}, ${yearlyStats.wins}, ${yearlyStats.goodGames}, ${yearlyStats.goodWins}, ${yearlyStats.evilGames}, ${yearlyStats.evilWins});`,
			);
		}

		// Loss reasons
		statements.push(
			`INSERT INTO PersonLossReasons (personId, threeMissionFails, threeMissionSuccessEvil, fiveRejectedProposals, merlinAssassinated) VALUES ('${escapeSQL(personId)}', ${stats.lossReasons.threeMissionFails}, ${stats.lossReasons.threeMissionSuccessEvil}, ${stats.lossReasons.fiveRejectedProposals}, ${stats.lossReasons.merlinAssassinated});`,
		);

		// Merlin stats
		statements.push(
			`INSERT INTO PersonMerlinStats (personId, gamesPlayed, wins, timesAssassinated, survivedAssassination) VALUES ('${escapeSQL(personId)}', ${stats.merlinStats.gamesPlayed}, ${stats.merlinStats.wins}, ${stats.merlinStats.timesAssassinated}, ${stats.merlinStats.survivedAssassination});`,
		);

		// Assassin stats
		statements.push(
			`INSERT INTO PersonAssassinStats (personId, gamesPlayed, wins, successfulAssassinations, failedAssassinations) VALUES ('${escapeSQL(personId)}', ${stats.assassinStats.gamesPlayed}, ${stats.assassinStats.wins}, ${stats.assassinStats.successfulAssassinations}, ${stats.assassinStats.failedAssassinations});`,
		);

		// Evil teammate stats
		statements.push(
			`INSERT INTO PersonEvilTeammateStats (personId, gamesPlayed, wins, successfulAssassinations, failedAssassinations) VALUES ('${escapeSQL(personId)}', ${stats.evilTeammateStats.gamesPlayed}, ${stats.evilTeammateStats.wins}, ${stats.evilTeammateStats.successfulAssassinations}, ${stats.evilTeammateStats.failedAssassinations});`,
		);
	}

	return statements;
}

function updateLastStatsProcessedTime(now: string): string {
	return `UPDATE GameIngestionState SET lastStatsProcessedTime = '${now}', updatedAt = '${now}' WHERE id = 1;`;
}

async function getAllGamesForUids(local: boolean, uids: Set<string>): Promise<GameData[]> {
	if (uids.size === 0) {
		return [];
	}

	console.log(`Fetching all games for ${uids.size} affected UIDs...`);

	const RawGameSchema = z.object({
		firebaseKey: z.string(),
		gameJson: z.string(),
		createdAt: z.string(),
	});

	// Use PlayerGame to find all games for the affected UIDs
	const uidList = Array.from(uids)
		.map((uid) => `'${escapeSQL(uid)}'`)
		.join(',');
	const gameKeysResult = executeQuery<{firebaseKey: string}>(
		`SELECT DISTINCT firebaseKey FROM PlayerGame WHERE playerUid IN (${uidList})`,
		local,
	);

	if (gameKeysResult.length === 0) {
		console.log('No games found for affected UIDs');
		return [];
	}

	console.log(`Found ${gameKeysResult.length} games for affected players`);

	const games: GameData[] = [];
	const batchSize = 500;
	const totalCount = gameKeysResult.length;

	for (let offset = 0; offset < totalCount; offset += batchSize) {
		const batchKeys = gameKeysResult
			.slice(offset, offset + batchSize)
			.map((r) => `'${escapeSQL(r.firebaseKey)}'`)
			.join(',');
		const sql = `SELECT firebaseKey, gameJson, createdAt FROM RawGameData WHERE firebaseKey IN (${batchKeys})`;
		const rawGames = executeQuery<z.infer<typeof RawGameSchema>>(sql, local);

		for (const raw of rawGames) {
			try {
				const parsed = JSON.parse(raw.gameJson);
				if (parsed.players && Array.isArray(parsed.players)) {
					games.push({
						id: raw.firebaseKey,
						players: parsed.players,
						outcome: parsed.outcome,
						timeCreated: new Date(raw.createdAt),
					});
				}
			} catch {
				// Skip invalid games
			}
		}
	}

	console.log(`Parsed ${games.length} valid games for affected players`);
	return games;
}

async function runFullRecomputation(args: Args): Promise<void> {
	const isResuming = args.resumeFromBatch !== null;
	console.log(
		`Running FULL statistics recomputation${isResuming ? ` (resuming from batch ${args.resumeFromBatch})` : ''}...`,
	);
	const startTime = Date.now();

	// Timing: fetch mappings
	const mappingStart = Date.now();
	const {uidToPersonId, personIdToName, personIdToUids} = await getPersonMappings(args.local);
	console.log(`⏱️  Fetched mappings in ${Date.now() - mappingStart}ms`);

	// Timing: fetch games
	const gamesStart = Date.now();
	const games = await getAllGames(args.local);
	console.log(`⏱️  Fetched games in ${Date.now() - gamesStart}ms`);

	// Timing: calculate player stats
	const playerCalcStart = Date.now();
	const playerStatsMap = calculatePlayerStats(games, uidToPersonId);
	console.log(`⏱️  Calculated player stats for ${playerStatsMap.size} UIDs in ${Date.now() - playerCalcStart}ms`);

	// Timing: calculate person stats
	const personCalcStart = Date.now();
	const personStatsMap = calculatePersonStats(games, personIdToUids, personIdToName);
	console.log(`⏱️  Calculated person stats for ${personStatsMap.size} people in ${Date.now() - personCalcStart}ms`);

	// Build SQL statements
	const now = new Date().toISOString();

	// When resuming, skip DELETE statements (they were already executed in previous run)
	const playerStatements = isResuming
		? buildPlayerInsertStatementsWithoutDelete(playerStatsMap, now)
		: buildPlayerInsertStatements(playerStatsMap, now);
	const personStatements = isResuming
		? buildPersonInsertStatementsWithoutDelete(personStatsMap, now)
		: buildPersonInsertStatements(personStatsMap, now);
	const allStatements = [...playerStatements, ...personStatements];
	allStatements.push(updateLastStatsProcessedTime(now));

	const totalBatches = Math.ceil(allStatements.length / BATCH_SIZE);
	console.log(
		`Generated ${allStatements.length} SQL statements (${playerStatements.length} player, ${personStatements.length} person) in ${totalBatches} batches`,
	);

	// Execute in batches
	const execStart = Date.now();
	const startBatch = args.resumeFromBatch ?? 1;
	const startIndex = (startBatch - 1) * BATCH_SIZE;

	if (isResuming) {
		console.log(`⏩ Skipping batches 1-${startBatch - 1}, starting from batch ${startBatch}`);
	}

	for (let i = startIndex; i < allStatements.length; i += BATCH_SIZE) {
		const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
		const batch = allStatements.slice(i, i + BATCH_SIZE);
		console.log(`Executing batch ${batchNumber}/${totalBatches} (${batch.length} statements)...`);
		await executeSQLBatchWithRetry(batch, args.dryRun, args.local, batchNumber);
	}
	console.log(`⏱️  Executed SQL in ${Date.now() - execStart}ms`);

	const totalTime = Date.now() - startTime;
	console.log(`\n✅ Full recomputation complete in ${totalTime}ms`);
	console.log(`   ${playerStatsMap.size} player stats (by UID)`);
	console.log(`   ${personStatsMap.size} person stats (by person ID)`);
}

async function runIncrementalUpdate(args: Args): Promise<void> {
	console.log('Running INCREMENTAL statistics update...');
	const startTime = Date.now();

	// Get the last processed time
	const lastProcessedTime = await getLastStatsProcessedTime(args.local);

	// Fetch mappings
	const mappingStart = Date.now();
	const {uidToPersonId, personIdToName, personIdToUids} = await getPersonMappings(args.local);
	console.log(`⏱️  Fetched mappings in ${Date.now() - mappingStart}ms`);

	// Fetch only new games since last run
	const gamesStart = Date.now();
	const newGames = await getGamesSince(args.local, lastProcessedTime);
	console.log(`⏱️  Fetched new games in ${Date.now() - gamesStart}ms`);

	if (newGames.length === 0) {
		console.log('\n✅ No new games to process - statistics are up to date');
		return;
	}

	// Identify affected UIDs and person IDs
	const {affectedUids, affectedPersonIds} = getAffectedUidsAndPersonIds(newGames, uidToPersonId);
	console.log(`Found ${affectedUids.size} affected UIDs and ${affectedPersonIds.size} affected people`);

	// Fetch ALL games for affected players (needed to recompute their full stats)
	const allGamesStart = Date.now();
	const allGamesForAffected = await getAllGamesForUids(args.local, affectedUids);
	console.log(`⏱️  Fetched all games for affected players in ${Date.now() - allGamesStart}ms`);

	// Calculate stats only for affected players
	const playerCalcStart = Date.now();
	const playerStatsMap = calculatePlayerStats(allGamesForAffected, uidToPersonId);
	// Filter to only include affected UIDs
	const filteredPlayerStats = new Map<string, FullStats>();
	for (const uid of affectedUids) {
		const stats = playerStatsMap.get(uid);
		if (stats) {
			filteredPlayerStats.set(uid, stats);
		}
	}
	console.log(
		`⏱️  Calculated player stats for ${filteredPlayerStats.size} affected UIDs in ${Date.now() - playerCalcStart}ms`,
	);

	// Calculate person stats only for affected people
	const personCalcStart = Date.now();
	const filteredPersonIdToUids = new Map<string, string[]>();
	for (const personId of affectedPersonIds) {
		const uids = personIdToUids.get(personId);
		if (uids) {
			filteredPersonIdToUids.set(personId, uids);
		}
	}
	const personStatsMap = calculatePersonStats(allGamesForAffected, filteredPersonIdToUids, personIdToName);
	console.log(
		`⏱️  Calculated person stats for ${personStatsMap.size} affected people in ${Date.now() - personCalcStart}ms`,
	);

	// Build upsert SQL statements (only for affected players/people)
	const now = new Date().toISOString();
	const playerStatements = buildPlayerUpsertStatements(filteredPlayerStats, now);
	const personStatements = buildPersonUpsertStatements(personStatsMap, now);
	const allStatements = [...playerStatements, ...personStatements];
	allStatements.push(updateLastStatsProcessedTime(now));

	const totalBatches = Math.ceil(allStatements.length / BATCH_SIZE);
	console.log(
		`Generated ${allStatements.length} SQL statements (${playerStatements.length} player, ${personStatements.length} person) in ${totalBatches} batches`,
	);

	// Execute in batches with retry logic
	const execStart = Date.now();
	for (let i = 0; i < allStatements.length; i += BATCH_SIZE) {
		const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
		const batch = allStatements.slice(i, i + BATCH_SIZE);
		console.log(`Executing batch ${batchNumber}/${totalBatches} (${batch.length} statements)...`);
		await executeSQLBatchWithRetry(batch, args.dryRun, args.local, batchNumber);
	}
	console.log(`⏱️  Executed SQL in ${Date.now() - execStart}ms`);

	const totalTime = Date.now() - startTime;
	console.log(`\n✅ Incremental update complete in ${totalTime}ms`);
	console.log(`   ${newGames.length} new games processed`);
	console.log(`   ${filteredPlayerStats.size} player stats updated (by UID)`);
	console.log(`   ${personStatsMap.size} person stats updated (by person ID)`);
}

async function main() {
	const args = parseArgs();
	const target = args.local ? 'local' : 'remote';
	const mode = args.full ? 'full' : 'incremental';
	console.log(`Populate statistics tables from games (${target}, ${mode} mode)`);
	console.log(
		`Options: dryRun=${args.dryRun}, local=${args.local}, full=${args.full}, resumeFromBatch=${args.resumeFromBatch ?? 'none'}`,
	);

	// Resume only makes sense with --full mode
	if (args.resumeFromBatch !== null && !args.full) {
		throw new Error('--resume flag requires --full mode');
	}

	if (args.full) {
		await runFullRecomputation(args);
	} else {
		await runIncrementalUpdate(args);
	}
}

main().catch(console.error);
