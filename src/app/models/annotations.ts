/**
 * 🎯 Game Annotation System
 *
 * TypeScript port of the avalon-log-scraper Java annotation predicates.
 * Provides analysis of game events to highlight noteworthy plays.
 */

import type {Game, Mission, Player, Proposal} from './game';
import type {Rarity} from './predicateRarity';

// ============================================================================
// 🔧 Utility Functions
// ============================================================================

/** Map database role names to display format (title case with friendly names) */
const DB_ROLE_TO_DISPLAY: Record<string, string> = {
	MERLIN: 'Merlin',
	PERCIVAL: 'Percival',
	'LOYAL FOLLOWER': 'Loyal Servant',
	ASSASSIN: 'Assassin',
	MORGANA: 'Morgana',
	MORDRED: 'Mordred',
	OBERON: 'Oberon',
	'EVIL MINION': 'Minion',
};

/** Convert database role name to display format for rendering */
export function toDisplayRole(dbRole: string | undefined): string {
	if (!dbRole) return 'Unknown';
	return DB_ROLE_TO_DISPLAY[dbRole] ?? dbRole;
}

// ============================================================================
// 🎭 Role Definitions
// ============================================================================

/** Database role format type - uppercase as stored in DB */
export type RoleType =
	| 'MERLIN'
	| 'PERCIVAL'
	| 'LOYAL FOLLOWER'
	| 'MORGANA'
	| 'ASSASSIN'
	| 'OBERON'
	| 'MORDRED'
	| 'EVIL MINION';

/** Role emoji lookup - uses uppercase keys to match database format */
const ROLE_EMOJI: Record<string, string> = {
	MERLIN: '🧙',
	PERCIVAL: '🧔',
	'LOYAL FOLLOWER': '😇',
	MORGANA: '😈',
	ASSASSIN: '😈',
	OBERON: '😈',
	MORDRED: '😈',
	'EVIL MINION': '😈',
};

const UNKNOWN_EMOJI = '❓';

export function getRoleEmoji(role: string | undefined): string {
	if (!role) return UNKNOWN_EMOJI;
	return ROLE_EMOJI[role] ?? UNKNOWN_EMOJI;
}

const EVIL_ROLES = new Set(['MORGANA', 'ASSASSIN', 'OBERON', 'MORDRED', 'EVIL MINION']);
const GOOD_ROLES = new Set(['MERLIN', 'PERCIVAL', 'LOYAL FOLLOWER']);
const KNOWN_EVIL_ROLES = new Set(['MORGANA', 'ASSASSIN', 'MORDRED', 'EVIL MINION']); // Oberon excluded
const SEEN_EVIL_ROLES = new Set(['MORGANA', 'ASSASSIN', 'OBERON', 'EVIL MINION']); // Mordred excluded

export function isEvilRole(role: string | undefined): boolean {
	return role !== undefined && EVIL_ROLES.has(role);
}

export function isGoodRole(role: string | undefined): boolean {
	return role !== undefined && GOOD_ROLES.has(role);
}

export function isKnownEvil(role: string | undefined): boolean {
	// Oberon is evil but not known to other evil players
	return role !== undefined && KNOWN_EVIL_ROLES.has(role);
}

export function isSeenEvil(role: string | undefined): boolean {
	// Mordred is not seen by Merlin
	return role !== undefined && SEEN_EVIL_ROLES.has(role);
}

// ============================================================================
// 📊 Game Context - Enriched game data for analysis
// ============================================================================

export interface GameContext {
	game: Game;
	playersByName: Map<string, Player>;
	rolesByName: Map<string, string>;
}

export interface MissionContext extends GameContext {
	mission: Mission;
	missionNumber: number;
}

export interface ProposalContext extends MissionContext {
	proposal: Proposal;
	proposalNumber: number;
}

export interface ProposalVoteContext extends ProposalContext {
	voterName: string;
	votedYes: boolean;
}

export interface MissionVoteContext extends MissionContext {
	voterName: string;
	votedSuccess: boolean;
}

export function createGameContext(game: Game): GameContext {
	const playersByName = new Map<string, Player>();
	const rolesByName = new Map<string, string>();

	for (const player of game.players) {
		playersByName.set(player.name, player);
		if (player.role) {
			rolesByName.set(player.name, player.role);
		}
	}

	// Also check outcome roles if available
	if (game.outcome?.roles) {
		for (const role of game.outcome.roles) {
			// If this player was the assassin, display "Assassin" instead of their base role
			const displayRole = role.assassin ? 'Assassin' : role.role;
			rolesByName.set(role.name, displayRole);
		}
	}

	return {game, playersByName, rolesByName};
}

