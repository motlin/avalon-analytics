import type {Meta, StoryObj} from '@storybook/react-vite';
import Lobby from './Lobby';

const meta: Meta<typeof Lobby> = {
	title: 'Lobby/Lobby',
	component: Lobby,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
The Lobby component is the game setup interface where players gather before starting an Avalon game. It provides comprehensive game configuration options and player management features.

### Key Features

- **Player Management** - View connected players, kick players (admin only)
- **Role Selection** - Choose which special roles to include in the game
- **Game Configuration** - Set optional rules and game variants
- **Quick Links** - Easy sharing of lobby URL and access codes
- **Chat System** - Real-time communication between players

### Admin Controls

The lobby creator (admin) has exclusive controls to:
- Configure game settings and roles
- Kick players from the lobby
- Start the game when ready
- Access advanced configuration options

### Role System

The lobby allows selection of various special roles:
- **Good Team**: Merlin, Percival, Loyal Followers
- **Evil Team**: Morgana, Mordred, Oberon, Assassin, Evil Minions

The component automatically balances teams based on player count and selected roles.

### Game States

The lobby handles multiple states:
- **Waiting** - Players joining, admin configuring
- **Ready** - Enough players, valid configuration
- **Starting** - Game initialization in progress
- **In Progress** - Redirects to active game
        `,
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleRoles = [
	{
		name: 'MERLIN',
		team: 'good' as const,
		description: 'Merlin sees all evil people (except for Mordred), but can also be assassinated.',
		selected: true,
	},
	{
		name: 'PERCIVAL',
		team: 'good' as const,
		description: 'Percival can see Merlin and Morgana but does not know which one is which.',
		selected: true,
	},
	{
		name: 'LOYAL FOLLOWER',
		team: 'good' as const,
		description: 'Loyal Follower is a genuinely good person.',
		selected: false,
	},
	{
		name: 'MORGANA',
		team: 'evil' as const,
		description:
			'Morgana appears indistinguishable from Merlin to Percival. She sees other evil people (except Oberon)',
		selected: false,
	},
	{
		name: 'MORDRED',
		team: 'evil' as const,
		description: 'Mordred is invisible to Merlin. Mordred can see other evil people (except Oberon)',
		selected: false,
	},
	{
		name: 'OBERON',
		team: 'evil' as const,
		description: 'Oberon does not see anyone on his team and his teammates do not see him.',
		selected: false,
	},
	{
		name: 'EVIL MINION',
		team: 'evil' as const,
		description: 'Evil Minion is pretty evil. He can see other evil people (except Oberon)',
		selected: true,
	},
	{
		name: 'ASSASSIN',
		team: 'evil' as const,
		description: 'The Assassin can kill Merlin at the end of the game if evil loses all missions.',
		selected: true,
	},
];

const createMockAvalon = (overrides = {}) => {
	const mockGame = {
		id: 'lobby-game-1',
		timeCreated: new Date('2024-01-01'),
		players: [
			{uid: '1', name: 'CRAIGM'},
			{uid: '2', name: 'ZEHUA'},
			{uid: '3', name: 'VINAY'},
			{uid: '4', name: 'LUKEE'},
			{uid: '5', name: 'KEN'},
		],
		missions: [],
	};

	return {
		game: mockGame,
		user: {
			name: 'CRAIGM',
			stats: {
				games: 5,
			},
		},
		config: {
			roleMap: {},
			playerList: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
			selectableRoles: sampleRoles,
			sortList: (newList: string[]) => {
				console.log('Sorting player list:', newList);
			},
		},
		lobby: {
			game: mockGame,
			name: 'test-lobby-123',
			admin: {
				name: 'CRAIGM',
			},
		},
		isAdmin: true,
		isGameInProgress: false,
		startGame: async (options: {inGameLog: boolean}) => {
			console.log('Starting game with options:', options);
			return new Promise((resolve) => {
				setTimeout(() => {
					console.log('Game started successfully');
					resolve(undefined);
				}, 2000);
			});
		},
		kickPlayer: async (player: string): Promise<void> => {
			console.log('Kicking player:', player);
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					console.log('Player kicked:', player);
					resolve();
				}, 1000);
			});
		},
		...overrides,
	};
};

export const ReadyToStart: Story = {
	args: {
		avalon: createMockAvalon(),
	},
};

export const NotEnoughPlayers: Story = {
	args: {
		avalon: createMockAvalon({
			config: {
				playerList: ['ALICE', 'BOB', 'CHARLIE'],
				selectableRoles: sampleRoles,
				sortList: (newList: string[]) => {
					console.log('Sorting player list:', newList);
				},
			},
		}),
	},
};

export const TooManyPlayers: Story = {
	args: {
		avalon: createMockAvalon({
			config: {
				playerList: [
					'ALICE',
					'BOB',
					'CHARLIE',
					'DIANA',
					'EVE',
					'FRANK',
					'GRACE',
					'HENRY',
					'IVY',
					'JACK',
					'KAREN',
				],
				selectableRoles: sampleRoles,
				sortList: (newList: string[]) => {
					console.log('Sorting player list:', newList);
				},
			},
		}),
	},
};

export const NonAdminWaiting: Story = {
	args: {
		avalon: createMockAvalon({
			user: {
				name: 'ZEHUA',
				stats: {
					games: 3,
				},
			},
			isAdmin: false,
		}),
	},
};

export const MaxPlayersReady: Story = {
	args: {
		avalon: createMockAvalon({
			config: {
				playerList: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN', 'ROB', 'JUSTIN', 'TIFANY', 'FLORA', 'JACK'],
				selectableRoles: sampleRoles,
				sortList: (newList: string[]) => {
					console.log('Sorting player list:', newList);
				},
			},
		}),
	},
};

export const MinPlayersReady: Story = {
	args: {
		avalon: createMockAvalon({
			config: {
				playerList: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
				selectableRoles: sampleRoles,
				sortList: (newList: string[]) => {
					console.log('Sorting player list:', newList);
				},
			},
		}),
	},
};

export const NewPlayerLobby: Story = {
	args: {
		avalon: createMockAvalon({
			user: {
				name: 'NEWBIE',
				stats: {
					games: 0,
				},
			},
			config: {
				playerList: ['NEWBIE', 'CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
				selectableRoles: sampleRoles,
				sortList: (newList: string[]) => {
					console.log('Sorting player list:', newList);
				},
			},
			lobby: {
				name: 'beginner-friendly-lobby',
				admin: {
					name: 'CRAIGM',
				},
			},
			isAdmin: false,
		}),
	},
};

export const SevenPlayerGame: Story = {
	args: {
		avalon: createMockAvalon({
			config: {
				playerList: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN', 'ROB', 'JUSTIN'],
				selectableRoles: sampleRoles,
				sortList: (newList: string[]) => {
					console.log('Sorting player list:', newList);
				},
			},
		}),
	},
};
