import type {Meta, StoryObj} from '@storybook/react-vite';
import Achievements from './Achievements';

const meta: Meta<typeof Achievements> = {
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

// Mock role map
const mockRoleMap = {
	MERLIN: {team: 'good'},
	PERCIVAL: {team: 'good'},
	'LOYAL FOLLOWER': {team: 'good'},
	MORGANA: {team: 'evil'},
	ASSASSIN: {team: 'evil'},
	MORDRED: {team: 'evil'},
	OBERON: {team: 'evil'},
	'EVIL MINION': {team: 'evil'},
};

// Helper to create a basic mission
const createMission = (
	state: string,
	team: string[],
	numFails = 0,
	failsRequired = 1,
	teamSize?: number,
	evilOnTeam: string[] = [],
) => ({
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
			state: 'APPROVED',
			votes: team,
		},
	],
});

export const NoBadges: Story = {
	args: {
		avalon: {
			lobby: {
				game: {
					players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
					missions: [],
					outcome: {
						state: 'CANCELED',
						roles: [],
					},
				},
			},
			config: {
				roleMap: mockRoleMap,
			},
		},
	},
};

export const CleanSweepGood: Story = {
	args: {
		avalon: {
			lobby: {
				game: {
					players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
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
									state: 'REJECTED',
									votes: ['CRAIGM', 'LUKEE'],
								},
								{
									proposer: 'ZEHUA',
									team: ['CRAIGM', 'ZEHUA'],
									state: 'APPROVED',
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
							{name: 'CRAIGM', role: 'LOYAL FOLLOWER'},
							{name: 'ZEHUA', role: 'LOYAL FOLLOWER'},
							{name: 'VINAY', role: 'LOYAL FOLLOWER'},
							{name: 'LUKEE', role: 'EVIL MINION'},
							{name: 'KEN', role: 'ASSASSIN'},
						],
					},
				},
			},
			config: {
				roleMap: mockRoleMap,
			},
		},
	},
};

export const CleanSweepEvil: Story = {
	args: {
		avalon: {
			lobby: {
				game: {
					players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN', 'ROB'],
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
									state: 'REJECTED',
									votes: ['CRAIGM', 'ZEHUA'],
								},
								{
									proposer: 'ZEHUA',
									team: ['CRAIGM', 'LUKEE'],
									state: 'APPROVED',
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
							{name: 'CRAIGM', role: 'LOYAL FOLLOWER'},
							{name: 'ZEHUA', role: 'LOYAL FOLLOWER'},
							{name: 'VINAY', role: 'LOYAL FOLLOWER'},
							{name: 'LUKEE', role: 'MORGANA'},
							{name: 'KEN', role: 'ASSASSIN'},
							{name: 'ROB', role: 'EVIL MINION'},
						],
					},
				},
			},
			config: {
				roleMap: mockRoleMap,
			},
		},
	},
};

export const TrustingBunch: Story = {
	args: {
		avalon: {
			lobby: {
				game: {
					players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
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
									state: 'APPROVED',
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
									state: 'APPROVED',
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
									state: 'APPROVED',
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
									state: 'APPROVED',
									votes: ['LUKEE', 'ZEHUA', 'CRAIGM', 'VINAY'],
								},
							],
						},
						createMission('PENDING', [], 0, 1, 4),
					],
					outcome: {
						state: 'EVIL_WIN',
						roles: [
							{name: 'CRAIGM', role: 'LOYAL FOLLOWER'},
							{name: 'ZEHUA', role: 'LOYAL FOLLOWER'},
							{name: 'VINAY', role: 'LOYAL FOLLOWER'},
							{name: 'LUKEE', role: 'EVIL MINION'},
							{name: 'KEN', role: 'ASSASSIN'},
						],
					},
				},
			},
			config: {
				roleMap: mockRoleMap,
			},
		},
	},
};

