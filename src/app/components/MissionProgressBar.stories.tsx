import type {Meta, StoryObj} from '@storybook/react-vite-vite';
import {MissionProgressBarComponent} from './MissionProgressBar';
import {Mission} from '../models/game';

const meta: Meta<typeof MissionProgressBarComponent> = {
	title: 'Components/MissionProgressBar',
	component: MissionProgressBarComponent,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		missions: {
			description: 'Array of mission objects',
		},
		currentMissionIndex: {
			description: 'Index of the currently active mission',
			control: {type: 'number', min: 0, max: 4},
		},
		showDetails: {
			description: 'Whether to show mission details (team size, fails required)',
			control: 'boolean',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const exampleMissions: Mission[] = [
	{
		failsRequired: 1,
		teamSize: 2,
		proposals: [],
		state: 'SUCCESS',
		numFails: 0,
		team: ['Alice', 'Bob'],
	},
	{
		failsRequired: 1,
		teamSize: 3,
		proposals: [],
		state: 'SUCCESS',
		numFails: 0,
		team: ['Charlie', 'David', 'Eve'],
	},
	{
		failsRequired: 1,
		teamSize: 2,
		proposals: [],
		state: 'FAIL',
		numFails: 1,
		team: ['Frank', 'Grace'],
	},
	{
		failsRequired: 1,
		teamSize: 3,
		proposals: [],
		state: 'PENDING',
		team: [],
	},
	{
		failsRequired: 2,
		teamSize: 3,
		proposals: [],
		state: 'PENDING',
		team: [],
	},
];

export const Default: Story = {
	args: {
		missions: exampleMissions,
	},
};

export const WithCurrentMission: Story = {
	args: {
		missions: exampleMissions,
		currentMissionIndex: 3,
	},
};

export const WithDetails: Story = {
	args: {
		missions: exampleMissions,
		currentMissionIndex: 3,
		showDetails: true,
	},
};

export const AllSuccess: Story = {
	args: {
		missions: [
			{
				failsRequired: 1,
				teamSize: 2,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Alice', 'Bob'],
			},
			{
				failsRequired: 1,
				teamSize: 3,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Charlie', 'David', 'Eve'],
			},
			{
				failsRequired: 1,
				teamSize: 2,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Frank', 'Grace'],
			},
			{
				failsRequired: 1,
				teamSize: 3,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Henry', 'Ivy', 'Jack'],
			},
			{
				failsRequired: 2,
				teamSize: 3,
				proposals: [],
				state: 'SUCCESS',
				numFails: 1,
				team: ['Kelly', 'Leo', 'Max'],
			},
		],
		showDetails: true,
	},
};

export const MixedResults: Story = {
	args: {
		missions: [
			{
				failsRequired: 1,
				teamSize: 2,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Alice', 'Bob'],
			},
			{
				failsRequired: 1,
				teamSize: 3,
				proposals: [],
				state: 'FAIL',
				numFails: 1,
				team: ['Charlie', 'David', 'Eve'],
			},
			{
				failsRequired: 1,
				teamSize: 2,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Frank', 'Grace'],
			},
			{
				failsRequired: 1,
				teamSize: 3,
				proposals: [],
				state: 'FAIL',
				numFails: 2,
				team: ['Henry', 'Ivy', 'Jack'],
			},
			{
				failsRequired: 2,
				teamSize: 3,
				proposals: [],
				state: 'SUCCESS',
				numFails: 1,
				team: ['Kelly', 'Leo', 'Max'],
			},
		],
		showDetails: true,
	},
};

export const InProgress: Story = {
	args: {
		missions: [
			{
				failsRequired: 1,
				teamSize: 2,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Alice', 'Bob'],
			},
			{
				failsRequired: 1,
				teamSize: 3,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Charlie', 'David', 'Eve'],
			},
			{
				failsRequired: 1,
				teamSize: 2,
				proposals: [],
				state: 'PENDING',
				team: [],
			},
			{
				failsRequired: 1,
				teamSize: 3,
				proposals: [],
				state: 'PENDING',
				team: [],
			},
			{
				failsRequired: 2,
				teamSize: 3,
				proposals: [],
				state: 'PENDING',
				team: [],
			},
		],
		currentMissionIndex: 2,
		showDetails: true,
	},
};

export const SingleMission: Story = {
	args: {
		missions: [
			{
				failsRequired: 1,
				teamSize: 3,
				proposals: [],
				state: 'PENDING',
				team: [],
			},
		],
		currentMissionIndex: 0,
		showDetails: true,
	},
};

export const GameOverSuccess: Story = {
	name: 'Game Over - Resistance Victory',
	args: {
		missions: [
			{
				failsRequired: 1,
				teamSize: 2,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Alice', 'Bob'],
			},
			{
				failsRequired: 1,
				teamSize: 3,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Charlie', 'David', 'Eve'],
			},
			{
				failsRequired: 1,
				teamSize: 2,
				proposals: [],
				state: 'FAIL',
				numFails: 1,
				team: ['Frank', 'Grace'],
			},
			{
				failsRequired: 1,
				teamSize: 3,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Henry', 'Ivy', 'Jack'],
			},
			{
				failsRequired: 2,
				teamSize: 3,
				proposals: [],
				state: 'SUCCESS',
				numFails: 1,
				team: ['Kelly', 'Leo', 'Max'],
			},
		],
		showDetails: true,
	},
};

export const GameOverFail: Story = {
	name: 'Game Over - Spy Victory',
	args: {
		missions: [
			{
				failsRequired: 1,
				teamSize: 2,
				proposals: [],
				state: 'SUCCESS',
				numFails: 0,
				team: ['Alice', 'Bob'],
			},
			{
				failsRequired: 1,
				teamSize: 3,
				proposals: [],
				state: 'FAIL',
				numFails: 1,
				team: ['Charlie', 'David', 'Eve'],
			},
			{
				failsRequired: 1,
				teamSize: 2,
				proposals: [],
				state: 'FAIL',
				numFails: 1,
				team: ['Frank', 'Grace'],
			},
			{
				failsRequired: 1,
				teamSize: 3,
				proposals: [],
				state: 'FAIL',
				numFails: 2,
				team: ['Henry', 'Ivy', 'Jack'],
			},
			{
				failsRequired: 2,
				teamSize: 3,
				proposals: [],
				state: 'PENDING',
				team: [],
			},
		],
		showDetails: true,
	},
};
