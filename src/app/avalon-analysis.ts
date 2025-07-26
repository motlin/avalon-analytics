interface Role {
	name: string;
	role: string;
}

interface RoleInfo {
	team: 'good' | 'evil';
}

interface Proposal {
	proposer: string;
	team: string[];
	state: string;
	votes: string[];
}

interface Mission {
	state: 'PENDING' | 'SUCCESS' | 'FAIL';
	team: string[];
	proposals: Proposal[];
	evilOnTeam?: string[];
	failsRequired: number;
	numFails: number;
}

interface GameOutcome {
	state: string;
	roles: Role[];
	assassinated?: string;
}

interface Game {
	players: string[];
	missions: Mission[];
	outcome: GameOutcome;
}

interface Badge {
	title: string;
	body: string;
}

// Utility function to replicate Array.prototype.joinWithAnd
function joinWithAnd(array: string[]): string {
	if (array.length === 0) return '';
	if (array.length === 1) return array[0];
	const arrCopy = array.slice(0);
	const lastElement = arrCopy.pop();
	return arrCopy.join(', ') + ' and ' + lastElement;
}

// Utility functions to replace lodash
function keyBy<T>(array: T[], key: keyof T): Record<string, T> {
	return array.reduce(
		(result, item) => {
			result[String(item[key])] = item;
			return result;
		},
		{} as Record<string, T>,
	);
}

function invert(obj: Record<string, string>): Record<string, string> {
	return Object.entries(obj).reduce(
		(result, [key, value]) => {
			result[value] = key;
			return result;
		},
		{} as Record<string, string>,
	);
}

function mapValues<T, U>(obj: Record<string, T>, fn: (value: T) => U): Record<string, U> {
	return Object.entries(obj).reduce(
		(result, [key, value]) => {
			result[key] = fn(value);
			return result;
		},
		{} as Record<string, U>,
	);
}

export default class GameAnalysis {
	private game: Game;
	private rolesByName: Record<string, Role>;
	private namesByRole: Record<string, string>;
	private evilPlayers: string[];
	private goodPlayers: string[];
	private missions: Mission[];

	constructor(game: Game, roleMap: Record<string, RoleInfo>) {
		this.game = game;
		this.rolesByName = keyBy(game.outcome.roles, 'name');
		this.namesByRole = invert(mapValues(this.rolesByName, (r) => r.role)); // this is lossy for non-unique roles!
		this.evilPlayers = game.outcome.roles.filter((r) => roleMap[r.role].team === 'evil').map((r) => r.name);
		this.goodPlayers = game.outcome.roles.filter((r) => roleMap[r.role].team === 'good').map((r) => r.name);
		this.missions = game.missions.map((m) => {
			const mission = {...m};
			mission.evilOnTeam = m.team.filter((n) => this.evilPlayers.includes(n));
			return mission;
		});
	}

	private roleProposesRole(proposerRole: string, roleProposed: string): boolean {
		if (!this.namesByRole[proposerRole] || !this.namesByRole[roleProposed]) return false;

		for (const mission of this.missions) {
			for (const proposal of mission.proposals) {
				if (
					proposal.proposer === this.namesByRole[proposerRole] &&
					proposal.team.includes(this.namesByRole[roleProposed])
				) {
					return true;
				}
			}
		}
		return false;
	}

	private roleApprovesRole(approverRole: string, roleProposed: string): boolean {
		if (!this.namesByRole[approverRole] || !this.namesByRole[roleProposed]) return false;

		for (const mission of this.missions) {
			for (const [proposalIdx, proposal] of mission.proposals.entries()) {
				if (
					proposalIdx !== 4 && // hammer approvals don't count
					proposal.team.includes(this.namesByRole[roleProposed]) &&
					proposal.votes.includes(this.namesByRole[approverRole])
				) {
					return true;
				}
			}
		}
		return false;
	}

