import type {Meta, StoryObj} from '@storybook/react-vite';
import {MissionResultComponent} from './MissionResult';

const meta: Meta<typeof MissionResultComponent> = {
	title: 'Components/MissionResult',
	component: MissionResultComponent,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SuccessNoFails: Story = {
	args: {
		mission: {
			teamSize: 3,
			failsRequired: 1,
			proposals: [],
			state: 'SUCCESS',
			numFails: 0,
			team: ['Alice', 'Bob', 'Charlie'],
		},
		missionNumber: 1,
	},
};

export const FailOneFail: Story = {
	args: {
		mission: {
			teamSize: 4,
			failsRequired: 1,
			proposals: [],
			state: 'FAIL',
			numFails: 1,
			team: ['Alice', 'Bob', 'Charlie', 'Diana'],
		},
		missionNumber: 2,
	},
};

export const FailMultipleFails: Story = {
	args: {
		mission: {
			teamSize: 5,
			failsRequired: 2,
			proposals: [],
			state: 'FAIL',
			numFails: 3,
			team: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
		},
		missionNumber: 3,
	},
};

export const PendingMission: Story = {
	args: {
		mission: {
			teamSize: 3,
			failsRequired: 1,
			proposals: [],
			state: 'PENDING',
			team: [],
		},
	},
};

export const SuccessLargeTeam: Story = {
	args: {
		mission: {
			teamSize: 5,
			failsRequired: 2,
			proposals: [],
			state: 'SUCCESS',
			numFails: 1,
			team: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
		},
		missionNumber: 5,
	},
};
