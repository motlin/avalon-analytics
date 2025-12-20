/**
 * Unit tests for predicate evaluation with opportunity tracking
 */

import {describe, expect, it} from 'vitest';
import type {Game, Mission} from './game';
import type {PredicateEvaluationResult} from './predicateEvaluator';
import {aggregateResultsByPlayerAndPredicate, evaluateGamePredicates, getAllResults} from './predicateEvaluator';

// ============================================================================
// Test Fixtures
// ============================================================================

function createTestGame(options: {
	players: Array<{uid: string; name: string; role?: string}>;
	missions?: Mission[];
	outcomeRoles?: Array<{name: string; role: string; assassin: boolean}>;
	outcomeState?: string;
	outcomeVotes?: Record<string, boolean>[];
}): Game {
	const defaultMission: Mission = {
		failsRequired: 1,
		teamSize: 2,
		proposals: [
			{
				proposer: options.players[0]?.name ?? 'Player1',
				team: [options.players[0]?.name ?? 'Player1', options.players[1]?.name ?? 'Player2'],
				votes: [options.players[0]?.name ?? 'Player1', options.players[1]?.name ?? 'Player2'],
				state: 'APPROVED',
			},
		],
		state: 'SUCCESS',
		team: [options.players[0]?.name ?? 'Player1', options.players[1]?.name ?? 'Player2'],
	};

	return {
		id: 'test-game-id',
		timeCreated: new Date('2025-01-01T12:00:00Z'),
		timeFinished: new Date('2025-01-01T12:30:00Z'),
		players: options.players,
		missions: options.missions ?? [defaultMission],
		outcome: {
			state: options.outcomeState ?? 'GOOD_WIN',
			assassinated: undefined,
			roles: options.outcomeRoles,
			votes: options.outcomeVotes,
		},
	};
}

// ============================================================================
// Alignment Detection
// ============================================================================

describe('alignment detection', () => {
	it('detects good alignment for MERLIN role', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
		});

		const results = evaluateGamePredicates(game);
		const aliceResults = results.proposalResults.filter((r) => r.playerName === 'Alice');
		expect(aliceResults.length).toBeGreaterThan(0);
		expect(aliceResults.every((r) => r.alignment === 'good')).toBe(true);
	});

	it('detects good alignment for PERCIVAL role', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'PERCIVAL'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
		});

		const results = evaluateGamePredicates(game);
		const aliceResults = results.proposalResults.filter((r) => r.playerName === 'Alice');
		expect(aliceResults.length).toBeGreaterThan(0);
		expect(aliceResults.every((r) => r.alignment === 'good')).toBe(true);
	});

	it('detects good alignment for LOYAL FOLLOWER role', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'LOYAL FOLLOWER'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
		});

		const results = evaluateGamePredicates(game);
		const aliceResults = results.proposalResults.filter((r) => r.playerName === 'Alice');
		expect(aliceResults.length).toBeGreaterThan(0);
		expect(aliceResults.every((r) => r.alignment === 'good')).toBe(true);
	});

	it('detects evil alignment for Assassin role', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
		});

		const results = evaluateGamePredicates(game);
		// Bob votes but doesn't propose in default game, check vote results
		const bobResults = results.proposalVoteResults.filter((r) => r.playerName === 'Bob');
		expect(bobResults.length).toBeGreaterThan(0);
		expect(bobResults.every((r) => r.alignment === 'evil')).toBe(true);
	});

	it('detects evil alignment for MORGANA role', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'MORGANA'},
			],
		});

		const results = evaluateGamePredicates(game);
		// Bob votes but doesn't propose in default game, check vote results
		const bobResults = results.proposalVoteResults.filter((r) => r.playerName === 'Bob');
		expect(bobResults.length).toBeGreaterThan(0);
		expect(bobResults.every((r) => r.alignment === 'evil')).toBe(true);
	});

	it('detects evil alignment for Mordred role', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'MORDRED'},
			],
		});

		const results = evaluateGamePredicates(game);
		// Bob votes but doesn't propose in default game, check vote results
		const bobResults = results.proposalVoteResults.filter((r) => r.playerName === 'Bob');
		expect(bobResults.length).toBeGreaterThan(0);
		expect(bobResults.every((r) => r.alignment === 'evil')).toBe(true);
	});

	it('detects evil alignment for OBERON role', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'OBERON'},
			],
		});

		const results = evaluateGamePredicates(game);
		// Bob votes but doesn't propose in default game, check vote results
		const bobResults = results.proposalVoteResults.filter((r) => r.playerName === 'Bob');
		expect(bobResults.length).toBeGreaterThan(0);
		expect(bobResults.every((r) => r.alignment === 'evil')).toBe(true);
	});

	it('detects unknown alignment when role is not set', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice'},
				{uid: 'u2', name: 'Bob'},
			],
		});

		const results = evaluateGamePredicates(game);
		const allResults = getAllResults(results);
		expect(allResults.every((r) => r.alignment === 'unknown')).toBe(true);
	});

	it('uses outcome roles when player roles are not set', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice'},
				{uid: 'u2', name: 'Bob'},
			],
			outcomeRoles: [
				{name: 'Alice', role: 'MERLIN', assassin: false},
				{name: 'Bob', role: 'MORGANA', assassin: false},
			],
		});

		const results = evaluateGamePredicates(game);
		const aliceResults = results.proposalResults.filter((r) => r.playerName === 'Alice');
		const bobResults = results.proposalResults.filter((r) => r.playerName === 'Bob');

		expect(aliceResults.every((r) => r.alignment === 'good')).toBe(true);
		expect(bobResults.every((r) => r.alignment === 'evil')).toBe(true);
	});
});

