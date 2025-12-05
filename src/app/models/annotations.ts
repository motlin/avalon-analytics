/**
 * 🎯 Game Annotation System
 *
 * TypeScript port of the avalon-log-scraper Java annotation predicates.
 * Provides analysis of game events to highlight noteworthy plays.
 */

import type {Game, Mission, Player, Proposal} from './game';

// ============================================================================
// 🔧 Utility Functions
// ============================================================================

/**
 * Converts a string to title case (e.g., "EVIL MINION" -> "Evil Minion")
 */
function toTitleCase(text: string): string {
	return text
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

// ============================================================================
// 🎭 Role Definitions
// ============================================================================

export type RoleType =
	| 'Merlin'
	| 'Percival'
	| 'Loyal'
	| 'Loyal Follower'
	| 'Morgana'
	| 'Assassin'
	| 'Oberon'
	| 'Mordred'
	| 'Evil'
	| 'Evil Minion'
	| 'Unknown';

export const ROLE_EMOJI: Record<string, string> = {
	merlin: '🧙',
	percival: '🧔',
	loyal: '😇',
	'loyal follower': '😇',
	good: '😇',
	morgana: '😈',
	assassin: '😈',
	oberon: '😈',
	mordred: '😈',
	evil: '😈',
	'evil minion': '😈',
	'minion of mordred': '😈',
	unknown: '❓',
};

export function getRoleEmoji(role: string | undefined): string {
	if (!role) return ROLE_EMOJI.unknown;
	return ROLE_EMOJI[role.toLowerCase()] ?? ROLE_EMOJI.unknown;
}

export function isEvilRole(role: string | undefined): boolean {
	if (!role) return false;
	const evilRoles = ['morgana', 'assassin', 'oberon', 'mordred', 'evil', 'evil minion', 'minion of mordred'];
	return evilRoles.includes(role.toLowerCase());
}

export function isGoodRole(role: string | undefined): boolean {
	if (!role) return false;
	const goodRoles = ['merlin', 'percival', 'loyal', 'loyal follower', 'good'];
	return goodRoles.includes(role.toLowerCase());
}

export function isKnownEvil(role: string | undefined): boolean {
	if (!role) return false;
	// Oberon is evil but not known to other evil players
	const knownEvilRoles = ['morgana', 'assassin', 'mordred', 'evil', 'evil minion', 'minion of mordred'];
	return knownEvilRoles.includes(role.toLowerCase());
}

export function isSeenEvil(role: string | undefined): boolean {
	if (!role) return false;
	// Mordred is not seen by Merlin
	const seenEvilRoles = ['morgana', 'assassin', 'oberon', 'evil', 'evil minion', 'minion of mordred'];
	return seenEvilRoles.includes(role.toLowerCase());
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
	const role = context.rolesByName.get(playerName);
	return role ? toTitleCase(role) : undefined;
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
	commentary: string;
	playerName: string;
	playerRole?: string;
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
