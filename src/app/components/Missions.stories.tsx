import type {Meta, StoryObj} from '@storybook/react-vite';
import Missions from './Missions';

const meta: Meta<typeof Missions> = {
	title: 'Gameplay/Missions',
	component: Missions,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `The Missions component displays the progress of all 5 missions in an Avalon game.

## Features
- Visual representation of all 5 missions
- Shows success/fail status for completed missions
- Highlights the current mission
- Displays team size and fail requirements
- Shows proposal history for each mission
- Optionally includes in-game logs for debugging

## Mission States
- **PENDING**: Mission not yet attempted
- **SUCCESS**: Good team completed the mission successfully
- **FAIL**: Evil sabotaged the mission

## Game Flow
Good wins by succeeding 3 missions. Evil wins by failing 3 missions.

## Usage
\`\`\`tsx
import Missions from './Missions';

function Game() {
  return <Missions avalon={avalonApi} />;
}
\`\`\``,
			},
		},
	},
	argTypes: {
		avalon: {
			control: 'object',
			description: 'Avalon game API object containing missions array and game state information',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const createTeamWithJoinMethod = (players: string[]): string[] & {joinWithAnd: () => string} => {
	const team = players as string[] & {joinWithAnd: () => string};
	team.joinWithAnd = () => {
		if (players.length === 0) return '';
		if (players.length === 1) return players[0];
		if (players.length === 2) return `${players[0]} and ${players[1]}`;
		return `${players.slice(0, -1).join(', ')} and ${players[players.length - 1]}`;
	};
	return team;
};

const mockTeam = createTeamWithJoinMethod(['CRAIGM', 'ZEHUA', 'VINAY']);

const mockGame = {
	id: 'mock-game-1',
	timeCreated: new Date('2024-01-01'),
	missions: [
		{
			state: 'SUCCESS' as const,
			teamSize: 2,
			failsRequired: 1,
			numFails: 0,
			team: mockTeam,
			votes: [],
			evilOnTeam: [],
			proposals: [
				{
					proposer: 'CRAIGM',
					state: 'APPROVED' as const,
					team: ['CRAIGM', 'ZEHUA'],
					votes: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE'],
				},
			],
		},
		{
			state: 'FAIL' as const,
			teamSize: 3,
			failsRequired: 1,
			numFails: 1,
			team: mockTeam,
			votes: [],
			evilOnTeam: ['KEN'],
			proposals: [
				{
					proposer: 'ZEHUA',
					state: 'REJECTED' as const,
					team: ['ZEHUA', 'VINAY', 'LUKEE'],
					votes: ['ZEHUA', 'VINAY'],
				},
				{
					proposer: 'VINAY',
					state: 'APPROVED' as const,
					team: ['CRAIGM', 'ZEHUA', 'VINAY'],
					votes: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
				},
			],
		},
		{
			state: 'PENDING' as const,
			teamSize: 2,
			failsRequired: 1,
			numFails: 0,
			team: mockTeam,
			votes: [],
			evilOnTeam: [],
			proposals: [
				{
					proposer: 'LUKEE',
					state: 'PENDING' as const,
					team: ['LUKEE', 'KEN'],
					votes: [],
				},
			],
		},
		{
			state: 'PENDING' as const,
			teamSize: 3,
			failsRequired: 2,
			numFails: 0,
			team: mockTeam,
			votes: [],
			evilOnTeam: [],
			proposals: [],
		},
		{
			state: 'PENDING' as const,
			teamSize: 3,
			failsRequired: 1,
			numFails: 0,
			team: mockTeam,
			votes: [],
			evilOnTeam: [],
			proposals: [],
		},
	],
	currentMissionIdx: 2,
	phase: 'PROPOSAL',
	players: [
		{uid: '1', name: 'CRAIGM'},
		{uid: '2', name: 'ZEHUA'},
		{uid: '3', name: 'VINAY'},
		{uid: '4', name: 'LUKEE'},
		{uid: '5', name: 'KEN'},
	],
	options: {
		inGameLog: false,
	},
};

const mockAvalonData = {
	game: mockGame,
	user: {name: 'CRAIGM'},
	config: {roleMap: {}},
	lobby: {
		game: mockGame,
	},
};

const mockAvalonWithLogs = {
	...mockAvalonData,
	game: {
		...mockAvalonData.game,
		options: {
			inGameLog: true,
		},
	},
};

const realGameMissions = [
	{
		state: 'FAIL' as const,
		teamSize: 3,
		failsRequired: 1,
		numFails: 1,
		team: createTeamWithJoinMethod(['LUKEE', 'KEN', 'VINAY']),
		evilOnTeam: ['VINAY'],
		proposals: [
			{
				proposer: 'ROB',
				state: 'REJECTED' as const,
				team: ['ROB', 'KEN', 'JUSTIN'],
				votes: ['ROB', 'KEN', 'JUSTIN', 'FLORA'],
			},
			{
				proposer: 'JUSTIN',
				state: 'APPROVED' as const,
				team: ['LUKEE', 'KEN', 'VINAY'],
				votes: ['JUSTIN', 'FLORA', 'VINAY', 'KEN', 'LUKEE'],
			},
		],
	},
	{
		state: 'SUCCESS' as const,
		teamSize: 4,
		failsRequired: 1,
		numFails: 0,
		team: createTeamWithJoinMethod(['TIFANY', 'ROB', 'ZEHUA', 'CRAIGM']),
		evilOnTeam: [],
		proposals: [
			{
				proposer: 'TIFANY',
				state: 'APPROVED' as const,
				team: ['TIFANY', 'ROB', 'ZEHUA', 'CRAIGM'],
				votes: ['CRAIGM', 'ZEHUA', 'JUSTIN', 'KEN', 'FLORA'],
			},
		],
	},
	{
		state: 'PENDING' as const,
		teamSize: 4,
		failsRequired: 1,
		numFails: 0,
		team: createTeamWithJoinMethod([]),
		evilOnTeam: [],
		proposals: [],
	},
	{
		state: 'PENDING' as const,
		teamSize: 5,
		failsRequired: 2,
		numFails: 0,
		team: createTeamWithJoinMethod([]),
		evilOnTeam: [],
		proposals: [],
	},
	{
		state: 'PENDING' as const,
		teamSize: 5,
		failsRequired: 1,
		numFails: 0,
		team: createTeamWithJoinMethod([]),
		evilOnTeam: [],
		proposals: [],
	},
];

const realGame = {
	id: 'real-game-1',
	timeCreated: new Date('2024-01-01'),
	missions: realGameMissions,
	currentMissionIdx: 2,
	phase: 'PROPOSAL',
	players: [
		{uid: '1', name: 'CRAIGM'},
		{uid: '2', name: 'ZEHUA'},
		{uid: '3', name: 'VINAY'},
		{uid: '4', name: 'LUKEE'},
		{uid: '5', name: 'KEN'},
		{uid: '6', name: 'ROB'},
		{uid: '7', name: 'JUSTIN'},
		{uid: '8', name: 'TIFANY'},
		{uid: '9', name: 'FLORA'},
	],
	options: {
		inGameLog: true,
	},
};

const realGameData = {
	game: realGame,
	user: {name: 'CRAIGM'},
	config: {roleMap: {}},
	lobby: {
		game: realGame,
	},
};

export const Default: Story = {
	args: {
		avalon: mockAvalonData,
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows a game in progress with 1 successful mission, 1 failed mission, and working on the 3rd mission.',
			},
		},
	},
};