// ============================================================================
// Opportunity Tracking (isRelevant counting)
// ============================================================================

describe('opportunity tracking', () => {
	it('counts isRelevant=true as opportunity even when isWeird=false', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
		});

		const results = evaluateGamePredicates(game);
		const allResults = getAllResults(results);

		// Verify both cases exist: relevant but not fired, and relevant and fired
		// This proves opportunities are counted when isWeird or isWorthCommentary is false
		expect(allResults.some((r) => r.isRelevant && !r.fired)).toBe(true);
		expect(allResults.some((r) => r.isRelevant && r.fired)).toBe(true);

		// The key assertion: isRelevant counts independently from fired
		const summaries = aggregateResultsByPlayerAndPredicate(allResults);
		for (const summary of summaries.values()) {
			// Fires should never exceed opportunities
			expect(summary.fires).toBeLessThanOrEqual(summary.opportunities);
		}
	});

	it('increments opportunities for each relevant proposal', () => {
		const mission: Mission = {
			failsRequired: 1,
			teamSize: 2,
			proposals: [
				{
					proposer: 'Alice',
					team: ['Alice', 'Bob'],
					votes: ['Alice', 'Bob'],
					state: 'REJECTED',
				},
				{
					proposer: 'Bob',
					team: ['Alice', 'Bob'],
					votes: ['Alice', 'Bob'],
					state: 'APPROVED',
				},
			],
			state: 'SUCCESS',
			team: ['Alice', 'Bob'],
		};

		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
			missions: [mission],
		});

		const results = evaluateGamePredicates(game);
		const summaries = aggregateResultsByPlayerAndPredicate(results.proposalResults);

		// Alice proposed once, Bob proposed once
		const aliceProposal = Array.from(summaries.values()).filter((s) => s.playerName === 'Alice');
		const bobProposal = Array.from(summaries.values()).filter((s) => s.playerName === 'Bob');

		// Each proposer should have entries for each predicate they triggered
		expect(aliceProposal.length).toBeGreaterThan(0);
		expect(bobProposal.length).toBeGreaterThan(0);
	});

	it('counts vote opportunities per voter per proposal', () => {
		const mission: Mission = {
			failsRequired: 1,
			teamSize: 2,
			proposals: [
				{
					proposer: 'Alice',
					team: ['Alice', 'Bob'],
					votes: ['Alice'],
					state: 'REJECTED',
				},
				{
					proposer: 'Bob',
					team: ['Alice', 'Bob'],
					votes: ['Alice', 'Bob'],
					state: 'APPROVED',
				},
			],
			state: 'SUCCESS',
			team: ['Alice', 'Bob'],
		};

		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
			missions: [mission],
		});

		const results = evaluateGamePredicates(game);

		// Each player should have vote results for each proposal
		const aliceVoteResults = results.proposalVoteResults.filter((r) => r.playerName === 'Alice');
		const bobVoteResults = results.proposalVoteResults.filter((r) => r.playerName === 'Bob');

		// With 2 proposals and 29 vote predicates each, we expect results for both players
		expect(aliceVoteResults.length).toBeGreaterThan(0);
		expect(bobVoteResults.length).toBeGreaterThan(0);
	});
});

