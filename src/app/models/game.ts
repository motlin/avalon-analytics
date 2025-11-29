import {z} from 'zod';

export const PlayerSchema = z.object({
	uid: z.string(),
	name: z.string(),
	role: z.string().optional(),
});

export type Player = z.infer<typeof PlayerSchema>;

export const ProposalSchema = z.object({
	proposer: z.string(),
	team: z.array(z.string()),
	votes: z.array(z.string()),
	state: z.enum(['APPROVED', 'REJECTED', 'PENDING']),
});

export type Proposal = z.infer<typeof ProposalSchema>;

export const MissionSchema = z.object({
	failsRequired: z.number(),
	teamSize: z.number(),
	proposals: z.array(ProposalSchema),
	state: z.enum(['SUCCESS', 'FAIL', 'PENDING']),
	numFails: z.number().optional(),
	team: z.array(z.string()),
});

export type Mission = z.infer<typeof MissionSchema>;

export const RoleSchema = z.object({
	name: z.string(),
	role: z.string(),
	assassin: z.boolean(),
});

export type Role = z.infer<typeof RoleSchema>;

export const GameOutcomeSchema = z.object({
	state: z.string(),
	message: z.string().optional(),
	assassinated: z
		.union([z.string(), z.boolean(), z.null()])
		.optional()
		.transform((val) => (typeof val === 'string' ? val : undefined)),
	roles: z.array(RoleSchema).optional(),
	votes: z.array(z.record(z.string(), z.boolean())).optional(),
	winner: z.string().optional(),
	reason: z.string().optional(),
});

export type GameOutcome = z.infer<typeof GameOutcomeSchema>;

export const GameOptionsSchema = z
	.object({
		enableLancelot: z.boolean().optional(),
		enableTwoFailProtection: z.boolean().optional(),
		enableLadyOfTheLake: z.boolean().optional(),
	})
	.passthrough();

export type GameOptions = z.infer<typeof GameOptionsSchema>;

export const FirestoreTimestampSchema = z
	.object({
		__datatype__: z.literal('timestamp').optional(),
		value: z
			.object({
				_seconds: z.number(),
				_nanoseconds: z.number(),
			})
			.optional(),
		_seconds: z.number().optional(),
		_nanoseconds: z.number().optional(),
	})
	.transform((val) => {
		if (val.value) {
			return new Date(val.value._seconds * 1000 + val.value._nanoseconds / 1000000);
		} else {
			return new Date(val._seconds! * 1000 + val._nanoseconds! / 1000000);
		}
	});

export const GameSchema = z
	.object({
		id: z.string(),
		missions: z.array(MissionSchema),
		players: z.array(PlayerSchema),
		options: GameOptionsSchema.optional(),
		timeCreated: FirestoreTimestampSchema,
		timeFinished: FirestoreTimestampSchema.optional(),
		outcome: GameOutcomeSchema.optional(),
		__collections__: z.record(z.string(), z.any()).optional(),
	})
	.passthrough();

export type Game = z.infer<typeof GameSchema>;

export const StatsSchema = z
	.object({
		totalGames: z.number(),
		goodWins: z.number(),
		evilWins: z.number(),
		totalPlayers: z.number(),
		firstTimeSeen: FirestoreTimestampSchema,
		lastUpdated: FirestoreTimestampSchema,
	})
	.passthrough();

export type Stats = z.infer<typeof StatsSchema>;
