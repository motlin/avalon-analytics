import type {Meta, StoryObj} from '@storybook/react-vite';
import Achievements from './Achievements';

const meta: Meta<typeof Achievements> = {
	title: 'Game/Display/Achievements',
	component: Achievements,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
The Achievements component displays special badges earned during gameplay. These badges recognize exceptional performance, strategic play, and memorable moments in Avalon games.

### Badge Types

- **Clean Sweep** 🧹 - Win all missions (Good: 3-0, Evil: 3 fails)
- **Trusting Bunch** 🤝 - All proposals approved on first attempt
- **Taking a Bullet** 🛡️ - Percival assassinated instead of Merlin
- **Trust You Guys** 🎭 - Non-proposer suggests their team
- **Perfect Coordination** 🎯 - Evil team wins with exactly required fails
- **Reversal of Fortune** 🔄 - Comeback victory (down 0-2, win 3-2)
- **Merlin Betrayal** 🗡️ - Merlin rejects own team or fails mission

### Usage

Achievements are calculated automatically based on game outcome and mission history. The component analyzes voting patterns, mission results, and role assignments to determine which badges players have earned.
        `,
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockRoleMap = {
	MERLIN: {name: 'MERLIN', team: 'good' as const, description: 'Sees evil'},
	PERCIVAL: {name: 'PERCIVAL', team: 'good' as const, description: 'Sees Merlin'},
	'LOYAL FOLLOWER': {name: 'LOYAL FOLLOWER', team: 'good' as const, description: 'Loyal servant'},
	MORGANA: {name: 'MORGANA', team: 'evil' as const, description: 'Appears as Merlin'},
	ASSASSIN: {name: 'ASSASSIN', team: 'evil' as const, description: 'Can assassinate Merlin'},
	MORDRED: {name: 'MORDRED', team: 'evil' as const, description: 'Hidden from Merlin'},
	OBERON: {name: 'OBERON', team: 'evil' as const, description: 'Unknown to evil'},
	'EVIL MINION': {name: 'EVIL MINION', team: 'evil' as const, description: 'Evil servant'},
};

const createMission = (
	state: 'SUCCESS' | 'FAIL' | 'PENDING',
	team: string[],
	numFails = 0,
	failsRequired = 1,
	teamSize?: number,
	evilOnTeam: string[] = [],
) => {
	return {
		state,
		team,
		numFails,
		failsRequired,
		teamSize: teamSize || team.length,
		evilOnTeam,
		proposals: [
			{
				proposer: team[0],
				team,
				state: 'APPROVED' as const,
				votes: team,
			},
		],
	};
};

const createAvalonData = (game: any) => ({
	game,
	user: {name: 'CRAIGM'},
	lobby: {game},
	config: {roleMap: mockRoleMap},
});

export const NoBadges: Story = {
	args: {
		avalon: createAvalonData({
			id: 'game-1',
			timeCreated: new Date('2024-01-01'),
			players: [
				{uid: '1', name: 'CRAIGM'},
				{uid: '2', name: 'ZEHUA'},
				{uid: '3', name: 'VINAY'},
				{uid: '4', name: 'LUKEE'},
				{uid: '5', name: 'KEN'},
			],
			missions: [],
			outcome: {
				state: 'CANCELED',
				roles: [],
			},
		}),
	},
};

export const CleanSweepGood: Story = {
	args: {
		avalon: createAvalonData({
			id: 'game-2',
			timeCreated: new Date('2024-01-01'),
			players: [
				{uid: '1', name: 'CRAIGM'},
				{uid: '2', name: 'ZEHUA'},
				{uid: '3', name: 'VINAY'},
				{uid: '4', name: 'LUKEE'},
				{uid: '5', name: 'KEN'},
			],
			missions: [
				{
					state: 'SUCCESS' as const,
					team: ['CRAIGM', 'ZEHUA'],
					numFails: 0,
					failsRequired: 1,
					teamSize: 2,
					evilOnTeam: [],
					proposals: [
						{
							proposer: 'CRAIGM',
							team: ['CRAIGM', 'LUKEE'],
							state: 'REJECTED' as const,
							votes: ['CRAIGM', 'LUKEE'],
						},
						{
							proposer: 'ZEHUA',
							team: ['CRAIGM', 'ZEHUA'],
							state: 'APPROVED' as const,
							votes: ['CRAIGM', 'ZEHUA', 'VINAY'],
						},
					],
				},
				createMission('SUCCESS', ['VINAY', 'ZEHUA'], 0, 1, 2),
				createMission('SUCCESS', ['CRAIGM', 'VINAY', 'ZEHUA'], 0, 1, 3),
				createMission('PENDING', [], 0, 2, 4),
				createMission('PENDING', [], 0, 1, 4),
			],
			outcome: {
				state: 'GOOD_WIN',
				roles: [
					{name: 'CRAIGM', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'ZEHUA', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'VINAY', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'LUKEE', role: 'EVIL MINION', assassin: false},
					{name: 'KEN', role: 'ASSASSIN', assassin: true},
				],
			},
		}),
	},
};

export const CleanSweepEvil: Story = {
	args: {
		avalon: createAvalonData({
			id: 'game-3',
			timeCreated: new Date('2024-01-01'),
			players: [
				{uid: '1', name: 'CRAIGM'},
				{uid: '2', name: 'ZEHUA'},
				{uid: '3', name: 'VINAY'},
				{uid: '4', name: 'LUKEE'},
				{uid: '5', name: 'KEN'},
				{uid: '6', name: 'ROB'},
			],
			missions: [
				{
					state: 'FAIL',
					team: ['CRAIGM', 'LUKEE'],
					numFails: 1,
					failsRequired: 1,
					teamSize: 2,
					evilOnTeam: ['LUKEE'],
					proposals: [
						{
							proposer: 'CRAIGM',
							team: ['CRAIGM', 'ZEHUA'],
							state: 'REJECTED' as const,
							votes: ['CRAIGM', 'ZEHUA'],
						},
						{
							proposer: 'ZEHUA',
							team: ['CRAIGM', 'LUKEE'],
							state: 'APPROVED' as const,
							votes: ['CRAIGM', 'LUKEE', 'KEN', 'ROB'],
						},
					],
				},
				createMission('FAIL', ['ZEHUA', 'KEN', 'VINAY'], 1, 1, 3, ['KEN']),
				createMission('FAIL', ['LUKEE', 'KEN', 'ROB', 'CRAIGM'], 2, 2, 4, ['LUKEE', 'KEN']),
				createMission('PENDING', [], 0, 2, 4),
				createMission('PENDING', [], 0, 1, 5),
			],
			outcome: {
				state: 'EVIL_WIN',
				roles: [
					{name: 'CRAIGM', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'ZEHUA', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'VINAY', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'LUKEE', role: 'MORGANA', assassin: false},
					{name: 'KEN', role: 'ASSASSIN', assassin: true},
					{name: 'ROB', role: 'EVIL MINION', assassin: false},
				],
			},
		}),
	},
};
export const TrustingBunch: Story = {
	args: {
		avalon: createAvalonData({
			id: 'game-4',
			timeCreated: new Date('2024-01-01'),
			players: [
				{uid: '1', name: 'CRAIGM'},
				{uid: '2', name: 'ZEHUA'},
				{uid: '3', name: 'VINAY'},
				{uid: '4', name: 'LUKEE'},
				{uid: '5', name: 'KEN'},
			],
			missions: [
				{
					state: 'SUCCESS',
					team: ['CRAIGM', 'ZEHUA', 'VINAY'],
					numFails: 0,
					failsRequired: 1,
					teamSize: 3,
					evilOnTeam: [],
					proposals: [
						{
							proposer: 'CRAIGM',
							team: ['CRAIGM', 'ZEHUA', 'VINAY'],
							state: 'APPROVED' as const,
							votes: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
						},
					],
				},
				{
					state: 'FAIL',
					team: ['LUKEE', 'KEN', 'ZEHUA'],
					numFails: 1,
					failsRequired: 1,
					teamSize: 3,
					evilOnTeam: ['LUKEE', 'KEN'],
					proposals: [
						{
							proposer: 'ZEHUA',
							team: ['LUKEE', 'KEN', 'ZEHUA'],
							state: 'APPROVED' as const,
							votes: ['LUKEE', 'KEN', 'ZEHUA'],
						},
					],
				},
				{
					state: 'SUCCESS',
					team: ['CRAIGM', 'VINAY', 'KEN'],
					numFails: 0,
					failsRequired: 1,
					teamSize: 3,
					evilOnTeam: ['KEN'],
					proposals: [
						{
							proposer: 'VINAY',
							team: ['CRAIGM', 'VINAY', 'KEN'],
							state: 'APPROVED' as const,
							votes: ['CRAIGM', 'VINAY', 'KEN'],
						},
					],
				},
				{
					state: 'FAIL',
					team: ['LUKEE', 'ZEHUA', 'CRAIGM', 'VINAY'],
					numFails: 1,
					failsRequired: 2,
					teamSize: 4,
					evilOnTeam: ['LUKEE'],
					proposals: [
						{
							proposer: 'LUKEE',
							team: ['LUKEE', 'ZEHUA', 'CRAIGM', 'VINAY'],
							state: 'APPROVED' as const,
							votes: ['LUKEE', 'ZEHUA', 'CRAIGM', 'VINAY'],
						},
					],
				},
				createMission('PENDING', [], 0, 1, 4),
			],
			outcome: {
				state: 'EVIL_WIN',
				roles: [
					{name: 'CRAIGM', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'ZEHUA', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'VINAY', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'LUKEE', role: 'EVIL MINION', assassin: false},
					{name: 'KEN', role: 'ASSASSIN', assassin: true},
				],
			},
		}),
	},
};

export const TakingABullet: Story = {
	args: {
		avalon: createAvalonData({
			id: 'game-5',
			timeCreated: new Date('2024-01-01'),
			players: [
				{uid: '1', name: 'CRAIGM'},
				{uid: '2', name: 'ZEHUA'},
				{uid: '3', name: 'VINAY'},
				{uid: '4', name: 'LUKEE'},
				{uid: '5', name: 'KEN'},
			],
			missions: [
				{
					state: 'SUCCESS',
					team: ['CRAIGM', 'ZEHUA'],
					numFails: 0,
					failsRequired: 1,
					teamSize: 2,
					evilOnTeam: [],
					proposals: [
						{
							proposer: 'CRAIGM',
							team: ['CRAIGM', 'LUKEE'],
							state: 'REJECTED' as const,
							votes: ['CRAIGM', 'LUKEE'],
						},
						{
							proposer: 'ZEHUA',
							team: ['CRAIGM', 'ZEHUA'],
							state: 'APPROVED' as const,
							votes: ['CRAIGM', 'ZEHUA', 'VINAY', 'KEN'],
						},
					],
				},
				createMission('SUCCESS', ['VINAY', 'ZEHUA'], 0, 1, 2),
				createMission('SUCCESS', ['CRAIGM', 'VINAY', 'ZEHUA'], 0, 1, 3),
				createMission('PENDING', [], 0, 2, 4),
				createMission('PENDING', [], 0, 1, 4),
			],
			outcome: {
				state: 'EVIL_WIN',
				roles: [
					{name: 'CRAIGM', role: 'MERLIN', assassin: false},
					{name: 'ZEHUA', role: 'PERCIVAL', assassin: false},
					{name: 'VINAY', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'LUKEE', role: 'MORGANA', assassin: false},
					{name: 'KEN', role: 'ASSASSIN', assassin: true},
				],
				assassinated: 'ZEHUA',
			},
		}),
	},
};

export const TrustYouGuys: Story = {
	args: {
		avalon: createAvalonData({
			id: 'game-6',
			timeCreated: new Date('2024-01-01'),
			players: [
				{uid: '1', name: 'CRAIGM'},
				{uid: '2', name: 'ZEHUA'},
				{uid: '3', name: 'VINAY'},
				{uid: '4', name: 'LUKEE'},
				{uid: '5', name: 'KEN'},
			],
			missions: [
				{
					state: 'SUCCESS',
					team: ['ZEHUA', 'VINAY'],
					numFails: 0,
					failsRequired: 1,
					teamSize: 2,
					evilOnTeam: [],
					proposals: [
						{
							proposer: 'CRAIGM',
							team: ['ZEHUA', 'VINAY'],
							state: 'APPROVED' as const,
							votes: ['CRAIGM', 'ZEHUA', 'VINAY'],
						},
					],
				},
				{
					state: 'FAIL',
					team: ['LUKEE', 'KEN'],
					numFails: 1,
					failsRequired: 1,
					teamSize: 2,
					evilOnTeam: ['LUKEE', 'KEN'],
					proposals: [
						{
							proposer: 'ZEHUA',
							team: ['LUKEE', 'KEN'],
							state: 'REJECTED' as const,
							votes: ['LUKEE', 'KEN'],
						},
						{
							proposer: 'VINAY',
							team: ['LUKEE', 'KEN'],
							state: 'APPROVED' as const,
							votes: ['VINAY', 'LUKEE', 'KEN'],
						},
					],
				},
				createMission('SUCCESS', ['CRAIGM', 'ZEHUA'], 0, 1, 2),
				createMission('FAIL', ['LUKEE', 'KEN', 'VINAY'], 1, 1, 3),
				createMission('PENDING', [], 0, 1, 4),
			],
			outcome: {
				state: 'EVIL_WIN',
				roles: [
					{name: 'CRAIGM', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'ZEHUA', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'VINAY', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'LUKEE', role: 'EVIL MINION', assassin: false},
					{name: 'KEN', role: 'ASSASSIN', assassin: true},
				],
			},
		}),
	},
};

export const PerfectCoordination: Story = {
	args: {
		avalon: createAvalonData({
			id: 'game-7',
			timeCreated: new Date('2024-01-01'),
			players: [
				{uid: '1', name: 'CRAIGM'},
				{uid: '2', name: 'ZEHUA'},
				{uid: '3', name: 'VINAY'},
				{uid: '4', name: 'LUKEE'},
				{uid: '5', name: 'KEN'},
				{uid: '6', name: 'ROB'},
			],
			missions: [
				createMission('SUCCESS', ['CRAIGM', 'ZEHUA'], 0, 1, 2),
				createMission('FAIL', ['VINAY', 'LUKEE', 'KEN'], 1, 1, 3),
				createMission('SUCCESS', ['CRAIGM', 'ZEHUA', 'ROB'], 0, 1, 3),
				{
					state: 'FAIL',
					team: ['LUKEE', 'KEN', 'ROB', 'VINAY'],
					numFails: 2,
					failsRequired: 2,
					teamSize: 4,
					evilOnTeam: ['LUKEE', 'KEN'],
					proposals: [
						{
							proposer: 'LUKEE',
							team: ['LUKEE', 'KEN', 'CRAIGM', 'ZEHUA'],
							state: 'REJECTED' as const,
							votes: ['LUKEE', 'KEN'],
						},
						{
							proposer: 'KEN',
							team: ['LUKEE', 'KEN', 'ROB', 'VINAY'],
							state: 'APPROVED' as const,
							votes: ['LUKEE', 'KEN', 'ROB', 'VINAY'],
						},
					],
				},
				createMission('PENDING', [], 0, 1, 5),
			],
			outcome: {
				state: 'EVIL_WIN',
				roles: [
					{name: 'CRAIGM', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'ZEHUA', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'VINAY', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'LUKEE', role: 'MORGANA', assassin: false},
					{name: 'KEN', role: 'ASSASSIN', assassin: true},
					{name: 'ROB', role: 'EVIL MINION', assassin: false},
				],
			},
		}),
	},
};

export const ReversalOfFortune: Story = {
	args: {
		avalon: createAvalonData({
			id: 'game-8',
			timeCreated: new Date('2024-01-01'),
			players: [
				{uid: '1', name: 'CRAIGM'},
				{uid: '2', name: 'ZEHUA'},
				{uid: '3', name: 'VINAY'},
				{uid: '4', name: 'LUKEE'},
				{uid: '5', name: 'KEN'},
			],
			missions: [
				createMission('FAIL', ['CRAIGM', 'LUKEE'], 1, 1, 2),
				createMission('FAIL', ['ZEHUA', 'KEN'], 1, 1, 2),
				createMission('SUCCESS', ['CRAIGM', 'ZEHUA', 'VINAY'], 0, 1, 3),
				createMission('SUCCESS', ['CRAIGM', 'ZEHUA', 'VINAY'], 0, 2, 4),
				createMission('SUCCESS', ['CRAIGM', 'ZEHUA', 'VINAY', 'ROB'], 0, 1, 4),
			],
			outcome: {
				state: 'GOOD_WIN',
				roles: [
					{name: 'CRAIGM', role: 'MERLIN', assassin: false},
					{name: 'ZEHUA', role: 'PERCIVAL', assassin: false},
					{name: 'VINAY', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'LUKEE', role: 'MORGANA', assassin: false},
					{name: 'KEN', role: 'ASSASSIN', assassin: true},
					{name: 'ROB', role: 'LOYAL FOLLOWER', assassin: false},
				],
			},
		}),
	},
};

export const MerlinBetrayal: Story = {
	args: {
		avalon: createAvalonData({
			id: 'game-9',
			timeCreated: new Date('2024-01-01'),
			players: [
				{uid: '1', name: 'CRAIGM'},
				{uid: '2', name: 'ZEHUA'},
				{uid: '3', name: 'VINAY'},
				{uid: '4', name: 'LUKEE'},
				{uid: '5', name: 'KEN'},
			],
			missions: [
				createMission('SUCCESS', ['ZEHUA', 'VINAY'], 0, 1, 2),
				{
					state: 'FAIL',
					team: ['CRAIGM', 'LUKEE', 'KEN'],
					numFails: 2,
					failsRequired: 1,
					teamSize: 3,
					evilOnTeam: ['LUKEE', 'KEN'],
					proposals: [
						{
							proposer: 'VINAY',
							team: ['ZEHUA', 'VINAY', 'LUKEE'],
							state: 'REJECTED' as const,
							votes: ['ZEHUA', 'VINAY'],
						},
						{
							proposer: 'LUKEE',
							team: ['CRAIGM', 'LUKEE', 'KEN'],
							state: 'REJECTED' as const,
							votes: ['LUKEE', 'KEN'],
						},
						{
							proposer: 'KEN',
							team: ['CRAIGM', 'LUKEE', 'KEN'],
							state: 'REJECTED' as const,
							votes: ['LUKEE', 'KEN'],
						},
						{
							proposer: 'CRAIGM',
							team: ['CRAIGM', 'LUKEE', 'KEN'],
							state: 'APPROVED' as const,
							votes: ['CRAIGM', 'LUKEE', 'KEN'],
						},
					],
				},
				createMission('SUCCESS', ['ZEHUA', 'VINAY', 'CRAIGM'], 0, 1, 3),
				createMission('FAIL', ['LUKEE', 'KEN', 'ZEHUA', 'VINAY'], 1, 2, 4),
				createMission('PENDING', [], 0, 1, 4),
			],
			outcome: {
				state: 'EVIL_WIN',
				roles: [
					{name: 'CRAIGM', role: 'MERLIN', assassin: false},
					{name: 'ZEHUA', role: 'PERCIVAL', assassin: false},
					{name: 'VINAY', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'LUKEE', role: 'MORGANA', assassin: false},
					{name: 'KEN', role: 'ASSASSIN', assassin: true},
				],
			},
		}),
	},
};