// ============================================================================
// Fired Condition (all three must be true)
// ============================================================================

describe('fired condition', () => {
	it('sets fired=false when isRelevant=false', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
		});

		const results = evaluateGamePredicates(game);
		const allResults = getAllResults(results);

		// When isRelevant is false, fired must also be false
		const irrelevantResults = allResults.filter((r) => !r.isRelevant);
		expect(irrelevantResults.every((r) => r.fired === false)).toBe(true);
	});

	it('can have fired=false even when isRelevant=true', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
		});

		const results = evaluateGamePredicates(game);
		const allResults = getAllResults(results);

		// There should be some predicates that are relevant but didn't fire
		// (because isWeird or isWorthCommentary returned false)
		const relevantButNotFired = allResults.filter((r) => r.isRelevant && !r.fired);
		expect(relevantButNotFired.length).toBeGreaterThan(0);
	});

	it('tracks predicate name correctly', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
		});

		const results = evaluateGamePredicates(game);

		// Check that predicate names are populated
		for (const result of results.proposalResults) {
			expect(result.predicateName).toBeTruthy();
			expect(typeof result.predicateName).toBe('string');
		}

		for (const result of results.proposalVoteResults) {
			expect(result.predicateName).toBeTruthy();
			expect(typeof result.predicateName).toBe('string');
		}

		for (const result of results.missionVoteResults) {
			expect(result.predicateName).toBeTruthy();
			expect(typeof result.predicateName).toBe('string');
		}
	});
});

// ============================================================================
// Aggregation Functions
// ============================================================================

describe('aggregateResultsByPlayerAndPredicate', () => {
	it('aggregates results correctly by player and predicate', () => {
		const results: PredicateEvaluationResult[] = [
			{
				predicateName: 'TestPredicate',
				playerName: 'Alice',
				playerRole: 'MERLIN',
				alignment: 'good',
				isRelevant: true,
				fired: true,
			},
			{
				predicateName: 'TestPredicate',
				playerName: 'Alice',
				playerRole: 'MERLIN',
				alignment: 'good',
				isRelevant: true,
				fired: false,
			},
			{
				predicateName: 'TestPredicate',
				playerName: 'Alice',
				playerRole: 'MERLIN',
				alignment: 'good',
				isRelevant: false,
				fired: false,
			},
		];

		const summaries = aggregateResultsByPlayerAndPredicate(results);
		const aliceSummary = summaries.get('Alice:TestPredicate');

		expect(aliceSummary).toBeDefined();
		expect(aliceSummary?.opportunities).toBe(2);
		expect(aliceSummary?.fires).toBe(1);
	});

	it('creates separate entries for different predicates', () => {
		const results: PredicateEvaluationResult[] = [
			{
				predicateName: 'Predicate1',
				playerName: 'Alice',
				playerRole: 'MERLIN',
				alignment: 'good',
				isRelevant: true,
				fired: true,
			},
			{
				predicateName: 'Predicate2',
				playerName: 'Alice',
				playerRole: 'MERLIN',
				alignment: 'good',
				isRelevant: true,
				fired: false,
			},
		];

		const summaries = aggregateResultsByPlayerAndPredicate(results);

		expect(summaries.get('Alice:Predicate1')?.opportunities).toBe(1);
		expect(summaries.get('Alice:Predicate1')?.fires).toBe(1);
		expect(summaries.get('Alice:Predicate2')?.opportunities).toBe(1);
		expect(summaries.get('Alice:Predicate2')?.fires).toBe(0);
	});

	it('creates separate entries for different players', () => {
		const results: PredicateEvaluationResult[] = [
			{
				predicateName: 'TestPredicate',
				playerName: 'Alice',
				playerRole: 'MERLIN',
				alignment: 'good',
				isRelevant: true,
				fired: true,
			},
			{
				predicateName: 'TestPredicate',
				playerName: 'Bob',
				playerRole: 'ASSASSIN',
				alignment: 'evil',
				isRelevant: true,
				fired: false,
			},
		];

		const summaries = aggregateResultsByPlayerAndPredicate(results);

		expect(summaries.get('Alice:TestPredicate')?.fires).toBe(1);
		expect(summaries.get('Bob:TestPredicate')?.fires).toBe(0);
		expect(summaries.get('Alice:TestPredicate')?.alignment).toBe('good');
		expect(summaries.get('Bob:TestPredicate')?.alignment).toBe('evil');
	});
});

