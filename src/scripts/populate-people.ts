#!/usr/bin/env npx tsx
/**
 * Populate Person, PersonUid, and PersonDateRange tables from external config.
 *
 * Usage:
 *   npx tsx src/scripts/populate-people.ts [--local] [--dry-run]
 *
 * Options:
 *   --local       Use local D1 database instead of remote (default: remote)
 *   --dry-run     Show what would be done without executing
 *
 * Reads people data from avalon-log-scraper config.json5 file.
 */

import {execSync} from 'child_process';
import * as fs from 'fs';
import {z} from 'zod';
import {randomUUID} from 'crypto';
import JSON5 from 'json5';

const DATABASE_NAME = 'avalon-analytics-juicy-tyrannosaurus';
const CONFIG_PATH = '/Users/craig/projects/avalon-log-scraper/avalon-dropwizard-application/config.json5';

interface PersonConfig {
	fullName: string;
	uuids: string[];
	dateRanges?: Array<{
		startDate?: string;
		endDate?: string;
	}>;
}

interface Args {
	dryRun: boolean;
	local: boolean;
}

function loadPeopleFromConfig(): PersonConfig[] {
	if (!fs.existsSync(CONFIG_PATH)) {
		throw new Error(`Config file not found: ${CONFIG_PATH}`);
	}

	const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
	const config = JSON5.parse(content);

	if (!config.people?.people || !Array.isArray(config.people.people)) {
		throw new Error('Invalid config: expected people.people array');
	}

	return config.people.people as PersonConfig[];
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

function executeSQLBatch(statements: string[], dryRun: boolean, local: boolean): void {
	const sql = statements.join('\n');

	if (dryRun) {
		console.log('Would execute SQL:');
		console.log(sql.substring(0, 2000) + (sql.length > 2000 ? '...' : ''));
		return;
	}

	const tempFile = `/tmp/avalon-people-${Date.now()}.sql`;
	fs.writeFileSync(tempFile, sql);

	const locationFlag = local ? '--local' : '--remote';
	execSync(`npx wrangler d1 execute ${DATABASE_NAME} ${locationFlag} --yes --file="${tempFile}"`, {
		stdio: 'inherit',
	});
	fs.unlinkSync(tempFile);
}

interface ExistingPerson {
	id: string;
	name: string;
}

interface ExistingPersonUid {
	uid: string;
	personId: string;
}

async function main() {
	const args = parseArgs();
	console.log(`Running with: local=${args.local}, dryRun=${args.dryRun}`);

	const people = loadPeopleFromConfig();
	console.log(`Loaded ${people.length} people from ${CONFIG_PATH}`);

	// Get existing data
	const existingPersons = executeQuery<ExistingPerson>('SELECT id, name FROM Person', args.local);
	const existingUids = executeQuery<ExistingPersonUid>('SELECT uid, personId FROM PersonUid', args.local);

	const personByName = new Map<string, ExistingPerson>();
	for (const p of existingPersons) {
		personByName.set(p.name, p);
	}

	const uidSet = new Set<string>(existingUids.map((u) => u.uid));

	const statements: string[] = [];
	const now = new Date().toISOString();

	for (const person of people) {
		const existingPerson = personByName.get(person.fullName);

		if (existingPerson) {
			// Person exists, add any new UIDs
			const newUids = person.uuids.filter((uid) => !uidSet.has(uid));
			for (const uid of newUids) {
				const id = randomUUID();
				statements.push(
					`INSERT INTO PersonUid (id, uid, personId, createdAt) VALUES ('${id}', '${escapeSQL(uid)}', '${existingPerson.id}', '${now}');`,
				);
				uidSet.add(uid);
				console.log(`Will add UID ${uid} to ${person.fullName}`);
			}
		} else {
			// Create new person
			const personId = randomUUID();
			statements.push(
				`INSERT INTO Person (id, name, createdAt) VALUES ('${personId}', '${escapeSQL(person.fullName)}', '${now}');`,
			);

			// Add all UIDs
			for (const uid of person.uuids) {
				if (!uidSet.has(uid)) {
					const uidId = randomUUID();
					statements.push(
						`INSERT INTO PersonUid (id, uid, personId, createdAt) VALUES ('${uidId}', '${escapeSQL(uid)}', '${personId}', '${now}');`,
					);
					uidSet.add(uid);
				}
			}

			// Add date ranges
			if (person.dateRanges) {
				for (const dr of person.dateRanges) {
					const drId = randomUUID();
					const startDate = dr.startDate || '';
					const endDate = dr.endDate ? `'${dr.endDate}'` : 'NULL';
					statements.push(
						`INSERT INTO PersonDateRange (id, personId, startDate, endDate, createdAt) VALUES ('${drId}', '${personId}', '${startDate}', ${endDate}, '${now}');`,
					);
				}
			}

			const dateRangeCount = person.dateRanges?.length || 0;
			console.log(
				`Will add ${person.fullName} with ${person.uuids.length} UIDs and ${dateRangeCount} date ranges`,
			);
		}
	}

	if (statements.length === 0) {
		console.log('No changes needed - all people already exist');
		return;
	}

	console.log(`\nExecuting ${statements.length} SQL statements...`);
	executeSQLBatch(statements, args.dryRun, args.local);
	console.log('Finished populating people');
}

main().catch(console.error);
