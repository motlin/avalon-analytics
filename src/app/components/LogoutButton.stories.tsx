import type {Meta, StoryObj} from '@storybook/react-vite';
import LogoutButton from './LogoutButton';

const meta: Meta<typeof LogoutButton> = {
	title: 'Authentication/LogoutButton',
	component: LogoutButton,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
The LogoutButton component provides a simple way for users to sign out of their current session. It's typically displayed in the application header or navigation area.

### Functionality

- **One-Click Logout** - Immediately signs out the current user
- **Session Cleanup** - Clears authentication tokens and local state
- **Redirect** - Returns user to the login screen

### Usage

Place the LogoutButton in consistent locations across your application for a predictable user experience. The component handles all logout logic internally through the Avalon API.
        `,
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockAvalon = {
	logout: () => {
		console.log('Logout called');
	},
};

export const Default: Story = {
	args: {
		avalon: mockAvalon,
	},
};