export function getPlayerRole(context: GameContext, playerName: string): string | undefined {
	return context.rolesByName.get(playerName);
}

export function getLeaderRole(context: ProposalContext): string | undefined {
	return getPlayerRole(context, context.proposal.proposer);
}

// ============================================================================
// 🔍 Helper Functions for Analysis
// ============================================================================

export function getTeamRoles(context: ProposalContext): string[] {
	return context.proposal.team.map((name) => getPlayerRole(context, name) ?? 'Unknown');
}

export function isAllGoodTeam(context: ProposalContext): boolean {
	return context.proposal.team.every((name) => {
		const role = getPlayerRole(context, name);
		return isGoodRole(role);
	});
}

export function teamIncludesRole(context: ProposalContext, targetRole: string): boolean {
	return context.proposal.team.some((name) => {
		const role = getPlayerRole(context, name);
		return role === targetRole;
	});
}

export function gameIncludesRole(context: GameContext, targetRole: string): boolean {
	for (const role of context.rolesByName.values()) {
		if (role.toLowerCase() === targetRole.toLowerCase()) {
			return true;
		}
	}
	return false;
}

export function countEvilOnTeam(context: ProposalContext): number {
	return context.proposal.team.filter((name) => {
		const role = getPlayerRole(context, name);
		return isEvilRole(role);
	}).length;
}

export function countSeenEvilOnTeam(context: ProposalContext): number {
	return context.proposal.team.filter((name) => {
		const role = getPlayerRole(context, name);
		return isSeenEvil(role);
	}).length;
}

export function isHammer(context: ProposalContext): boolean {
	return context.proposalNumber === 5;
}

export function teamIncludesPlayer(context: ProposalContext, playerName: string): boolean {
	return context.proposal.team.includes(playerName);
}

export function getSuccessfulMissionCount(context: GameContext): number {
	return context.game.missions.filter((m) => m.state === 'SUCCESS').length;
}

export function getFailedMissionCount(context: GameContext): number {
	return context.game.missions.filter((m) => m.state === 'FAIL').length;
}

export function alreadySucceededTwo(context: MissionContext): boolean {
	const previousMissions = context.game.missions.slice(0, context.missionNumber);
	return previousMissions.filter((m) => m.state === 'SUCCESS').length >= 2;
}

export function alreadyFailedTwo(context: MissionContext): boolean {
	const previousMissions = context.game.missions.slice(0, context.missionNumber);
	return previousMissions.filter((m) => m.state === 'FAIL').length >= 2;
}

export function getMaxTeamSize(game: Game): number {
	return Math.max(...game.missions.map((m) => m.teamSize));
}

/**
 * Gets the hammer player (5th leader in rotation) for a given mission.
 * The hammer is the player who will be leader on proposal 5.
 * This is constant for all proposals within a mission.
 */
export function getHammerPlayer(context: ProposalContext): string | null {
	const playerNames = context.game.players.map((p) => p.name);
	const firstProposal = context.mission.proposals[0];
	const firstLeaderIndex = playerNames.indexOf(firstProposal.proposer);
	if (firstLeaderIndex === -1) return null;

	// Hammer is 4 positions ahead of the first leader (who would be leader on proposal 5)
	const hammerIndex = (firstLeaderIndex + 4) % playerNames.length;
	return playerNames[hammerIndex];
}

// ============================================================================
// 📝 Annotation Types
// ============================================================================

export interface Annotation {
	type: 'proposal' | 'proposalVote' | 'missionVote';
	predicateName: string;
	rarity: Rarity;
	commentary: string;
	playerName: string;
	playerRole?: string;
	/** Hidden annotations are tracked for stats but not rendered in the UI */
	hidden?: boolean;
}

export interface AnnotatedProposal {
	missionNumber: number;
	proposalNumber: number;
	proposal: Proposal;
	proposerRole?: string;
	annotations: Annotation[];
	playerRows: AnnotatedPlayerRow[];
}

export interface AnnotatedPlayerRow {
	playerName: string;
	playerRole?: string;
	isLeader: boolean;
	isHammer: boolean;
	isOnTeam: boolean;
	votedYes: boolean;
	voteAnnotations: Annotation[];
}

export interface AnnotatedMission {
	missionNumber: number;
	mission: Mission;
	state: 'SUCCESS' | 'FAIL' | 'PENDING';
	failCount: number;
	proposals: AnnotatedProposal[];
	missionVoteAnnotations: Annotation[];
}

export interface AnnotatedGame {
	game: Game;
	missions: AnnotatedMission[];
}
