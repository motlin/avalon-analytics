import type {Game} from './game';

/**
 * Outcome reasons as stored in the game data
 */
export type OutcomeReason =
	| 'Three successful missions'
	| 'Three failed missions'
	| 'Five rejected proposals'
	| 'Merlin assassinated'
	| 'Failed to assassinate Merlin';

/**
 * Role names as they appear in game data (uppercase)
 */
export type RoleName =
	| 'MERLIN'
	| 'PERCIVAL'
	| 'LOYAL FOLLOWER'
	| 'MORDRED'
	| 'MORGANA'
	| 'OBERON'
	| 'EVIL MINION'
	| 'ASSASSIN';

/**
 * All possible role names including aliases
 */
const ROLE_ALIASES: Record<string, RoleName> = {
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

/**
 * Roles that are on the good team
 */
const GOOD_ROLES: RoleName[] = ['MERLIN', 'PERCIVAL', 'LOYAL FOLLOWER'];

/**
 * Roles that are on the evil team
 */
const EVIL_ROLES: RoleName[] = ['MORDRED', 'MORGANA', 'OBERON', 'EVIL MINION', 'ASSASSIN'];

/**
 * All role names in display order
 */
export const ALL_ROLES: RoleName[] = [...GOOD_ROLES, ...EVIL_ROLES];

/**
 * Role display information
 */
export const ROLE_INFO: Record<RoleName, {displayName: string; team: 'good' | 'evil'}> = {
	MERLIN: {displayName: 'Merlin', team: 'good'},
	PERCIVAL: {displayName: 'Percival', team: 'good'},
	'LOYAL FOLLOWER': {displayName: 'Loyal Follower', team: 'good'},
	MORDRED: {displayName: 'Mordred', team: 'evil'},
	MORGANA: {displayName: 'Morgana', team: 'evil'},
	OBERON: {displayName: 'Oberon', team: 'evil'},
	'EVIL MINION': {displayName: 'Evil Minion', team: 'evil'},
	ASSASSIN: {displayName: 'Assassin', team: 'evil'},
};

/**
 * Statistics for a specific role
 */
export interface RoleStats {
	games: number;
	wins: number;
	losses: number;
	winRate: number;
	threeMissionFails: number;
	threeMissionSuccesses: number;
	fiveRejectedProposals: number;
	merlinAssassinated: number;
	wasAssassinated: number;
}

/**
 * Statistics broken down by year
 */
export interface YearStats {
	year: number;
	games: number;
	wins: number;
	losses: number;
	winRate: number;
	goodGames: number;
	goodWins: number;
	goodWinRate: number;
	evilGames: number;
	evilWins: number;
	evilWinRate: number;
}

/**
 * Comprehensive player statistics
 */
export interface PlayerStatistics {
	uid: string;
	playerName: string;

	// Overall stats
	totalGames: number;
	totalWins: number;
	totalLosses: number;
	overallWinRate: number;

	// Alignment stats
	goodGames: number;
	goodWins: number;
	goodLosses: number;
	goodWinRate: number;
	evilGames: number;
	evilWins: number;
	evilLosses: number;
	evilWinRate: number;

	// Per-role stats
	roleStats: Record<RoleName, RoleStats>;

	// Loss reason breakdown
	lossReasons: {
		threeMissionFails: number;
		threeMissionSuccessEvil: number;
		fiveRejectedProposals: number;
		merlinAssassinated: number;
	};

	// Special Merlin stats
	merlinStats: {
		gamesPlayed: number;
		wins: number;
		timesAssassinated: number;
		survivedAssassination: number;
	};

	// Special Assassin stats
	assassinStats: {
		gamesPlayed: number;
		wins: number;
		successfulAssassinations: number;
		failedAssassinations: number;
	};

	// Year-by-year breakdown
	yearlyStats: YearStats[];
}

/**
 * Normalize a role string to a standard RoleName
 */
function normalizeRole(role: string | undefined): RoleName | null {
	if (!role) return null;
	const upperRole = role.toUpperCase();
	return ROLE_ALIASES[upperRole] || null;
}

/**
 * Check if a role is on the evil team
 */
function isEvilRole(role: RoleName | null): boolean {
	return role !== null && EVIL_ROLES.includes(role);
}

/**
 * Get the outcome reason from a game
 */
function getOutcomeReason(game: Game): OutcomeReason | null {
	const reason = game.outcome?.reason || game.outcome?.message;
	if (!reason) return null;

	const reasonMap: Record<string, OutcomeReason> = {
		'Three successful missions': 'Three successful missions',
		'Three failed missions': 'Three failed missions',
		'Five rejected proposals': 'Five rejected proposals',
		'Merlin assassinated': 'Merlin assassinated',
		'Failed to assassinate Merlin': 'Failed to assassinate Merlin',
	};

	return reasonMap[reason] || null;
}

/**
 * Initialize empty role stats
 */
function createEmptyRoleStats(): RoleStats {
	return {
		games: 0,
		wins: 0,
		losses: 0,
		winRate: 0,
		threeMissionFails: 0,
		threeMissionSuccesses: 0,
		fiveRejectedProposals: 0,
		merlinAssassinated: 0,
		wasAssassinated: 0,
	};
}

/**
 * Calculate comprehensive statistics for a player from their games.
 * Accepts either a single UID or an array of UIDs (for aggregating a person's multiple accounts).
 */
export function calculatePlayerStats(uidOrUids: string | string[], games: Game[]): PlayerStatistics {
	const uids = Array.isArray(uidOrUids) ? uidOrUids : [uidOrUids];
	const uidSet = new Set(uids);
	const primaryUid = uids[0];

	const findPlayerInGame = (game: Game) => game.players.find((p) => uidSet.has(p.uid));
	const playerName = games.length > 0 ? findPlayerInGame(games[0])?.name || primaryUid : primaryUid;

	const stats: PlayerStatistics = {
		uid: primaryUid,
		playerName,
		totalGames: 0,
		totalWins: 0,
		totalLosses: 0,
		overallWinRate: 0,
		goodGames: 0,
		goodWins: 0,
		goodLosses: 0,
		goodWinRate: 0,
		evilGames: 0,
		evilWins: 0,
		evilLosses: 0,
		evilWinRate: 0,
		roleStats: {
			MERLIN: createEmptyRoleStats(),
			PERCIVAL: createEmptyRoleStats(),
			'LOYAL FOLLOWER': createEmptyRoleStats(),
			MORDRED: createEmptyRoleStats(),
			MORGANA: createEmptyRoleStats(),
			OBERON: createEmptyRoleStats(),
			'EVIL MINION': createEmptyRoleStats(),
			ASSASSIN: createEmptyRoleStats(),
		},
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
		yearlyStats: [],
	};

	const yearMap = new Map<
		number,
		{
			games: number;
			wins: number;
			goodGames: number;
			goodWins: number;
			evilGames: number;
			evilWins: number;
		}
	>();

	for (const game of games) {
		if (!game.outcome) continue;

		const playerInGame = findPlayerInGame(game);
		if (!playerInGame) continue;

		const playerRole = game.outcome.roles?.find((r) => r.name === playerInGame.name);
		const normalizedRole = normalizeRole(playerRole?.role);
		const isEvil = isEvilRole(normalizedRole);
		const playerWon =
			(isEvil && game.outcome.state === 'EVIL_WIN') || (!isEvil && game.outcome.state === 'GOOD_WIN');
		const outcomeReason = getOutcomeReason(game);
		const wasAssassinated = game.outcome.assassinated === playerInGame.name;

		// Overall stats
		stats.totalGames++;
		if (playerWon) {
			stats.totalWins++;
		} else {
			stats.totalLosses++;
		}

		// Alignment stats
		if (isEvil) {
			stats.evilGames++;
			if (playerWon) {
				stats.evilWins++;
			} else {
				stats.evilLosses++;
			}
		} else {
			stats.goodGames++;
			if (playerWon) {
				stats.goodWins++;
			} else {
				stats.goodLosses++;
			}
		}

		// Role-specific stats
		if (normalizedRole) {
			const roleStats = stats.roleStats[normalizedRole];
			roleStats.games++;
			if (playerWon) {
				roleStats.wins++;
			} else {
				roleStats.losses++;
			}

			if (outcomeReason === 'Three failed missions') {
				roleStats.threeMissionFails++;
			} else if (
				outcomeReason === 'Three successful missions' ||
				outcomeReason === 'Failed to assassinate Merlin'
			) {
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

		// Loss reason breakdown (only when player lost)
		if (!playerWon) {
			if (outcomeReason === 'Three failed missions') {
				stats.lossReasons.threeMissionFails++;
			} else if (
				outcomeReason === 'Three successful missions' ||
				outcomeReason === 'Failed to assassinate Merlin'
			) {
				stats.lossReasons.threeMissionSuccessEvil++;
			} else if (outcomeReason === 'Five rejected proposals') {
				stats.lossReasons.fiveRejectedProposals++;
			} else if (outcomeReason === 'Merlin assassinated') {
				stats.lossReasons.merlinAssassinated++;
			}
		}

		// Merlin-specific stats
		if (normalizedRole === 'MERLIN') {
			stats.merlinStats.gamesPlayed++;
			if (playerWon) {
				stats.merlinStats.wins++;
				stats.merlinStats.survivedAssassination++;
			} else if (wasAssassinated) {
				stats.merlinStats.timesAssassinated++;
			}
		}

		// Assassin-specific stats
		if (normalizedRole === 'ASSASSIN') {
			stats.assassinStats.gamesPlayed++;
			if (playerWon) {
				stats.assassinStats.wins++;
			}
			if (outcomeReason === 'Merlin assassinated') {
				stats.assassinStats.successfulAssassinations++;
			} else if (outcomeReason === 'Failed to assassinate Merlin') {
				stats.assassinStats.failedAssassinations++;
			}
		}

		// Year breakdown
		const year = game.timeCreated.getFullYear();
		const yearStats = yearMap.get(year) || {
			games: 0,
			wins: 0,
			goodGames: 0,
			goodWins: 0,
			evilGames: 0,
			evilWins: 0,
		};

		yearStats.games++;
		if (playerWon) yearStats.wins++;
		if (isEvil) {
			yearStats.evilGames++;
			if (playerWon) yearStats.evilWins++;
		} else {
			yearStats.goodGames++;
			if (playerWon) yearStats.goodWins++;
		}

		yearMap.set(year, yearStats);
	}

	// Calculate win rates
	stats.overallWinRate = stats.totalGames > 0 ? (stats.totalWins / stats.totalGames) * 100 : 0;
	stats.goodWinRate = stats.goodGames > 0 ? (stats.goodWins / stats.goodGames) * 100 : 0;
	stats.evilWinRate = stats.evilGames > 0 ? (stats.evilWins / stats.evilGames) * 100 : 0;

	// Calculate role win rates
	for (const role of ALL_ROLES) {
		const roleStats = stats.roleStats[role];
		roleStats.winRate = roleStats.games > 0 ? (roleStats.wins / roleStats.games) * 100 : 0;
	}

	// Convert year map to sorted array
	stats.yearlyStats = Array.from(yearMap.entries())
		.map(([year, data]) => ({
			year,
			games: data.games,
			wins: data.wins,
			losses: data.games - data.wins,
			winRate: data.games > 0 ? (data.wins / data.games) * 100 : 0,
			goodGames: data.goodGames,
			goodWins: data.goodWins,
			goodWinRate: data.goodGames > 0 ? (data.goodWins / data.goodGames) * 100 : 0,
			evilGames: data.evilGames,
			evilWins: data.evilWins,
			evilWinRate: data.evilGames > 0 ? (data.evilWins / data.evilGames) * 100 : 0,
		}))
		.sort((a, b) => b.year - a.year);

	return stats;
}
