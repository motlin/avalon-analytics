import type {Meta, StoryObj} from '@storybook/react-vite';
import Toast from './Toast';

const meta: Meta<typeof Toast> = {
	title: 'UI/Toast',
	component: Toast,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `The Toast component provides non-intrusive notifications to users about system events, actions, or status updates.

## Features
- Multiple toast types: success, error, warning, info
- Configurable positioning (top/bottom, left/center/right)
- Auto-dismiss with customizable duration
- Manual close capability
- Full-width option for mobile-friendly display
- Smooth enter/exit animations
- Accessibility support with proper ARIA labels

## Usage
Toast notifications are typically triggered by user actions or system events. They should:
- Be concise and actionable
- Auto-dismiss for informational messages
- Allow manual dismissal for important messages
- Use appropriate types to convey the message severity

## Animation Behavior
- Toasts slide in from their positioned edge
- Exit animations mirror entry animations
- Respects reduced motion preferences
- 300ms transition timing for smooth UX`,
			},
		},
	},
	tags: ['autodocs', 'test'],
	argTypes: {
		message: {
			control: 'text',
			description: 'The notification message to display',
		},
		type: {
			control: 'select',
			options: ['success', 'error', 'warning', 'info'],
			description: 'The type of notification, affects styling and icon',
		},
		duration: {
			control: {type: 'number', min: 0, max: 10000, step: 500},
			description: 'Auto-dismiss duration in milliseconds (0 = no auto-dismiss)',
		},
		position: {
			control: 'select',
			options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
			description: 'Position of the toast on screen',
		},
		fullWidth: {
			control: 'boolean',
			description: 'Make toast span the full width of the container',
		},
		visible: {
			control: 'boolean',
			description: 'Controls visibility of the toast',
		},
	},
	args: {
		message: 'This is a notification message',
		type: 'info',
		duration: 2000,
		position: 'top-center',
		fullWidth: true,
		visible: true,
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Default toast configuration with info type, top-center position, and 2-second auto-dismiss.',
			},
		},
	},
};

export const Success: Story = {
	args: {
		message: 'Your action was completed successfully!',
		type: 'success',
	},
	parameters: {
		docs: {
			description: {
				story: 'Success toast for positive feedback after successful operations.',
			},
		},
	},
};

export const Error: Story = {
	args: {
		message: 'An error occurred while processing your request.',
		type: 'error',
		duration: 5000,
	},
	parameters: {
		docs: {
			description: {
				story: 'Error toast with longer duration for critical messages that require user attention.',
			},
		},
	},
};

export const Warning: Story = {
	args: {
		message: 'This action cannot be undone. Please proceed with caution.',
		type: 'warning',
		duration: 4000,
	},
	parameters: {
		docs: {
			description: {
				story: 'Warning toast for cautionary messages that need user awareness.',
			},
		},
	},
};

export const LongMessage: Story = {
	args: {
		message:
			'This is a much longer notification message that demonstrates how the toast component handles text wrapping and maintains proper spacing with multiple lines of content.',
		type: 'info',
		duration: 6000,
	},
	parameters: {
		docs: {
			description: {
				story: 'Toast with a longer message showing text wrapping behavior.',
			},
		},
	},
};

export const NoDismiss: Story = {
	args: {
		message: 'This toast will not auto-dismiss. Close it manually.',
		type: 'warning',
		duration: 0,
	},
	parameters: {
		docs: {
			description: {
				story: 'Toast that requires manual dismissal by setting duration to 0.',
			},
		},
	},
};

export const TopLeft: Story = {
	args: {
		message: 'Notification positioned at top-left',
		position: 'top-left',
		fullWidth: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'Toast positioned at the top-left corner with fixed width.',
			},
		},
	},
};

export const TopRight: Story = {
	args: {
		message: 'Notification positioned at top-right',
		position: 'top-right',
		fullWidth: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'Toast positioned at the top-right corner with fixed width.',
			},
		},
	},
};

export const BottomCenter: Story = {
	args: {
		message: 'Notification positioned at bottom-center',
		position: 'bottom-center',
		type: 'success',
	},
	parameters: {
		docs: {
			description: {
				story: 'Toast positioned at the bottom-center, useful for mobile interfaces.',
			},
		},
	},
};

export const BottomLeft: Story = {
	args: {
		message: 'Notification positioned at bottom-left',
		position: 'bottom-left',
		fullWidth: false,
		type: 'warning',
	},
	parameters: {
		docs: {
			description: {
				story: 'Toast positioned at the bottom-left corner with fixed width.',
			},
		},
	},
};

export const BottomRight: Story = {
	args: {
		message: 'Notification positioned at bottom-right',
		position: 'bottom-right',
		fullWidth: false,
		type: 'error',
	},
	parameters: {
		docs: {
			description: {
				story: 'Toast positioned at the bottom-right corner with fixed width.',
			},
		},
	},
};

export const AllTypes: Story = {
	render: () => (
		<div style={{position: 'relative', height: '400px', width: '100%'}}>
			<Toast
				message="Success: Operation completed!"
				type="success"
				position="top-left"
				fullWidth={false}
				duration={0}
			/>
			<Toast
				message="Error: Something went wrong!"
				type="error"
				position="top-right"
				fullWidth={false}
				duration={0}
			/>
			<Toast
				message="Warning: Please review this action!"
				type="warning"
				position="bottom-left"
				fullWidth={false}
				duration={0}
			/>
			<Toast
				message="Info: Here's some helpful information!"
				type="info"
				position="bottom-right"
				fullWidth={false}
				duration={0}
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Showcase of all toast types positioned in different corners simultaneously.',
			},
		},
	},
};

export const GameNotifications: Story = {
	render: () => (
		<div style={{position: 'relative', height: '300px', width: '100%'}}>
			<Toast
				message="PLAYER joined the lobby"
				type="success"
				position="top-center"
				duration={0}
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Example of how toasts might appear in the Avalon game context for player notifications.',
			},
		},
	},
};

export const MobileLayout: Story = {
	args: {
		message: 'Mobile-optimized notification',
		type: 'info',
		position: 'bottom-center',
		fullWidth: true,
	},
	parameters: {
		viewport: {
			defaultViewport: 'mobile1',
		},
		docs: {
			description: {
				story: 'Toast optimized for mobile viewports with full-width layout.',
			},
		},
	},
};