export const WithInGameLog: Story = {
	args: {
		avalon: mockAvalonWithLogs,
	},
	parameters: {
		docs: {
			description: {
				story: 'Same as default but with in-game logging enabled. Useful for debugging and seeing detailed proposal information.',
			},
		},
	},
};

export const RealGameData: Story = {
	args: {
		avalon: realGameData as any,
	},
	parameters: {
		docs: {
			description: {
				story: 'Example from a real 9-player game showing actual mission data and voting patterns.',
			},
		},
	},
};

export const AllPending: Story = {
	args: {
		avalon: {
			...mockAvalonData,
			game: {
				...mockAvalonData.game,
				missions: mockAvalonData.game.missions.map((m) => ({...m, state: 'PENDING' as const})),
				currentMissionIdx: 0,
			},
			lobby: {
				game: {
					...mockAvalonData.game,
					missions: mockAvalonData.game.missions.map((m) => ({...m, state: 'PENDING' as const})),
					currentMissionIdx: 0,
				},
			},
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the initial game state where no missions have been attempted yet.',
			},
		},
	},
};

export const GoodWins: Story = {
	args: {
		avalon: {
			...mockAvalonData,
			game: {
				...mockAvalonData.game,
				missions: [
					{...mockAvalonData.game.missions[0], state: 'SUCCESS' as const},
					{...mockAvalonData.game.missions[1], state: 'SUCCESS' as const},
					{...mockAvalonData.game.missions[2], state: 'SUCCESS' as const},
					{...mockAvalonData.game.missions[3], state: 'PENDING' as const},
					{...mockAvalonData.game.missions[4], state: 'PENDING' as const},
				],
				currentMissionIdx: 3,
				phase: 'ASSASSINATION',
			},
			lobby: {
				game: {
					...mockAvalonData.game,
					missions: [
						{...mockAvalonData.game.missions[0], state: 'SUCCESS' as const},
						{...mockAvalonData.game.missions[1], state: 'SUCCESS' as const},
						{...mockAvalonData.game.missions[2], state: 'SUCCESS' as const},
						{...mockAvalonData.game.missions[3], state: 'PENDING' as const},
						{...mockAvalonData.game.missions[4], state: 'PENDING' as const},
					],
					currentMissionIdx: 3,
					phase: 'ASSASSINATION',
				},
			},
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Good has won 3 missions! The game is now in assassination phase where evil tries to identify Merlin.',
			},
		},
	},
};

export const EvilWins: Story = {
	args: {
		avalon: {
			...mockAvalonData,
			game: {
				...mockAvalonData.game,
				missions: [
					{...mockAvalonData.game.missions[0], state: 'FAIL' as const},
					{...mockAvalonData.game.missions[1], state: 'SUCCESS' as const},
					{...mockAvalonData.game.missions[2], state: 'FAIL' as const},
					{...mockAvalonData.game.missions[3], state: 'FAIL' as const},
					{...mockAvalonData.game.missions[4], state: 'PENDING' as const},
				],
				currentMissionIdx: 4,
				phase: 'GAME_OVER',
			},
			lobby: {
				game: {
					...mockAvalonData.game,
					missions: [
						{...mockAvalonData.game.missions[0], state: 'FAIL' as const},
						{...mockAvalonData.game.missions[1], state: 'SUCCESS' as const},
						{...mockAvalonData.game.missions[2], state: 'FAIL' as const},
						{...mockAvalonData.game.missions[3], state: 'FAIL' as const},
						{...mockAvalonData.game.missions[4], state: 'PENDING' as const},
					],
					currentMissionIdx: 4,
					phase: 'GAME_OVER',
				},
			},
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Evil has won by failing 3 missions! The game is over and evil team celebrates their victory.',
			},
		},
	},
};
