import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import StartGameEventHandler from './StartGameEventHandler';

const meta: Meta<typeof StartGameEventHandler> = {
	title: 'Game/Events/StartGameEventHandler',
	component: StartGameEventHandler,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockAvalon = (initialEvents: string[] = []) => {
	let eventCallback: ((event: string, ...args: any[]) => void) | null = null;

	return {
		notifyEvent: (event: string, ...args: any[]) => {
			console.log('Event emitted:', event, ...args);
		},
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

export const GameStartedDialog: Story = {
	args: {
		avalon: createMockAvalon(['GAME_STARTED']),
	},
	parameters: {
		docs: {
			story: {
				primary: true,
			},
		},
	},
};

export const Hidden: Story = {
	args: {
		avalon: createMockAvalon(),
	},
};

export const InteractiveExample: Story = {
	render: () => {
		const [mockAvalon] = useState(() => createMockAvalon());

		return (
			<div>
				<div style={{marginBottom: '16px'}}>
					<button onClick={() => mockAvalon.triggerEvent('GAME_STARTED')}>Trigger Game Started</button>
					<button
						onClick={() => mockAvalon.triggerEvent('GAME_ENDED')}
						style={{marginLeft: '8px'}}
					>
						Trigger Game Ended
					</button>
				</div>
				<StartGameEventHandler avalon={mockAvalon} />
			</div>
		);
	},
};
