import type {Meta, StoryObj} from '@storybook/react-vite';
import Login from './Login';

const meta: Meta<typeof Login> = {
	title: 'Authentication/Login',
	component: Login,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `The Login component provides the main entry point for users to join or create game lobbies.

## Features
- Display user stats and achievements
- Create new game lobbies
- Join existing lobbies by code
- Show global game statistics
- Provide achievement overview
- Responsive layout for various screen sizes

## User Flow
1. User sees their stats (if logged in) or a welcome message
2. User can either create a new lobby or join an existing one
3. Upon successful action, user is redirected to the game lobby

## Error Handling
The component gracefully handles:
- Failed lobby creation
- Invalid lobby codes
- Network errors
- Missing user data`,
			},
		},
	},
	tags: ['autodocs', 'test'],
	argTypes: {
		avalon: {
			control: 'object',
			description: 'Avalon API object containing user data, stats, and methods for lobby operations',
		},
		disableAutoFocus: {
			control: 'boolean',
			description: 'Disable auto-focus on the name input field',
			defaultValue: true,
		},
	},
	args: {
		disableAutoFocus: true,
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockAvalonApi = {
	user: {
		name: 'TESTUSER',
		email: 'test@example.com',
		stats: {
			games: 25,
			good: 15,
			wins: 18,
			good_wins: 12,
			playtimeSeconds: 3600,
		},
	},
	globalStats: {
		games: 5000,
		good_wins: 2750,
	},
	createLobby: async (name: string): Promise<void> => {
		console.log('Create lobby called with name:', name);
		return new Promise<void>((resolve) => setTimeout(resolve, 1000));
	},
	joinLobby: async (name: string, lobby: string): Promise<void> => {
		console.log('Join lobby called with name:', name, 'lobby:', lobby);
		return new Promise<void>((resolve) => setTimeout(resolve, 1000));
	},
};

const mockAvalonApiError = {
	...mockAvalonApi,
	createLobby: async (): Promise<void> => {
		throw new Error('Failed to create lobby');
	},
	joinLobby: async (): Promise<void> => {
		throw new Error('Lobby not found');
	},
};

export const WithUser: Story = {
	args: {
		avalon: mockAvalonApi,
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the login screen for an authenticated user with their stats and ability to create/join lobbies.',
			},
		},
	},
};

export const WithoutUser: Story = {
	args: {
		avalon: {
			...mockAvalonApi,
			user: undefined,
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Shows the login screen for an unauthenticated user. They can still join or create lobbies but won't see personal stats.",
			},
		},
	},
};

export const EmptyStats: Story = {
	args: {
		avalon: {
			...mockAvalonApi,
			user: {
				...mockAvalonApi.user,
				stats: {},
			},
			globalStats: undefined,
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the component when user stats are not available. This might happen for new users or when stats fail to load.',
			},
		},
	},
};

export const ErrorScenario: Story = {
	args: {
		avalon: mockAvalonApiError,
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates error handling when lobby operations fail. Try creating or joining a lobby to see error messages.',
			},
		},
	},
};
