import React, {useState, useEffect} from 'react';
import Achievements from './Achievements';
import MissionSummaryTable from './MissionSummaryTable';
import styles from './EndGameEventHandler.module.css';

interface PlayerRole {
	name: string;
	role: string;
	assassin?: boolean;
}

interface GameOutcome {
	state: 'GOOD_WIN' | 'EVIL_WIN' | 'CANCELED';
	message: string;
	assassinated?: string;
	roles: PlayerRole[];
	votes: Record<number, Record<string, boolean>>;
}

interface Mission {
	proposals: Array<{
		proposer: string;
		team: string[];
		votes: string[];
		state: 'PENDING' | 'APPROVED' | 'REJECTED';
	}>;
	team: string[];
	state: string;
}

interface Game {
	players: string[];
	missions: Mission[];
	outcome?: GameOutcome;
}

interface Lobby {
	game: Game;
}

interface RoleInfo {
	name: string;
}

interface Config {
	roles: RoleInfo[];
	roleMap: Record<string, {team: string}>;
}

interface AvalonProps {
	game?: Game;
	lobby: Lobby;
	config: Config;
	onEvent?: (callback: (event: string, ...args: any[]) => void) => () => void;
}

interface EndGameEventHandlerProps {
	avalon: AvalonProps;
}

const EndGameEventHandler: React.FC<EndGameEventHandlerProps> = ({avalon}) => {
	const [endGameDialog, setEndGameDialog] = useState(false);

	useEffect(() => {
		if (!avalon.onEvent) return;

		const unsubscribe = avalon.onEvent((event: string) => {
			if (event === 'GAME_ENDED') {
				setEndGameDialog(true);
			} else if (event === 'GAME_STARTED') {
				setEndGameDialog(false);
			}
		});

		return unsubscribe;
	}, [avalon]);

	const handleClose = () => {
		setEndGameDialog(false);
	};

	const getTitle = () => {
		if (!avalon.game?.outcome) return '';

		switch (avalon.game.outcome.state) {
			case 'GOOD_WIN':
				return 'Good wins!';
			case 'EVIL_WIN':
				return 'Evil wins!';
			case 'CANCELED':
				return 'Game Canceled';
			default:
				return avalon.game.outcome.state;
		}
	};

	const getRoleAssignments = () => {
		if (!avalon.game?.outcome) return [];

		return avalon.game.outcome.roles.slice().sort((a, b) => {
			const roleIndexOf = (name: string) => avalon.config.roles.findIndex((r) => r.name === name);
			return roleIndexOf(a.role) - roleIndexOf(b.role);
		});
	};

	const getFilteredMissions = () => {
		if (!avalon.game) return [];

		return avalon.game.missions.filter((m) => m.proposals.filter((p) => p.state !== 'PENDING').length > 0);
	};

	if (!avalon.game?.outcome) {
		return null;
	}

	if (!endGameDialog) {
		return null;
	}

	return (
		<div className={styles.overlay}>
			<div className={styles.dialog}>
				<div className={styles.card}>
					<div className={styles.title}>
						<h2>{getTitle()}</h2>
					</div>
					<div className={styles.content}>
						<p className={styles.message}>{avalon.game.outcome.message}</p>
						{avalon.game.outcome.assassinated && (
							<p className={styles.assassinationInfo}>
								{avalon.game.outcome.assassinated} was assassinated by{' '}
								{avalon.game.outcome.roles.find((r) => r.assassin)?.name}
							</p>
						)}
						<div className={styles.tableContainer}>
							<MissionSummaryTable
								players={avalon.game.players}
								missions={getFilteredMissions()}
								roles={getRoleAssignments()}
								missionVotes={avalon.game.outcome.votes}
							/>
						</div>
						<Achievements avalon={avalon} />
					</div>
					<div className={styles.actions}>
						<button
							onClick={handleClose}
							className={styles.button}
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EndGameEventHandler;