// ============================================================================
// getAllResults
// ============================================================================

describe('getAllResults', () => {
	it('combines all result types into a single array', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
			outcomeVotes: [{Alice: true, Bob: false}],
		});

		const results = evaluateGamePredicates(game);
		const allResults = getAllResults(results);

		const expectedCount =
			results.proposalResults.length + results.proposalVoteResults.length + results.missionVoteResults.length;
		expect(allResults.length).toBe(expectedCount);
	});
});

// ============================================================================
// Mission Vote Evaluation
// ============================================================================

describe('mission vote evaluation', () => {
	it('evaluates mission votes when outcome votes are present', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
			outcomeVotes: [{Alice: true, Bob: false}],
		});

		const results = evaluateGamePredicates(game);

		expect(results.missionVoteResults.length).toBeGreaterThan(0);

		// Check that both players have mission vote results
		const aliceMissionVotes = results.missionVoteResults.filter((r) => r.playerName === 'Alice');
		const bobMissionVotes = results.missionVoteResults.filter((r) => r.playerName === 'Bob');

		expect(aliceMissionVotes.length).toBeGreaterThan(0);
		expect(bobMissionVotes.length).toBeGreaterThan(0);
	});

	it('skips mission vote evaluation when outcome votes are not present', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
			// No outcomeVotes
		});

		const results = evaluateGamePredicates(game);
		expect(results.missionVoteResults.length).toBe(0);
	});
});

// ============================================================================
// Player Role in Results
// ============================================================================

describe('player role tracking', () => {
	it('includes player role in evaluation results', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice', role: 'MERLIN'},
				{uid: 'u2', name: 'Bob', role: 'ASSASSIN'},
			],
		});

		const results = evaluateGamePredicates(game);

		const aliceResults = results.proposalResults.filter((r) => r.playerName === 'Alice');
		expect(aliceResults.every((r) => r.playerRole === 'MERLIN')).toBe(true);

		const bobVoteResults = results.proposalVoteResults.filter((r) => r.playerName === 'Bob');
		expect(bobVoteResults.every((r) => r.playerRole === 'ASSASSIN')).toBe(true);
	});

	it('sets playerRole to undefined when role is unknown', () => {
		const game = createTestGame({
			players: [
				{uid: 'u1', name: 'Alice'},
				{uid: 'u2', name: 'Bob'},
			],
		});

		const results = evaluateGamePredicates(game);
		const allResults = getAllResults(results);

		expect(allResults.every((r) => r.playerRole === undefined)).toBe(true);
	});
});
