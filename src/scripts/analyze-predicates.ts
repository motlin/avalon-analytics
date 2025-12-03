/**
 * Predicate Frequency Analysis
 *
 * Analyzes all historical games to count how often each predicate fires.
 * Outputs predicates sorted by frequency (rarest first = most interesting).
 *
 * Usage: npx tsx src/scripts/analyze-predicates.ts /path/to/logs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type {Game} from '../app/models/game';
import {annotateGame, getGameStats} from '../app/models/gameAnnotator';

interface PredicateStats {
	name: string;
	count: number;
	gamesWithPredicate: number;
}

function analyzeGames(logsDir: string): Map<string, PredicateStats> {
	const predicateStats = new Map<string, PredicateStats>();
	const files = fs.readdirSync(logsDir);

	let processedCount = 0;
	let errorCount = 0;

	for (const file of files) {
		if (file.startsWith('.')) continue;

		const filePath = path.join(logsDir, file);
		try {
			const content = fs.readFileSync(filePath, 'utf-8');
			const game = JSON.parse(content) as Game;

			// Skip games without outcome (incomplete games)
			if (!game.outcome?.roles) {
				continue;
			}

			const annotatedGame = annotateGame(game);
			const gameStats = getGameStats(annotatedGame);

			// Track which predicates fired in this game
			const predicatesInThisGame = new Set<string>();

			for (const [predicateName, count] of gameStats.annotationsByPredicate) {
				predicatesInThisGame.add(predicateName);

				const existing = predicateStats.get(predicateName);
				if (existing) {
					existing.count += count;
				} else {
					predicateStats.set(predicateName, {
						name: predicateName,
						count,
						gamesWithPredicate: 0,
					});
				}
			}

			// Increment games count for each predicate that fired
			for (const predicateName of predicatesInThisGame) {
				const stats = predicateStats.get(predicateName);
				if (stats) {
					stats.gamesWithPredicate++;
				}
			}

			processedCount++;
			if (processedCount % 1000 === 0) {
				console.error(`Processed ${processedCount} games...`);
			}
		} catch (error) {
			errorCount++;
			if (errorCount <= 5) {
				console.error(`Error processing ${file}:`, error);
			}
		}
	}

	console.error(`\nProcessed ${processedCount} games with ${errorCount} errors\n`);
	return predicateStats;
}

function main() {
	const logsDir = process.argv[2] || '/Users/craig/projects/avalonlogs/logs';

	if (!fs.existsSync(logsDir)) {
		console.error(`Logs directory not found: ${logsDir}`);
		process.exit(1);
	}

	console.error(`Analyzing games in: ${logsDir}\n`);

	const predicateStats = analyzeGames(logsDir);

	// Sort by count (ascending = rarest first)
	const sorted = [...predicateStats.values()].sort((a, b) => a.count - b.count);

	// Output as table
	console.log('Predicate Frequency Analysis (rarest first = most interesting)\n');
	console.log('Count\tGames\tPredicate Name');
	console.log('-----\t-----\t--------------');

	for (const stat of sorted) {
		console.log(`${stat.count}\t${stat.gamesWithPredicate}\t${stat.name}`);
	}

	// Also output the array ordering for code
	console.log('\n\n// Suggested predicate array ordering (rarest first):');
	console.log('// Copy this to replace PROPOSAL_VOTE_PREDICATES, PROPOSAL_PREDICATES, or MISSION_VOTE_PREDICATES\n');

	const proposalVotePredicates = sorted.filter((s) => s.name.includes('ProposalVotePredicate'));
	const proposalPredicates = sorted.filter(
		(s) => s.name.includes('ProposalPredicate') && !s.name.includes('ProposalVotePredicate'),
	);
	const missionVotePredicates = sorted.filter((s) => s.name.includes('MissionVotePredicate'));

	if (proposalVotePredicates.length > 0) {
		console.log('// PROPOSAL_VOTE_PREDICATES (by rarity):');
		for (const stat of proposalVotePredicates) {
			const shortName = stat.name.replace('ProposalVotePredicate', '');
			console.log(`//   ${shortName}Predicate, // ${stat.count} fires in ${stat.gamesWithPredicate} games`);
		}
	}

	if (proposalPredicates.length > 0) {
		console.log('\n// PROPOSAL_PREDICATES (by rarity):');
		for (const stat of proposalPredicates) {
			const shortName = stat.name.replace('ProposalPredicate', '');
			console.log(`//   ${shortName}Predicate, // ${stat.count} fires in ${stat.gamesWithPredicate} games`);
		}
	}

	if (missionVotePredicates.length > 0) {
		console.log('\n// MISSION_VOTE_PREDICATES (by rarity):');
		for (const stat of missionVotePredicates) {
			const shortName = stat.name.replace('MissionVotePredicate', '');
			console.log(`//   ${shortName}Predicate, // ${stat.count} fires in ${stat.gamesWithPredicate} games`);
		}
	}
}

main();
