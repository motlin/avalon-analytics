import type {Meta, StoryObj} from '@storybook/react-vite';
import {GameComponent} from './Game';
import type {Game} from '../models/game';

const meta: Meta<typeof GameComponent> = {
	title: 'Components/Game',
	component: GameComponent,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Base game structure used for in-progress example
const baseGame: Game = {
	id: 'game-in-progress',
	timeCreated: new Date('2025-07-14T14:30:00'),
	players: [
		{uid: 'KkpBQyWuNYgUzo9EWlgdcjI3E8Z2', name: 'CRAIGM'},
		{uid: 'xZLkr6BbEXZjxfe0RIMHL7QbnEZ2', name: 'FLORA'},
		{uid: 'azcdrRTveQgtcqFvdRoErWeIbv52', name: 'ROB'},
		{uid: '8OmVj2JuQiQb3JKfSrxaZeoZW6E2', name: 'STEVEN'},
		{uid: 'AKvuJwDnjhTbaLoOGcywuKO1S013', name: 'JOSH'},
		{uid: 'PU8n22WDl6UajwGWaxWFTQu0fOA2', name: 'JUSTIN'},
		{uid: 'xsd8LG6MrbXCA9Uobui0Jf9QqJW2', name: 'LUKE'},
		{uid: 'sTASfTmbLkOIYqjTzlVuyh5Z8qp2', name: 'KEN'},
	],
	missions: [
		{
			teamSize: 3,
			failsRequired: 1,
			state: 'SUCCESS',
			team: ['JOSH', 'JUSTIN', 'LUKE'],
			proposals: [
				{
					proposer: 'FLORA',
					team: ['FLORA', 'CRAIGM', 'ROB'],
					votes: ['FLORA', 'ROB', 'CRAIGM', 'KEN'],
					state: 'REJECTED',
				},
				{
					proposer: 'JOSH',
					team: ['JOSH', 'JUSTIN', 'LUKE'],
					votes: ['FLORA', 'JOSH', 'JUSTIN', 'LUKE', 'KEN'],
					state: 'APPROVED',
				},
			],
			numFails: 0,
		},
		{
			teamSize: 4,
			failsRequired: 1,
			state: 'FAIL',
			team: ['CRAIGM', 'FLORA', 'JUSTIN', 'JOSH'],
			proposals: [
				{
					proposer: 'JUSTIN',
					team: ['CRAIGM', 'FLORA', 'JUSTIN', 'JOSH'],
					votes: ['JUSTIN', 'FLORA', 'JOSH', 'CRAIGM', 'KEN'],
					state: 'APPROVED',
				},
			],
			numFails: 1,
		},
		{
			teamSize: 4,
			failsRequired: 1,
			state: 'PENDING',
			team: [],
			proposals: [],
		},
		{
			teamSize: 5,
			failsRequired: 2,
			state: 'PENDING',
			team: [],
			proposals: [],
		},
		{
			teamSize: 5,
			failsRequired: 1,
			state: 'PENDING',
			team: [],
			proposals: [],
		},
	],
	options: {
		inGameLog: false,
	},
};

export const InProgress: Story = {
	args: {
		game: baseGame,
	},
};

export const GoodWinsNoAssassination: Story = {
	args: {
		game: {
			id: '2025-07-02T20:15:52.545Z_RFH',
			timeCreated: new Date('2025-07-02T20:15:52.545Z'),
			timeFinished: new Date('2025-07-02T20:36:42.951Z'),
			players: [
				{uid: 'KkpBQyWuNYgUzo9EWlgdcjI3E8Z2', name: 'CRAIGM', role: 'EVIL MINION'},
				{uid: 'xZLkr6BbEXZjxfe0RIMHL7QbnEZ2', name: 'FLORA', role: 'LOYAL FOLLOWER'},
				{uid: 'azcdrRTveQgtcqFvdRoErWeIbv52', name: 'ROB', role: 'LOYAL FOLLOWER'},
				{uid: '8OmVj2JuQiQb3JKfSrxaZeoZW6E2', name: 'STEVEN', role: 'MERLIN'},
				{uid: 'AKvuJwDnjhTbaLoOGcywuKO1S013', name: 'JOSH', role: 'OBERON'},
				{uid: 'PU8n22WDl6UajwGWaxWFTQu0fOA2', name: 'JUSTIN', role: 'LOYAL FOLLOWER'},
				{uid: 'xsd8LG6MrbXCA9Uobui0Jf9QqJW2', name: 'LUKE', role: 'MORGANA'},
				{uid: 'sTASfTmbLkOIYqjTzlVuyh5Z8qp2', name: 'KEN', role: 'PERCIVAL'},
			],
			missions: [
				{
					state: 'SUCCESS',
					teamSize: 3,
					failsRequired: 1,
					team: ['JOSH', 'JUSTIN', 'LUKE'],
					proposals: [
						{
							proposer: 'JOSH',
							state: 'APPROVED',
							team: ['JOSH', 'JUSTIN', 'LUKE'],
							votes: ['FLORA', 'JOSH', 'JUSTIN', 'LUKE', 'KEN'],
						},
					],
					numFails: 0,
				},
				{
					state: 'FAIL',
					teamSize: 4,
					failsRequired: 1,
					team: ['CRAIGM', 'FLORA', 'JUSTIN', 'JOSH'],
					proposals: [
						{
							proposer: 'JUSTIN',
							state: 'APPROVED',
							team: ['CRAIGM', 'FLORA', 'JUSTIN', 'JOSH'],
							votes: ['JUSTIN', 'FLORA', 'JOSH', 'CRAIGM', 'KEN'],
						},
					],
					numFails: 1,
				},
				{
					state: 'SUCCESS',
					teamSize: 4,
					failsRequired: 1,
					team: ['ROB', 'STEVEN', 'FLORA', 'JUSTIN'],
					proposals: [
						{
							proposer: 'ROB',
							state: 'APPROVED',
							team: ['ROB', 'STEVEN', 'FLORA', 'JUSTIN'],
							votes: ['ROB', 'JUSTIN', 'FLORA', 'STEVEN', 'KEN', 'LUKE', 'CRAIGM'],
						},
					],
					numFails: 0,
				},
				{
					state: 'SUCCESS',
					teamSize: 5,
					failsRequired: 2,
					team: ['LUKE', 'ROB', 'STEVEN', 'FLORA', 'JUSTIN'],
					proposals: [
						{
							proposer: 'LUKE',
							state: 'APPROVED',
							team: ['LUKE', 'ROB', 'STEVEN', 'FLORA', 'JUSTIN'],
							votes: ['ROB', 'JUSTIN', 'FLORA', 'LUKE', 'STEVEN'],
						},
					],
					numFails: 1,
				},
				{
					state: 'PENDING',
					teamSize: 5,
					failsRequired: 1,
					team: [],
					proposals: [],
				},
			],
			outcome: {
				state: 'GOOD_WIN',
				message: 'Three successful missions',
				assassinated: 'ROB',
				roles: [
					{name: 'LUKE', role: 'MORGANA', assassin: false},
					{name: 'JOSH', role: 'OBERON', assassin: false},
					{name: 'CRAIGM', role: 'EVIL MINION', assassin: true},
					{name: 'STEVEN', role: 'MERLIN', assassin: false},
					{name: 'KEN', role: 'PERCIVAL', assassin: false},
					{name: 'JUSTIN', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'ROB', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'FLORA', role: 'LOYAL FOLLOWER', assassin: false},
				],
			},
			options: {inGameLog: false},
		},
	},
};

export const EvilWinsAssassination: Story = {
	args: {
		game: {
			id: '2025-07-02T19:51:02.095Z_RFH',
			timeCreated: new Date('2025-07-02T19:51:02.095Z'),
			timeFinished: new Date('2025-07-02T20:13:33.822Z'),
			players: [
				{uid: 'KkpBQyWuNYgUzo9EWlgdcjI3E8Z2', name: 'CRAIGM', role: 'OBERON'},
				{uid: 'xZLkr6BbEXZjxfe0RIMHL7QbnEZ2', name: 'FLORA', role: 'EVIL MINION'},
				{uid: 'azcdrRTveQgtcqFvdRoErWeIbv52', name: 'ROB', role: 'LOYAL FOLLOWER'},
				{uid: '8OmVj2JuQiQb3JKfSrxaZeoZW6E2', name: 'STEVEN', role: 'PERCIVAL'},
				{uid: 'AKvuJwDnjhTbaLoOGcywuKO1S013', name: 'JOSH', role: 'LOYAL FOLLOWER'},
				{uid: 'PU8n22WDl6UajwGWaxWFTQu0fOA2', name: 'JUSTIN', role: 'MERLIN'},
				{uid: 'xsd8LG6MrbXCA9Uobui0Jf9QqJW2', name: 'LUKE', role: 'LOYAL FOLLOWER'},
				{uid: 'sTASfTmbLkOIYqjTzlVuyh5Z8qp2', name: 'KEN', role: 'MORGANA'},
			],
			missions: [
				{
					state: 'FAIL',
					teamSize: 3,
					failsRequired: 1,
					team: ['STEVEN', 'FLORA', 'KEN'],
					proposals: [
						{
							proposer: 'STEVEN',
							state: 'APPROVED',
							team: ['STEVEN', 'FLORA', 'KEN'],
							votes: ['FLORA', 'ROB', 'JUSTIN', 'LUKE', 'CRAIGM', 'STEVEN', 'JOSH', 'KEN'],
						},
					],
					numFails: 1,
				},
				{
					state: 'SUCCESS',
					teamSize: 4,
					failsRequired: 1,
					team: ['JUSTIN', 'LUKE', 'STEVEN', 'JOSH'],
					proposals: [
						{
							proposer: 'JUSTIN',
							state: 'APPROVED',
							team: ['JUSTIN', 'LUKE', 'STEVEN', 'JOSH'],
							votes: ['JUSTIN', 'LUKE', 'JOSH', 'STEVEN', 'KEN'],
						},
					],
					numFails: 0,
				},
				{
					state: 'SUCCESS',
					teamSize: 4,
					failsRequired: 1,
					team: ['LUKE', 'JUSTIN', 'JOSH', 'STEVEN'],
					proposals: [
						{
							proposer: 'LUKE',
							state: 'APPROVED',
							team: ['LUKE', 'JUSTIN', 'JOSH', 'STEVEN'],
							votes: ['FLORA', 'LUKE', 'JUSTIN', 'JOSH', 'KEN', 'STEVEN'],
						},
					],
					numFails: 0,
				},
				{
					state: 'SUCCESS',
					teamSize: 5,
					failsRequired: 2,
					team: ['ROB', 'STEVEN', 'JOSH', 'JUSTIN', 'LUKE'],
					proposals: [
						{
							proposer: 'ROB',
							state: 'APPROVED',
							team: ['ROB', 'STEVEN', 'JOSH', 'JUSTIN', 'LUKE'],
							votes: ['ROB', 'JUSTIN', 'STEVEN', 'LUKE', 'JOSH', 'KEN'],
						},
					],
					numFails: 0,
				},
				{
					state: 'PENDING',
					teamSize: 5,
					failsRequired: 1,
					team: [],
					proposals: [],
				},
			],
			outcome: {
				state: 'EVIL_WIN',
				message: 'Merlin assassinated',
				assassinated: 'JUSTIN',
				roles: [
					{name: 'KEN', role: 'MORGANA', assassin: false},
					{name: 'CRAIGM', role: 'OBERON', assassin: false},
					{name: 'FLORA', role: 'EVIL MINION', assassin: true},
					{name: 'JUSTIN', role: 'MERLIN', assassin: false},
					{name: 'STEVEN', role: 'PERCIVAL', assassin: false},
					{name: 'ROB', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'LUKE', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'JOSH', role: 'LOYAL FOLLOWER', assassin: false},
				],
			},
			options: {inGameLog: false},
		},
	},
};

export const EvilWinsThreeFails: Story = {
	args: {
		game: {
			id: '2024-02-07T20:11:06.304Z_HMQ',
			timeCreated: new Date('2024-02-07T20:11:06.304Z'),
			timeFinished: new Date('2024-02-07T21:06:45.162Z'),
			players: [
				{uid: 'KkpBQyWuNYgUzo9EWlgdcjI3E8Z2', name: 'CRAIGM', role: 'EVIL MINION'},
				{uid: 'Tbzfh3CZnbgf2gtocnG53EefcKZ2', name: 'ALLEN', role: 'EVIL MINION'},
				{uid: 'wqfRyNPzBWPGRpvume6YNBKUeLh1', name: 'JARED', role: 'ASSASSIN'},
				{uid: 'tzNPuXLWgLO8jiBI1szD5NXBF1g2', name: 'ANDRES', role: 'LOYAL FOLLOWER'},
				{uid: 'hCwk2D7gDnNvty6wtKVBEVkiAd62', name: 'STEVEN', role: 'PERCIVAL'},
				{uid: 'ff95xlTjLHQZp7cukitOG9ADTty1', name: 'BJORN', role: 'LOYAL FOLLOWER'},
				{uid: 'q4Yk4uVjiZdIGAkBvOMyAtosgAf2', name: 'MANDEEP', role: 'LOYAL FOLLOWER'},
				{uid: 'Fz8u217SmBbU8xnuTZXCv8BqMrh2', name: 'ANDREWR', role: 'LOYAL FOLLOWER'},
				{uid: 'lmNuIA15hrTsOWRFGHLWQ8KPBcg2', name: 'VINAY', role: 'MERLIN'},
				{uid: 'rkj79zqVHeNm8a37qpxUkx96dim2', name: 'ROB', role: 'EVIL MINION'},
			],
			missions: [
				{
					state: 'SUCCESS',
					teamSize: 3,
					failsRequired: 1,
					team: ['ALLEN', 'CRAIGM', 'ROB'],
					proposals: [
						{
							proposer: 'ALLEN',
							state: 'APPROVED',
							team: ['ALLEN', 'CRAIGM', 'ROB'],
							votes: ['MANDEEP', 'ROB', 'ANDREWR', 'BJORN', 'STEVEN', 'JARED', 'CRAIGM', 'ALLEN', 'VINAY', 'ANDRES'],
						},
					],
					numFails: 0,
				},
				{
					state: 'FAIL',
					teamSize: 4,
					failsRequired: 1,
					team: ['ANDRES', 'ROB', 'BJORN', 'STEVEN'],
					proposals: [
						{
							proposer: 'BJORN',
							state: 'APPROVED',
							team: ['ANDRES', 'ROB', 'BJORN', 'STEVEN'],
							votes: ['ROB', 'BJORN', 'STEVEN', 'JARED', 'VINAY', 'ANDRES'],
						},
					],
					numFails: 1,
				},
				{
					state: 'FAIL',
					teamSize: 4,
					failsRequired: 1,
					team: ['CRAIGM', 'BJORN', 'ANDRES', 'ROB'],
					proposals: [
						{
							proposer: 'CRAIGM',
							state: 'APPROVED',
							team: ['CRAIGM', 'BJORN', 'ANDRES', 'ROB'],
							votes: ['MANDEEP', 'ROB', 'ANDREWR', 'BJORN', 'STEVEN', 'CRAIGM', 'JARED', 'ALLEN', 'VINAY', 'ANDRES'],
						},
					],
					numFails: 1,
				},
				{
					state: 'SUCCESS',
					teamSize: 5,
					failsRequired: 2,
					team: ['ROB', 'BJORN', 'ANDRES', 'MANDEEP', 'ANDREWR'],
					proposals: [
						{
							proposer: 'BJORN',
							state: 'APPROVED',
							team: ['ROB', 'BJORN', 'ANDRES', 'MANDEEP', 'ANDREWR'],
							votes: ['MANDEEP', 'ROB', 'ANDREWR', 'BJORN', 'JARED', 'CRAIGM', 'ALLEN', 'VINAY', 'ANDRES'],
						},
					],
					numFails: 0,
				},
				{
					state: 'FAIL',
					teamSize: 5,
					failsRequired: 1,
					team: ['CRAIGM', 'ALLEN', 'JARED', 'ROB', 'MANDEEP'],
					proposals: [
						{
							proposer: 'ROB',
							state: 'APPROVED',
							team: ['CRAIGM', 'ALLEN', 'JARED', 'ROB', 'MANDEEP'],
							votes: ['MANDEEP', 'ROB', 'JARED', 'CRAIGM', 'ALLEN', 'VINAY', 'ANDRES'],
						},
					],
					numFails: 4,
				},
			],
			outcome: {
				state: 'EVIL_WIN',
				message: 'Three failed missions',
				assassinated: null,
				roles: [
					{name: 'MANDEEP', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'ROB', role: 'EVIL MINION', assassin: false},
					{name: 'ANDREWR', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'BJORN', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'STEVEN', role: 'PERCIVAL', assassin: false},
					{name: 'JARED', role: 'ASSASSIN', assassin: true},
					{name: 'CRAIGM', role: 'EVIL MINION', assassin: false},
					{name: 'ALLEN', role: 'EVIL MINION', assassin: false},
					{name: 'VINAY', role: 'MERLIN', assassin: false},
					{name: 'ANDRES', role: 'LOYAL FOLLOWER', assassin: false},
				],
			},
			options: {inGameLog: false},
		},
	},
};

export const EvilWinsFiveRejectedProposals: Story = {
	args: {
		game: {
			id: '2025-01-08T21:22:20.110Z_DVH',
			timeCreated: new Date('2025-01-08T21:22:20.110Z'),
			timeFinished: new Date('2025-01-08T21:48:11.452Z'),
			players: [
				{uid: 'F8zswZe0jiXHwA92csr2My7xuOO2', name: 'ALLEN', role: 'MORGANA'},
				{uid: 'OlK1hriBd5eCevtOkCp7iAoKld53', name: 'NATE', role: 'ASSASSIN'},
				{uid: 'fcjVFhA4N9giV3Gu6KwhkzbIjPZ2', name: 'TIFANY', role: 'OBERON'},
				{uid: 'O3QPeR2WI4NfJADulX1YZDwEyY72', name: 'ZEHUA', role: 'LOYAL FOLLOWER'},
				{uid: 'uDY3YxudPTOJPUTz6FNpJNT5Zhz1', name: 'KATH', role: 'PERCIVAL'},
				{uid: 'vqDKpYoXAJPLLDHVfmRHc7q8BTm2', name: 'JOSH', role: 'MERLIN'},
				{uid: 'jlDo6LCSX6byvmeQ4k84BHNwsBr2', name: 'ANDREW', role: 'LOYAL FOLLOWER'},
			],
			missions: [
				{
					state: 'SUCCESS',
					teamSize: 2,
					failsRequired: 1,
					team: ['ALLEN', 'ZEHUA'],
					proposals: [
						{
							proposer: 'KATH',
							state: 'APPROVED',
							team: ['ALLEN', 'ZEHUA'],
							votes: ['ZEHUA', 'ALLEN', 'KATH', 'JOSH'],
						},
					],
					numFails: 0,
				},
				{
					state: 'FAIL',
					teamSize: 3,
					failsRequired: 1,
					team: ['ALLEN', 'ZEHUA', 'TIFANY'],
					proposals: [
						{
							proposer: 'JOSH',
							state: 'REJECTED',
							team: ['JOSH', 'ALLEN', 'ANDREW'],
							votes: ['KATH', 'ANDREW', 'JOSH'],
						},
						{
							proposer: 'ANDREW',
							state: 'REJECTED',
							team: ['ANDREW', 'ZEHUA', 'KATH'],
							votes: ['ANDREW', 'JOSH', 'KATH'],
						},
						{
							proposer: 'ALLEN',
							state: 'APPROVED',
							team: ['ALLEN', 'ZEHUA', 'TIFANY'],
							votes: ['ZEHUA', 'ALLEN', 'KATH', 'JOSH'],
						},
					],
					numFails: 2,
				},
				{
					state: 'FAIL',
					teamSize: 3,
					failsRequired: 1,
					team: ['NATE', 'ZEHUA', 'ANDREW'],
					proposals: [
						{
							proposer: 'NATE',
							state: 'APPROVED',
							team: ['NATE', 'ZEHUA', 'ANDREW'],
							votes: ['ZEHUA', 'NATE', 'JOSH', 'ANDREW', 'KATH'],
						},
					],
					numFails: 1,
				},
				{
					state: 'SUCCESS',
					teamSize: 4,
					failsRequired: 2,
					team: ['NATE', 'KATH', 'JOSH', 'ANDREW'],
					proposals: [
						{
							proposer: 'TIFANY',
							state: 'REJECTED',
							team: ['TIFANY', 'KATH', 'ANDREW', 'NATE'],
							votes: ['NATE', 'TIFANY', 'KATH'],
						},
						{
							proposer: 'ZEHUA',
							state: 'APPROVED',
							team: ['NATE', 'KATH', 'JOSH', 'ANDREW'],
							votes: ['ALLEN', 'NATE', 'KATH', 'JOSH', 'ZEHUA'],
						},
					],
					numFails: 0,
				},
				{
					state: 'PENDING',
					teamSize: 4,
					failsRequired: 1,
					team: [],
					proposals: [
						{
							proposer: 'KATH',
							state: 'REJECTED',
							team: ['KATH', 'JOSH', 'ANDREW', 'NATE'],
							votes: ['KATH', 'NATE', 'ANDREW'],
						},
						{
							proposer: 'JOSH',
							state: 'REJECTED',
							team: ['ANDREW', 'JOSH', 'KATH', 'ZEHUA'],
							votes: ['JOSH', 'ZEHUA', 'KATH'],
						},
						{
							proposer: 'ANDREW',
							state: 'REJECTED',
							team: ['ANDREW', 'JOSH', 'KATH', 'ZEHUA'],
							votes: ['ANDREW', 'ZEHUA', 'JOSH'],
						},
						{
							proposer: 'ALLEN',
							state: 'REJECTED',
							team: ['ALLEN', 'NATE', 'ZEHUA', 'TIFANY'],
							votes: ['ALLEN'],
						},
						{
							proposer: 'NATE',
							state: 'REJECTED',
							team: ['NATE', 'ALLEN', 'ZEHUA', 'KATH'],
							votes: ['ALLEN', 'TIFANY', 'ANDREW'],
						},
					],
				},
			],
			outcome: {
				state: 'EVIL_WIN',
				message: 'Five team proposals in a row rejected',
				assassinated: null,
				roles: [
					{name: 'ALLEN', role: 'MORGANA', assassin: false},
					{name: 'TIFANY', role: 'OBERON', assassin: false},
					{name: 'NATE', role: 'ASSASSIN', assassin: true},
					{name: 'JOSH', role: 'MERLIN', assassin: false},
					{name: 'KATH', role: 'PERCIVAL', assassin: false},
					{name: 'ANDREW', role: 'LOYAL FOLLOWER', assassin: false},
					{name: 'ZEHUA', role: 'LOYAL FOLLOWER', assassin: false},
				],
			},
			options: {inGameLog: false},
		},
	},
};