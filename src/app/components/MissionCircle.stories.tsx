import type {Meta, StoryObj} from '@storybook/react-vite-vite';
import {MissionCircle} from './MissionCircle';

const meta: Meta<typeof MissionCircle> = {
	title: 'Components/MissionCircle',
	component: MissionCircle,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		mission: {
			description: 'Mission object containing state information',
		},
		missionNumber: {
			description: 'The mission number to display in the circle',
			control: {type: 'number', min: 1, max: 5},
		},
		size: {
			description: 'Diameter of the circle in pixels',
			control: {type: 'number', min: 30, max: 120},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
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

export const Success: Story = {
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

export const Failed: Story = {
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

export const LargeSize: Story = {
	args: {
		mission: {
			teamSize: 3,
			failsRequired: 1,
			proposals: [],
			state: 'SUCCESS',
			team: [],
		},
		missionNumber: 4,
		size: 100,
	},
};

export const SmallSize: Story = {
	args: {
		mission: {
			teamSize: 3,
			failsRequired: 1,
			proposals: [],
			state: 'FAIL',
			team: [],
		},
		missionNumber: 5,
		size: 40,
	},
};

export const AllMissionStates: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
			<MissionCircle
				mission={{
					teamSize: 3,
					failsRequired: 1,
					proposals: [],
					state: 'PENDING',
					team: [],
				}}
				missionNumber={1}
			/>
			<MissionCircle
				mission={{
					teamSize: 4,
					failsRequired: 1,
					proposals: [],
					state: 'SUCCESS',
					team: [],
				}}
				missionNumber={2}
			/>
			<MissionCircle
				mission={{
					teamSize: 5,
					failsRequired: 2,
					proposals: [],
					state: 'FAIL',
					team: [],
				}}
				missionNumber={3}
			/>
		</div>
	),
};

export const MissionSequence: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
			{[1, 2, 3, 4, 5].map((number) => (
				<MissionCircle
					key={number}
					mission={{
						teamSize: number + 2,
						failsRequired: number > 3 ? 2 : 1,
						proposals: [],
						state: number <= 2 ? 'SUCCESS' : number === 3 ? 'FAIL' : 'PENDING',
						team: [],
					}}
					missionNumber={number}
				/>
			))}
		</div>
	),
};