export const TakingABullet: Story = {
	args: {
		avalon: {
			lobby: {
				game: {
					players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
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
									state: 'REJECTED',
									votes: ['CRAIGM', 'LUKEE'],
								},
								{
									proposer: 'ZEHUA',
									team: ['CRAIGM', 'ZEHUA'],
									state: 'APPROVED',
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
							{name: 'CRAIGM', role: 'MERLIN'},
							{name: 'ZEHUA', role: 'PERCIVAL'},
							{name: 'VINAY', role: 'LOYAL FOLLOWER'},
							{name: 'LUKEE', role: 'MORGANA'},
							{name: 'KEN', role: 'ASSASSIN'},
						],
						assassinated: 'ZEHUA',
					},
				},
			},
			config: {
				roleMap: mockRoleMap,
			},
		},
	},
};

export const TrustYouGuys: Story = {
	args: {
		avalon: {
			lobby: {
				game: {
					players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
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
									state: 'APPROVED',
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
									state: 'REJECTED',
									votes: ['LUKEE', 'KEN'],
								},
								{
									proposer: 'VINAY',
									team: ['LUKEE', 'KEN'],
									state: 'APPROVED',
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
							{name: 'CRAIGM', role: 'LOYAL FOLLOWER'},
							{name: 'ZEHUA', role: 'LOYAL FOLLOWER'},
							{name: 'VINAY', role: 'LOYAL FOLLOWER'},
							{name: 'LUKEE', role: 'EVIL MINION'},
							{name: 'KEN', role: 'ASSASSIN'},
						],
					},
				},
			},
			config: {
				roleMap: mockRoleMap,
			},
		},
	},
};

export const PerfectCoordination: Story = {
	args: {
		avalon: {
			lobby: {
				game: {
					players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN', 'ROB'],
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
									state: 'REJECTED',
									votes: ['LUKEE', 'KEN'],
								},
								{
									proposer: 'KEN',
									team: ['LUKEE', 'KEN', 'ROB', 'VINAY'],
									state: 'APPROVED',
									votes: ['LUKEE', 'KEN', 'ROB', 'VINAY'],
								},
							],
						},
						createMission('PENDING', [], 0, 1, 5),
					],
					outcome: {
						state: 'EVIL_WIN',
						roles: [
							{name: 'CRAIGM', role: 'LOYAL FOLLOWER'},
							{name: 'ZEHUA', role: 'LOYAL FOLLOWER'},
							{name: 'VINAY', role: 'LOYAL FOLLOWER'},
							{name: 'LUKEE', role: 'MORGANA'},
							{name: 'KEN', role: 'ASSASSIN'},
							{name: 'ROB', role: 'EVIL MINION'},
						],
					},
				},
			},
			config: {
				roleMap: mockRoleMap,
			},
		},
	},
};

export const ReversalOfFortune: Story = {
	args: {
		avalon: {
			lobby: {
				game: {
					players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
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
							{name: 'CRAIGM', role: 'MERLIN'},
							{name: 'ZEHUA', role: 'PERCIVAL'},
							{name: 'VINAY', role: 'LOYAL FOLLOWER'},
							{name: 'LUKEE', role: 'MORGANA'},
							{name: 'KEN', role: 'ASSASSIN'},
							{name: 'ROB', role: 'LOYAL FOLLOWER'},
						],
					},
				},
			},
			config: {
				roleMap: mockRoleMap,
			},
		},
	},
};

export const MerlinBetrayal: Story = {
	args: {
		avalon: {
			lobby: {
				game: {
					players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
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
									state: 'REJECTED',
									votes: ['ZEHUA', 'VINAY'],
								},
								{
									proposer: 'LUKEE',
									team: ['CRAIGM', 'LUKEE', 'KEN'],
									state: 'REJECTED',
									votes: ['LUKEE', 'KEN'],
								},
								{
									proposer: 'KEN',
									team: ['CRAIGM', 'LUKEE', 'KEN'],
									state: 'REJECTED',
									votes: ['LUKEE', 'KEN'],
								},
								{
									proposer: 'CRAIGM',
									team: ['CRAIGM', 'LUKEE', 'KEN'],
									state: 'APPROVED',
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
							{name: 'CRAIGM', role: 'MERLIN'},
							{name: 'ZEHUA', role: 'PERCIVAL'},
							{name: 'VINAY', role: 'LOYAL FOLLOWER'},
							{name: 'LUKEE', role: 'MORGANA'},
							{name: 'KEN', role: 'ASSASSIN'},
						],
					},
				},
			},
			config: {
				roleMap: mockRoleMap,
			},
		},
	},
};
