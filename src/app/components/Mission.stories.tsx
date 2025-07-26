import type {Meta, StoryObj} from '@storybook/react-vite-vite';
import {MissionComponent} from './Mission';

const meta: Meta<typeof MissionComponent> = {
	title: 'Components/Mission',
	component: MissionComponent,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		mission: {
			description: 'Mission object with team size, fails required, and state',
		},
		missionNumber: {
			description: 'The mission number to display',
			control: {type: 'number', min: 1, max: 5},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const PendingMission: Story = {
	args: {
		mission: {
			teamSize: 3,
			failsRequired: 1,
			proposals: [],
			state: 'PENDING',
			team: [],
		},
		missionNumber: 1,
	},
};

export const SuccessfulMission: Story = {
	args: {
		mission: {
			teamSize: 4,
			failsRequired: 1,
			proposals: [],
			state: 'SUCCESS',
			numFails: 0,
			team: ['Alice', 'Bob', 'Charlie', 'Diana'],
		},
		missionNumber: 2,
	},
};

export const FailedMission: Story = {
	args: {
		mission: {
			teamSize: 5,
			failsRequired: 2,
			proposals: [],
			state: 'FAIL',
			numFails: 2,
			team: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
		},
		missionNumber: 3,
	},
};

export const WithChildren: Story = {
	args: {
		mission: {
			teamSize: 4,
			failsRequired: 1,
			proposals: [],
			state: 'PENDING',
			team: [],
		},
		missionNumber: 4,
		children: (
			<div style={{marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f0f0f0'}}>
				<p>Additional mission details or controls can go here</p>
			</div>
		),
	},
};

export const TwoFailsRequired: Story = {
	args: {
		mission: {
			teamSize: 5,
			failsRequired: 2,
			proposals: [],
			state: 'PENDING',
			team: [],
		},
		missionNumber: 5,
	},
};
