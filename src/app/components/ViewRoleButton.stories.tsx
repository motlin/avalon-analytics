import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import ViewRoleButton from './ViewRoleButton';

const meta: Meta<typeof ViewRoleButton> = {
	component: ViewRoleButton,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
The ViewRoleButton component provides a toggleable interface for players to view their secret role information during gameplay. This is essential for checking your identity and understanding what information you have access to.

### Features

- **Toggle Display** - Click to show/hide role information
- **Auto-Hide** - Automatically hides when certain game events occur
- **Security** - Prevents accidental role reveals to other players
- **Context Sensitive** - Shows relevant information based on your role

### Role Information Display

Different roles see different information:
- **Merlin** - Sees all evil players except Mordred
- **Percival** - Sees Merlin and Morgana (but not which is which)
- **Evil Team** - See each other (except Oberon)
- **Oberon** - Sees no one and is not seen
- **Loyal Followers** - See only their own role

### Safety Features

The component automatically hides role information when:
- A new game starts
- The game ends
- Certain game events occur that might risk exposure
        `,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		avalon: {
			control: 'object',
			description: 'Avalon game state object',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockAvalon = (isGameInProgress: boolean = false, roleData: any = {}, initialEvents: string[] = []) => {
	let eventCallback: ((event: string, ...args: any[]) => void) | null = null;

	return {
		user: {
			name: 'CRAIGM',
			stats: {
				games: 42,
				good: 25,
				wins: 28,
				good_wins: 18,
				playtimeSeconds: 9000, // 2.5 hours
			},
		},
		lobby: {
			role: {
				role: {
					name: roleData.name || 'Loyal Servant of Arthur',
					team: roleData.team || 'good',
					description:
						roleData.description ||
						'You are a loyal servant of Arthur. You must help the good team succeed on 3 missions.',
				},
				assassin: roleData.assassin || false,
				sees: roleData.sees || [],
			},
		},
		globalStats: {
			games: 15000,
			good_wins: 8200,
		},
		isGameInProgress,
		onEvent: (callback: (event: string, ...args: any[]) => void) => {
			eventCallback = callback;

			// Simulate initial events
			setTimeout(() => {
				initialEvents.forEach((event) => {
					if (eventCallback) {
						eventCallback(event);
					}
				});
			}, 100);

			return () => {
				eventCallback = null;
			};
		},
		triggerEvent: (event: string, ...args: any[]) => {
			if (eventCallback) {
				eventCallback(event, ...args);
			}
		},
	};
};

export const PreGameStats: Story = {
	args: {
		avalon: createMockAvalon(false),
	},
};

export const GoodRole: Story = {
	args: {
		avalon: createMockAvalon(true, {
			name: 'Percival',
			team: 'good',
			description: 'You are Percival. You see Merlin and Morgana, but you do not know which is which.',
			sees: ['Merlin', 'Morgana'],
		}),
	},
};

export const EvilRole: Story = {
	args: {
		avalon: createMockAvalon(true, {
			name: 'Morgana',
			team: 'evil',
			description:
				'You are Morgana. You appear as Merlin to Percival. You must help the evil team fail 3 missions.',
			sees: ['Mordred', 'Assassin'],
		}),
	},
};

export const AssassinRole: Story = {
	args: {
		avalon: createMockAvalon(true, {
			name: 'Assassin',
			team: 'evil',
			description: 'You are the Assassin. You must help the evil team fail 3 missions.',
			assassin: true,
			sees: ['Morgana', 'Mordred'],
		}),
	},
};

export const MerlinRole: Story = {
	args: {
		avalon: createMockAvalon(true, {
			name: 'Merlin',
			team: 'good',
			description:
				'You are Merlin. You see all evil players except Mordred. You must help the good team succeed on 3 missions, but stay hidden from the Assassin.',
			sees: ['Morgana', 'Assassin'],
		}),
	},
};

export const RoleSeesNoOne: Story = {
	args: {
		avalon: createMockAvalon(true, {
			name: 'Loyal Servant of Arthur',
			team: 'good',
			description: 'You are a loyal servant of Arthur. You must help the good team succeed on 3 missions.',
			sees: [],
		}),
	},
};

export const InteractiveExample: Story = {
	render: () => {
		const [mockAvalon] = useState(() =>
			createMockAvalon(true, {
				name: 'Percival',
				team: 'good',
				description: 'You are Percival. You see Merlin and Morgana, but you do not know which is which.',
				sees: ['Merlin', 'Morgana'],
			}),
		);

		return (
			<div>
				<div style={{marginBottom: '16px'}}>
					<button onClick={() => mockAvalon.triggerEvent('show-role')}>Show Role Modal</button>
					<button
						onClick={() => mockAvalon.triggerEvent('GAME_ENDED')}
						style={{marginLeft: '8px'}}
					>
						Close Modal (Game Ended)
					</button>
				</div>
				<ViewRoleButton avalon={mockAvalon} />
			</div>
		);
	},
};
