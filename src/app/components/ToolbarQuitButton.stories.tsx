import type {Meta, StoryObj} from '@storybook/react-vite';
import ToolbarQuitButton from './ToolbarQuitButton';

const meta: Meta<typeof ToolbarQuitButton> = {
	title: 'UI/ToolbarQuitButton',
	component: ToolbarQuitButton,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `ToolbarQuitButton provides a context-sensitive exit option for leaving lobbies or canceling games.

## Features
- Context-aware button text
- Shows "Leave Lobby" when in lobby
- Shows "Cancel Game" when game is active
- Confirmation dialog to prevent accidental exits
- Async operation handling with loading states

## Behavior
- **In Lobby**: Immediately leaves and returns to main menu
- **In Game**: Cancels the current game for all players
- Both actions require confirmation to prevent mistakes

## Usage
\`\`\`tsx
import ToolbarQuitButton from './ToolbarQuitButton';

function Toolbar() {
  return (
    <nav>
      <ToolbarQuitButton avalon={avalonApi} />
    </nav>
  );
}
\`\`\``,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		avalon: {
			description: 'Avalon API object with game state and exit methods',
			control: {type: 'object'},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockAvalonLobby = {
	isGameInProgress: false,
	cancelGame: () => {
		console.log('Cancel game called');
		return Promise.resolve();
	},
	leaveLobby: () => {
		console.log('Leave lobby called');
	},
};

const mockAvalonGame = {
	isGameInProgress: true,
	cancelGame: () => {
		console.log('Cancel game called');
		return Promise.resolve();
	},
	leaveLobby: () => {
		console.log('Leave lobby called');
	},
};

export const LeaveLobby: Story = {
	args: {
		avalon: mockAvalonLobby,
	},
	parameters: {
		docs: {
			description: {
				story: 'Button in lobby state. Click to leave the lobby and return to the main menu.',
			},
		},
	},
};

export const CancelGame: Story = {
	args: {
		avalon: mockAvalonGame,
	},
	parameters: {
		docs: {
			description: {
				story: 'Button during active game. Click to cancel the game for all players and return everyone to the lobby.',
			},
		},
	},
};
