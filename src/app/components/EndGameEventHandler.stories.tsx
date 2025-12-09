import type {Meta, StoryObj} from '@storybook/react-vite';
import EndGameEventHandler from './EndGameEventHandler';

const meta: Meta<typeof EndGameEventHandler> = {
	title: 'Game/Events/EndGameEventHandler',
	component: EndGameEventHandler,
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockAvalon = (gameOutcome: 'GOOD_WIN' | 'EVIL_WIN' | 'CANCELED', assassinated?: string) => {
	const eventListeners: Array<(event: string) => void> = [];

	return {
		user: {
			name: 'CRAIGM',
		},
		game: {
			id: 'mock-game-id',
			timeCreated: new Date('2025-01-01T00:00:00Z'),
			players: [
				{uid: 'uid-1', name: 'CRAIGM'},
				{uid: 'uid-2', name: 'ZEHUA'},
				{uid: 'uid-3', name: 'VINAY'},
				{uid: 'uid-4', name: 'LUKEE'},
				{uid: 'uid-5', name: 'KEN'},
			],
			missions: [
				{
					proposals: [
						{
							proposer: 'CRAIGM',
							team: ['CRAIGM', 'ZEHUA'],
							votes: ['CRAIGM', 'ZEHUA', 'VINAY'],
							state: 'APPROVED' as const,
						},
					],
					team: ['CRAIGM', 'ZEHUA'],
					votes: ['CRAIGM', 'ZEHUA', 'VINAY'],
					state: 'SUCCESS' as const,
					teamSize: 2,
					evilOnTeam: [],
					failsRequired: 1,
					numFails: 0,
				},
				{
					proposals: [
						{
							proposer: 'ZEHUA',
							team: ['ZEHUA', 'VINAY', 'LUKEE'],
							votes: ['ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
							state: 'APPROVED' as const,
						},
					],
					team: ['ZEHUA', 'VINAY', 'LUKEE'],
					votes: ['ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
					state: 'SUCCESS' as const,
					teamSize: 3,
					evilOnTeam: ['LUKEE'],
					failsRequired: 1,
					numFails: 0,
				},
			],
			outcome: {
				state: gameOutcome,
				message:
					gameOutcome === 'GOOD_WIN'
						? 'The forces of good have triumphed!'
						: gameOutcome === 'EVIL_WIN'
							? 'Evil has prevailed in this quest!'
							: 'The game has been canceled.',
				assassinated,
				roles: [
					{name: 'CRAIGM', role: 'Merlin', assassin: false},
					{name: 'ZEHUA', role: 'Percival', assassin: false},
					{name: 'VINAY', role: 'Loyal Servant of Arthur', assassin: false},
					{name: 'LUKEE', role: 'Morgana', assassin: false},
					{name: 'KEN', role: 'Assassin', assassin: true},
				],
				votes: [
					{CRAIGM: true, ZEHUA: true, VINAY: false, LUKEE: false, KEN: false},
					{CRAIGM: false, ZEHUA: true, VINAY: false, LUKEE: false, KEN: false},
				],
			},
		},
		lobby: {
			game: {
				id: 'mock-game-id',
				timeCreated: new Date('2025-01-01T00:00:00Z'),
				players: [
					{uid: 'uid-1', name: 'CRAIGM'},
					{uid: 'uid-2', name: 'ZEHUA'},
					{uid: 'uid-3', name: 'VINAY'},
					{uid: 'uid-4', name: 'LUKEE'},
					{uid: 'uid-5', name: 'KEN'},
				],
				missions: [],
				outcome: {
					state: gameOutcome,
					message: '',
					assassinated: undefined,
					roles: [],
					votes: [],
				},
			},
		},
		config: {
			roles: [
				{name: 'Merlin'},
				{name: 'Percival'},
				{name: 'Loyal Servant of Arthur'},
				{name: 'Morgana'},
				{name: 'Assassin'},
			],
			roleMap: {
				Merlin: {name: 'Merlin', team: 'good' as const, description: 'Knows the evil players'},
				Percival: {name: 'Percival', team: 'good' as const, description: 'Knows Merlin and Morgana'},
				'Loyal Servant of Arthur': {
					name: 'Loyal Servant of Arthur',
					team: 'good' as const,
					description: 'Loyal to good',
				},
				Morgana: {name: 'Morgana', team: 'evil' as const, description: 'Appears as Merlin'},
				Assassin: {name: 'Assassin', team: 'evil' as const, description: 'Can assassinate Merlin'},
			},
		},
		onEvent: (callback: (event: string) => void) => {
			eventListeners.push(callback);

			// Automatically trigger GAME_ENDED event
			setTimeout(() => {
				eventListeners.forEach((listener) => listener('GAME_ENDED'));
			}, 100);

			return () => {
				const index = eventListeners.indexOf(callback);
				if (index > -1) {
					eventListeners.splice(index, 1);
				}
			};
		},
		triggerEvent: (event: string) => {
			eventListeners.forEach((listener) => listener(event));
		},
	};
};

export const GoodWins: Story = {
	args: {
		avalon: createMockAvalon('GOOD_WIN'),
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the end game dialog when good wins the game.',
			},
		},
	},
};

export const EvilWins: Story = {
	args: {
		avalon: createMockAvalon('EVIL_WIN'),
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the end game dialog when evil wins the game.',
			},
		},
	},
};

export const EvilWinsWithAssassination: Story = {
	args: {
		avalon: createMockAvalon('EVIL_WIN', 'CRAIGM'),
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the end game dialog when evil wins by assassinating Merlin.',
			},
		},
	},
};

export const GameCanceled: Story = {
	args: {
		avalon: createMockAvalon('CANCELED'),
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the end game dialog when the game is canceled.',
			},
		},
	},
};

export const InteractiveControls: Story = {
	render: () => {
		const mockAvalon = createMockAvalon('GOOD_WIN', 'CRAIGM');

		return (
			<div>
				<div style={{marginBottom: '16px'}}>
					<button onClick={() => mockAvalon.triggerEvent('GAME_ENDED')}>Show End Game Dialog</button>
					<button
						onClick={() => mockAvalon.triggerEvent('GAME_STARTED')}
						style={{marginLeft: '8px'}}
					>
						Hide Dialog (Game Started)
					</button>
				</div>
				<EndGameEventHandler avalon={mockAvalon} />
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Interactive controls to show and hide the end game dialog.',
			},
		},
	},
};
