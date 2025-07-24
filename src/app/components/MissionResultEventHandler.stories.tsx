import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import MissionResultEventHandler from './MissionResultEventHandler';

const meta: Meta<typeof MissionResultEventHandler> = {
	title: 'Events/MissionResultEventHandler',
	component: MissionResultEventHandler,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `MissionResultEventHandler displays the outcome of missions with dramatic flair.

## Features
- Fullscreen modal presentation
- Success/failure animations
- Shows team members who went on mission
- Displays number of fail votes (for failures)
- Auto-dismisses after animation
- Event-driven display logic

## Mission Results
- **Success**: All team members voted to pass
- **Failure**: One or more sabotage votes
- Shows exact fail count (important for deduction)

## Event Handling
The component listens for:
- \`MISSION_RESULT\` - Shows the result modal
- \`GAME_ENDED\` - Hides any open modal
- Auto-hides after animation completes

## Usage
\`\`\`tsx
import MissionResultEventHandler from './MissionResultEventHandler';

function Game() {
  return (
    <MissionResultEventHandler avalon={avalonApi} />
  );
}
\`\`\``,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		avalon: {
			description: 'Avalon API object with mission data and event system',
			control: {type: 'object'},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockAvalon = (mission: any, initialEvents: string[] = []) => {
	let eventCallback: ((event: string, ...args: any[]) => void) | null = null;

	return {
		lobby: {
			game: {
				currentMissionIdx: 1,
				missions: [mission],
			},
		},
		onEvent: (callback: (event: string, ...args: any[]) => void) => {
			eventCallback = callback;

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

const successMission = {
	state: 'SUCCESS',
	team: ['CRAIGM', 'ZEHUA', 'VINAY'],
	numFails: 0,
};

const failureMission = {
	state: 'FAILURE',
	team: ['CRAIGM', 'ZEHUA'],
	numFails: 1,
};

const failureMissionMultiple = {
	state: 'FAILURE',
	team: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE'],
	numFails: 2,
};

export const MissionSucceeded: Story = {
	args: {
		avalon: createMockAvalon(successMission, ['MISSION_RESULT']),
	},
	parameters: {
		docs: {
			description: {
				story: 'Successful mission with no fail votes. Shows team members and success animation.',
			},
		},
	},
};

export const MissionFailedSingle: Story = {
	args: {
		avalon: createMockAvalon(failureMission, ['MISSION_RESULT']),
	},
	parameters: {
		docs: {
			description: {
				story: 'Failed mission with 1 sabotage vote. Shows which players were on the mission.',
			},
		},
	},
};

export const MissionFailedMultiple: Story = {
	args: {
		avalon: createMockAvalon(failureMissionMultiple, ['MISSION_RESULT']),
	},
	parameters: {
		docs: {
			description: {
				story: 'Failed mission with 2 sabotage votes. Multiple fails provide important deduction information.',
			},
		},
	},
};

export const Hidden: Story = {
	args: {
		avalon: createMockAvalon(successMission),
	},
	parameters: {
		docs: {
			description: {
				story: 'Component in hidden state, waiting for MISSION_RESULT event to display.',
			},
		},
	},
};

export const InteractiveExample: Story = {
	render: () => {
		const [mockAvalon] = useState(() => createMockAvalon(successMission));

		return (
			<div>
				<div style={{marginBottom: '16px'}}>
					<button onClick={() => mockAvalon.triggerEvent('MISSION_RESULT')}>Show Mission Result</button>
					<button
						onClick={() => mockAvalon.triggerEvent('GAME_ENDED')}
						style={{marginLeft: '8px'}}
					>
						Hide Dialog
					</button>
				</div>
				<MissionResultEventHandler avalon={mockAvalon} />
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Interactive demo with buttons to trigger mission result events. Try showing and hiding the modal.',
			},
		},
	},
};
