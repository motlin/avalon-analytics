import type {Meta, StoryObj} from '@storybook/react-vite';
import LobbyPlayerList from './LobbyPlayerList';

const meta: Meta<typeof LobbyPlayerList> = {
	title: 'Lobby/LobbyPlayerList',
	component: LobbyPlayerList,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `LobbyPlayerList displays and manages players in a game lobby before the game starts.

## Features
- Display all players currently in the lobby
- Admin controls for player management
- Drag-and-drop reordering (admin only)
- Kick player functionality (admin only)
- Visual indicators for admin status
- Responsive list layout

## Admin Capabilities
When you are the lobby admin:
- Reorder players by dragging (affects seating order in game)
- Kick players from the lobby
- Visual crown indicator shows you're the admin

## Player Display
- Each player shown with their name
- Admin marked with a crown icon
- Hover effects on interactive elements
- Confirmation dialog for kick actions

## Usage
\`\`\`tsx
import LobbyPlayerList from './LobbyPlayerList';

function Lobby() {
  return <LobbyPlayerList avalon={avalonApi} />;
}
\`\`\``,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		avalon: {
			description: 'Avalon API object containing lobby state, player list, and admin functions',
			control: {type: 'object'},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockAvalon = (overrides = {}) => ({
	config: {
		playerList: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
		sortList: (newList: string[]) => {
			console.log('Sorting list:', newList);
		},
		roleMap: {},
	},
	user: {
		name: 'CRAIGM',
	},
	game: {
		id: 'mock-game-id',
		timeCreated: new Date('2025-01-01T00:00:00Z'),
		players: [
			{uid: 'uid-1', name: 'CRAIGM'},
			{uid: 'uid-2', name: 'ZEHUA'},
			{uid: 'uid-3', name: 'VINAY'},
			{uid: 'uid-4', name: 'LUKEE'},
			{uid: 'uid-5', name: 'KEN'},
		],
		missions: [],
		outcome: {
			state: 'IN_PROGRESS' as const,
			message: '',
			assassinated: undefined,
			roles: [],
			votes: [],
		},
	},
	lobby: {
		admin: {
			name: 'CRAIGM',
		},
		game: {
			id: 'mock-game-id',
			timeCreated: new Date('2025-01-01T00:00:00Z'),
			players: [
				{uid: 'uid-1', name: 'CRAIGM'},
				{uid: 'uid-2', name: 'ZEHUA'},
				{uid: 'uid-3', name: 'VINAY'},
				{uid: 'uid-4', name: 'LUKEE'},
				{uid: 'uid-5', name: 'KEN'},
			],
			missions: [],
			outcome: {
				state: 'IN_PROGRESS' as const,
				message: '',
				assassinated: undefined,
				roles: [],
				votes: [],
			},
		},
	},
	isAdmin: true,
	isGameInProgress: false,
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
});

export const AdminCanDragAndKick: Story = {
	args: {
		avalon: createMockAvalon(),
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the full admin experience with drag-to-reorder and kick functionality. ALICE is the admin and can manage other players.',
			},
		},
	},
};

export const NonAdminView: Story = {
	args: {
		avalon: createMockAvalon({
			isAdmin: false,
			user: {name: 'ZEHUA'},
		}),
	},
	parameters: {
		docs: {
			description: {
				story: 'Non-admin view shows the player list without management controls. Players can see who is in the lobby but cannot reorder or kick.',
			},
		},
	},
};

export const SinglePlayer: Story = {
	args: {
		avalon: createMockAvalon({
			config: {
				playerList: ['CRAIGM'],
				sortList: (newList: string[]) => {
					console.log('Sorting list:', newList);
				},
			},
		}),
	},
	parameters: {
		docs: {
			description: {
				story: 'Lobby with only one player (the admin). Shows how the component handles minimal state.',
			},
		},
	},
};

export const AdminInMiddle: Story = {
	args: {
		avalon: createMockAvalon({
			config: {
				playerList: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
				sortList: (newList: string[]) => {
					console.log('Sorting list:', newList);
				},
			},
			user: {name: 'VINAY'},
			lobby: {
				admin: {name: 'VINAY'},
			},
		}),
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows when the admin (CHARLIE) is not the first player in the list. The crown icon helps identify the admin regardless of position.',
			},
		},
	},
};

export const EmptyLobby: Story = {
	args: {
		avalon: createMockAvalon({
			config: {
				playerList: [],
				sortList: (newList: string[]) => {
					console.log('Sorting list:', newList);
				},
			},
		}),
	},
	parameters: {
		docs: {
			description: {
				story: 'Edge case: empty lobby with no players. This state is unusual but the component handles it gracefully.',
			},
		},
	},
};
