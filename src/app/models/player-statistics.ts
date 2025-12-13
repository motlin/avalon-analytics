import {
	db,
	type PlayerStats as DbPlayerStats,
	type PlayerRoleStats as DbPlayerRoleStats,
	type PlayerYearlyStats as DbPlayerYearlyStats,
	type PlayerLossReasons as DbPlayerLossReasons,
	type PlayerMerlinStats as DbPlayerMerlinStats,
	type PlayerAssassinStats as DbPlayerAssassinStats,
	type PersonStats as DbPersonStats,
	type PersonRoleStats as DbPersonRoleStats,
	type PersonYearlyStats as DbPersonYearlyStats,
	type PersonLossReasons as DbPersonLossReasons,
	type PersonMerlinStats as DbPersonMerlinStats,
	type PersonAssassinStats as DbPersonAssassinStats,
} from '@/db';

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
 * All role names in display order
 */
export const ALL_ROLES: RoleName[] = [
	'MERLIN',
	'PERCIVAL',
	'LOYAL FOLLOWER',
	'MORDRED',
	'MORGANA',
	'OBERON',
	'EVIL MINION',
	'ASSASSIN',
];

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
 * Comprehensive statistics for a person (aggregated across all their UIDs)
 */
export interface PersonStatistics {
	primaryUid: string;
	personName: string;

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
 * Full PlayerStats record with all related tables included
 */
type PlayerStatsWithRelations = DbPlayerStats & {
	roleStats: DbPlayerRoleStats[];
	yearlyStats: DbPlayerYearlyStats[];
	lossReasons: DbPlayerLossReasons | null;
	merlinStats: DbPlayerMerlinStats | null;
	assassinStats: DbPlayerAssassinStats | null;
};

/**
 * Full PersonStats record with all related tables included
 */
type PersonStatsWithRelations = DbPersonStats & {
	roleStats: DbPersonRoleStats[];
	yearlyStats: DbPersonYearlyStats[];
	lossReasons: DbPersonLossReasons | null;
	merlinStats: DbPersonMerlinStats | null;
	assassinStats: DbPersonAssassinStats | null;
};

/**
 * Transform database PlayerStats to PersonStatistics interface
 */
function transformDbStatsToPersonStatistics(
	dbStats: PlayerStatsWithRelations | PersonStatsWithRelations,
	primaryId: string,
): PersonStatistics {
	const totalGames = dbStats.gamesPlayed;
	const totalWins = dbStats.wins;
	const totalLosses = totalGames - totalWins;
	const goodLosses = dbStats.goodGames - dbStats.goodWins;
	const evilLosses = dbStats.evilGames - dbStats.evilWins;

	const roleStats: Record<RoleName, RoleStats> = {
		MERLIN: createEmptyRoleStats(),
		PERCIVAL: createEmptyRoleStats(),
		'LOYAL FOLLOWER': createEmptyRoleStats(),
		MORDRED: createEmptyRoleStats(),
		MORGANA: createEmptyRoleStats(),
		OBERON: createEmptyRoleStats(),
		'EVIL MINION': createEmptyRoleStats(),
		ASSASSIN: createEmptyRoleStats(),
	};

	for (const rs of dbStats.roleStats) {
		const roleName = rs.role as RoleName;
		if (roleName in roleStats) {
			roleStats[roleName] = {
				games: rs.games,
				wins: rs.wins,
				losses: rs.losses,
				winRate: rs.games > 0 ? (rs.wins / rs.games) * 100 : 0,
				threeMissionFails: rs.threeMissionFails,
				threeMissionSuccesses: rs.threeMissionSuccesses,
				fiveRejectedProposals: rs.fiveRejectedProposals,
				merlinAssassinated: rs.merlinAssassinated,
				wasAssassinated: rs.wasAssassinated,
			};
		}
	}

	const yearlyStats: YearStats[] = dbStats.yearlyStats
		.map((ys) => ({
			year: ys.year,
			games: ys.games,
			wins: ys.wins,
			losses: ys.games - ys.wins,
			winRate: ys.games > 0 ? (ys.wins / ys.games) * 100 : 0,
			goodGames: ys.goodGames,
			goodWins: ys.goodWins,
			goodWinRate: ys.goodGames > 0 ? (ys.goodWins / ys.goodGames) * 100 : 0,
			evilGames: ys.evilGames,
			evilWins: ys.evilWins,
			evilWinRate: ys.evilGames > 0 ? (ys.evilWins / ys.evilGames) * 100 : 0,
		}))
		.sort((a, b) => b.year - a.year);

	return {
		primaryUid: primaryId,
		personName: 'name' in dbStats ? dbStats.name : primaryId,
		totalGames,
		totalWins,
		totalLosses,
		overallWinRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0,
		goodGames: dbStats.goodGames,
		goodWins: dbStats.goodWins,
		goodLosses,
		goodWinRate: dbStats.goodGames > 0 ? (dbStats.goodWins / dbStats.goodGames) * 100 : 0,
		evilGames: dbStats.evilGames,
		evilWins: dbStats.evilWins,
		evilLosses,
		evilWinRate: dbStats.evilGames > 0 ? (dbStats.evilWins / dbStats.evilGames) * 100 : 0,
		roleStats,
		lossReasons: {
			threeMissionFails: dbStats.lossReasons?.threeMissionFails ?? 0,
			threeMissionSuccessEvil: dbStats.lossReasons?.threeMissionSuccessEvil ?? 0,
			fiveRejectedProposals: dbStats.lossReasons?.fiveRejectedProposals ?? 0,
			merlinAssassinated: dbStats.lossReasons?.merlinAssassinated ?? 0,
		},
		merlinStats: {
			gamesPlayed: dbStats.merlinStats?.gamesPlayed ?? 0,
			wins: dbStats.merlinStats?.wins ?? 0,
			timesAssassinated: dbStats.merlinStats?.timesAssassinated ?? 0,
			survivedAssassination: dbStats.merlinStats?.survivedAssassination ?? 0,
		},
		assassinStats: {
			gamesPlayed: dbStats.assassinStats?.gamesPlayed ?? 0,
			wins: dbStats.assassinStats?.wins ?? 0,
			successfulAssassinations: dbStats.assassinStats?.successfulAssassinations ?? 0,
			failedAssassinations: dbStats.assassinStats?.failedAssassinations ?? 0,
		},
		yearlyStats,
	};
}

/**
 * Load pre-computed statistics for a single UID from the database
 */
export async function loadPlayerStatsFromDb(uid: string): Promise<PersonStatistics | null> {
	const dbStats = await db.playerStats.findUnique({
		where: {uid},
		include: {
			roleStats: true,
			yearlyStats: true,
			lossReasons: true,
			merlinStats: true,
			assassinStats: true,
		},
	});

	if (!dbStats) {
		return null;
	}

	return transformDbStatsToPersonStatistics(dbStats, uid);
}

/**
 * Load pre-computed statistics for a person from the database
 */
export async function loadPersonStatsFromDb(personId: string): Promise<PersonStatistics | null> {
	const dbStats = await db.personStats.findUnique({
		where: {personId},
		include: {
			roleStats: true,
			yearlyStats: true,
			lossReasons: true,
			merlinStats: true,
			assassinStats: true,
		},
	});

	if (!dbStats) {
		return null;
	}

	return transformDbStatsToPersonStatistics(dbStats, personId);
}
