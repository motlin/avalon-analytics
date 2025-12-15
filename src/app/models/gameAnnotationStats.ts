/**
 * Per-Game Annotation Statistics
 *
 * Analyzes a single game to extract annotation statistics per player.
 * Returns data organized by predicate name -> player UID -> stats.
 */

import type {Game} from './game';
import type {Alignment, PredicateEvaluationResult} from './predicateEvaluator';
import {evaluateGamePredicates, getAllResults} from './predicateEvaluator';

// ============================================================================
// Types
// ============================================================================

export interface PlayerAnnotationStat {
	fires: number;
	opportunities: number;
	alignment: Alignment;
	role: string | undefined;
}

/**
 * Map structure: predicateName -> playerUid -> stats
 */
export type GameAnnotationStatsMap = Map<string, Map<string, PlayerAnnotationStat>>;

// ============================================================================
// Main Function
// ============================================================================

/**
 * Analyzes a game and returns annotation statistics organized by predicate and player.
 *
 * @param game - The game to analyze
 * @returns Map<predicateName, Map<playerUid, PlayerAnnotationStat>>
 */
export function analyzeGameForAnnotationStats(game: Game): GameAnnotationStatsMap {
	// Build name to UID lookup from game players
	const nameToUid = new Map<string, string>();
	for (const player of game.players) {
		nameToUid.set(player.name, player.uid);
	}

	// Evaluate all predicates for the game
	const gameResults = evaluateGamePredicates(game);
	const allResults = getAllResults(gameResults);

	// Aggregate results by predicate -> player UID
	const statsMap: GameAnnotationStatsMap = new Map();

	for (const result of allResults) {
		// Get or create the predicate map
		let predicateMap = statsMap.get(result.predicateName);
		if (!predicateMap) {
			predicateMap = new Map();
			statsMap.set(result.predicateName, predicateMap);
		}

		// Look up the player UID from the name
		const playerUid = nameToUid.get(result.playerName);
		if (!playerUid) {
			// Skip results for players we cannot map to a UID
			continue;
		}

		// Get or create the player stats
		let playerStats = predicateMap.get(playerUid);
		if (!playerStats) {
			playerStats = {
				fires: 0,
				opportunities: 0,
				alignment: result.alignment,
				role: result.playerRole,
			};
			predicateMap.set(playerUid, playerStats);
		}

		// Accumulate stats
		if (result.isRelevant) {
			playerStats.opportunities++;
		}
		if (result.fired) {
			playerStats.fires++;
		}
	}

	return statsMap;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Flattens the nested map structure into a list of results.
 * Useful for iteration or database insertion.
 */
export interface FlattenedAnnotationStat {
	predicateName: string;
	playerUid: string;
	fires: number;
	opportunities: number;
	alignment: Alignment;
	role: string | undefined;
}

export function flattenAnnotationStats(statsMap: GameAnnotationStatsMap): FlattenedAnnotationStat[] {
	const results: FlattenedAnnotationStat[] = [];

	for (const [predicateName, playerMap] of statsMap) {
		for (const [playerUid, stats] of playerMap) {
			results.push({
				predicateName,
				playerUid,
				...stats,
			});
		}
	}

	return results;
}

/**
 * Merges multiple game annotation stat maps together.
 * Useful for aggregating across multiple games.
 */
export function mergeAnnotationStats(maps: GameAnnotationStatsMap[]): GameAnnotationStatsMap {
	const merged: GameAnnotationStatsMap = new Map();

	for (const map of maps) {
		for (const [predicateName, playerMap] of map) {
			let mergedPredicateMap = merged.get(predicateName);
			if (!mergedPredicateMap) {
				mergedPredicateMap = new Map();
				merged.set(predicateName, mergedPredicateMap);
			}

			for (const [playerUid, stats] of playerMap) {
				const existing = mergedPredicateMap.get(playerUid);
				if (existing) {
					existing.fires += stats.fires;
					existing.opportunities += stats.opportunities;
					// Keep the most recent role/alignment (last write wins)
					existing.alignment = stats.alignment;
					existing.role = stats.role;
				} else {
					mergedPredicateMap.set(playerUid, {...stats});
				}
			}
		}
	}

	return merged;
}
