import React, {useState, useEffect} from 'react';
import LobbyPlayerList from './LobbyPlayerList';
import RoleList from './RoleList';
import styles from './Lobby.module.css';
import avalonLib from '../../../server/common/avalonlib.mjs';
import InfoIcon from '@mui/icons-material/Info';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEnvelopeSquare} from '@fortawesome/free-solid-svg-icons';

interface User {
	name: string;
	stats: {
		games: number;
	};
}

interface Admin {
	name: string;
}

interface Config {
	playerList: string[];
	selectableRoles: Array<{
		name: string;
		team: 'good' | 'evil';
		description: string;
		selected?: boolean;
	}>;
	sortList: (newList: string[]) => void;
}

interface Lobby {
	name: string;
	admin: Admin;
}

interface AvalonProps {
	user: User;
	config: Config;
	lobby: Lobby;
	isAdmin: boolean;
	isGameInProgress: boolean;
	startGame: (options: {inGameLog: boolean}) => void;
	kickPlayer: (player: string) => Promise<void>;
}

interface LobbyProps {
	avalon: AvalonProps;
}

const Lobby: React.FC<LobbyProps> = ({avalon}) => {
	const [options, setOptions] = useState({
		inGameLog: false,
	});
	const [showOptionGameLog, setShowOptionGameLog] = useState(false);
	const [startingGame, setStartingGame] = useState(false);

	useEffect(() => {
		console.log('event in lobby', avalon);
	}, [avalon]);

	const reasonToNotStartGame = (): string | null => {
		if (avalon.config.playerList.length < 5) {
			return `Need at least 5 players! Invite your friends to lobby ${avalon.lobby.name}`;
		}
		if (avalon.config.playerList.length > 10) {
			return 'Cannot start game with more than 10 players';
		}
		if (!avalon.isAdmin) {
			return `Waiting for ${avalon.lobby.admin.name} to start game...`;
		}
		return null;
	};

	const canStartGame = (): boolean => {
		return reasonToNotStartGame() === null;
	};

	const validTeamSize = (): boolean => {
		return avalon.config.playerList.length >= 5 && avalon.config.playerList.length <= 10;
	};

	const numEvilPlayers = (): number => {
		return avalonLib.getNumEvilForGameSize(avalon.config.playerList.length);
	};

	const handleStartGame = async () => {
		setStartingGame(true);
		await avalon.startGame(options);
		setStartingGame(false);
	};

	const handleInGameLogChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setOptions({...options, inGameLog: event.target.checked});
	};

	return (
		<div className={styles.container}>
			{false && avalon.user.stats.games >= 3 && (
				<div className={styles.shutdownCard}>
					<div className={styles.shutdownTitle}>
						<h3>Server Shutdown</h3>
					</div>
					<div className={styles.shutdownText}>
						Due to mounting costs, we're asking for your donations to keep the server running. Please pitch
						in if you enjoy playing here. Every little bit helps.
					</div>
				</div>
			)}

			<div className={styles.mainLayout}>
				<div className={styles.playersSection}>
					<div className={styles.sectionContainer}>
						<p className={styles.sectionTitle}>Players</p>
						<LobbyPlayerList avalon={avalon} />
						{avalon.isAdmin && avalon.config.playerList.length > 2 && (
							<p className={styles.dragHint}>Drag names to specify seating order</p>
						)}
					</div>
				</div>

				{validTeamSize() && (
					<div className={styles.rolesSection}>
						<div className={styles.sectionContainer}>
							<p className={styles.sectionTitle}>Special Roles Available</p>
							<RoleList
								roles={avalon.config.selectableRoles}
								allowSelect={avalon.isAdmin}
							/>
						</div>
					</div>
				)}
			</div>

			{validTeamSize() && (
				<div className={styles.teamInfoLayout}>
					<div className={styles.teamInfo}>
						<p className={styles.teamInfoText}>
							{avalon.config.playerList.length} players:{' '}
							{avalon.config.playerList.length - numEvilPlayers()} good, {numEvilPlayers()} evil
						</p>
					</div>
				</div>
			)}

			{/* IN-GAME LOG CODE - Currently disabled */}
			{canStartGame() && (
				<div className={styles.optionsSection}>
					{showOptionGameLog && (
						<div
							className={styles.dialogOverlay}
							onClick={() => setShowOptionGameLog(false)}
						>
							<div
								className={styles.dialog}
								onClick={(e) => e.stopPropagation()}
							>
								<div className={styles.dialogTitle}>
									<h3>Enable in-game log display</h3>
								</div>
								<div className={styles.dialogText}>
									Display the voting record of all players during the game. This may make the game
									less social and more analytical. It will also make it harder to hide as Merlin! Use
									at your own risk.
								</div>
								<button onClick={() => setShowOptionGameLog(false)}>Close</button>
							</div>
						</div>
					)}

					<div className={styles.optionsList}>
						<div className={styles.optionItem}>
							<div className={styles.checkboxContainer}>
								<input
									type="checkbox"
									checked={options.inGameLog}
									onChange={handleInGameLogChange}
									className={styles.checkbox}
								/>
							</div>
							<div className={styles.optionLabel}>Enable in-game log display</div>
							<div className={styles.infoButton}>
								<button
									onClick={() => setShowOptionGameLog(true)}
									className={styles.infoBtn}
								>
									<InfoIcon />
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className={styles.startGameSection}>
				{canStartGame() ? (
					<button
						className={`${styles.startButton} ${startingGame ? styles.startButtonLoading : ''}`}
						onClick={handleStartGame}
						disabled={startingGame}
					>
						<span className={styles.startButtonIcon}>
							<PlayArrowIcon />
						</span>
						{startingGame ? 'Starting...' : 'Start Game'}
					</button>
				) : (
					<div className={styles.cannotStartCard}>
						<div className={styles.cannotStartText}>{reasonToNotStartGame()}</div>
					</div>
				)}
			</div>

			<div className={styles.feedbackSection}>
				<div className={styles.feedbackContainer}>
					<a
						href="mailto:avalon@shamm.as"
						target="_blank"
						rel="noopener noreferrer"
						className={styles.feedbackButton}
					>
						<FontAwesomeIcon
							icon={faEnvelopeSquare}
							className={styles.feedbackIcon}
						/>
						<span>Send feedback</span>
					</a>
				</div>
			</div>
		</div>
	);
};

export default Lobby;