	private roleTrustsRole(
		sourceRole: string,
		destRole: string,
		badgeGenerator: (msg: string) => Badge,
	): Badge | false {
		const proposed = this.roleProposesRole(sourceRole, destRole);
		const approved = this.roleApprovesRole(sourceRole, destRole);
		if (proposed || approved) {
			let msg = '';
			if (proposed && approved) {
				msg = 'both proposed and approved teams';
			} else if (proposed) {
				msg = 'proposed a team';
			} else {
				msg = 'approved a team';
			}
			return badgeGenerator(msg);
		}
		return false;
	}

	private badges = {
		cleanSweep: (): Badge | false => {
			if (
				this.missions.length >= 3 &&
				this.missions[0].state === this.missions[1].state &&
				this.missions[1].state === this.missions[2].state
			) {
				if (this.missions[0].state === 'FAIL') {
					return {
						title: 'Nasty, brutish, and short',
						body: 'Evil team dominated the game',
					};
				} else {
					if (this.game.outcome.state === 'EVIL_WIN') {
						return {
							title: 'Look, ma, no hands',
							body: 'Evil team won despite not failing any missions',
						};
					} else {
						return {
							title: 'Clean sweep',
							body: 'Good team dominated the game',
						};
					}
				}
			}
			return false;
		},
		trustingBunch: (): Badge | false => {
			if (this.missions.length === 0) return false;
			const approvedIdx = this.missions[0].proposals.findIndex((p) => p.state === 'APPROVED');
			if (approvedIdx >= 0 && approvedIdx < 4) {
				return {
					title: 'What a trusting bunch',
					body: `First mission got approved within ${approvedIdx + 1} ${approvedIdx === 0 ? 'try' : 'tries'}`,
				};
			}
			return false;
		},
		assassinationAnalysis: (): Badge | false => {
			if (this.game.outcome.assassinated) {
				if (this.evilPlayers.includes(this.game.outcome.assassinated)) {
					return {
						title: 'Stabbed in the back',
						body: 'Evil player got assassinated',
					};
				}
				if (this.rolesByName[this.game.outcome.assassinated].role === 'PERCIVAL') {
					return {
						title: 'Taking a bullet for you',
						body: 'Percival got assassinated',
					};
				}
			}
			return false;
		},
		reversalOfFortune: (): Badge | false => {
			//pulled it out in the end: one side wins first 2, other side wins the game
			if (
				this.missions.length >= 5 &&
				this.missions[0].state === this.missions[1].state &&
				this.missions[1].state !== this.missions[2].state &&
				this.missions[2].state === this.missions[3].state &&
				this.missions[3].state === this.missions[4].state
			) {
				if (this.missions[0].state === 'FAIL' && this.game.outcome.state === 'GOOD_WIN') {
					return {
						title: 'Reversal of fortune',
						body: 'Good won the game despite losing first two missions',
					};
				} else if (this.missions[0].state === 'SUCCESS') {
					return {
						title: 'Stunning comeback',
						body: 'Evil won the game despite losing first two missions',
					};
				}
			}
			return false;
		},
		trustYou: (): Badge | false => {
			for (const mission of this.missions) {
				for (const proposal of mission.proposals) {
					if (proposal.team.length && !proposal.team.includes(proposal.proposer)) {
						return {
							title: 'I trust you guys',
							body: `${proposal.proposer} proposed a team that did not include themselves`,
						};
					}
				}
			}
			return false;
		},
		perfectCoordination: (): Badge | false => {
			for (const [missionIdx, mission] of this.missions.entries()) {
				if (
					mission.evilOnTeam &&
					mission.evilOnTeam.length > mission.numFails &&
					mission.numFails === mission.failsRequired
				) {
					return {
						title: 'Same wavelength',
						body: `${joinWithAnd(mission.evilOnTeam)} had perfect coordination on mission ${missionIdx + 1}`,
					};
				}
			}
			return false;
		},
	};

	getBadges(): Badge[] {
		return Object.values(this.badges)
			.map((func) => {
				return func.bind(this)();
			})
			.filter((badge): badge is Badge => badge !== false);
	}
}
