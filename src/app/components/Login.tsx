import React, {useState, useEffect, useRef} from 'react';
import StatsDisplay from './StatsDisplay';
import styles from './Login.module.css';

interface AvalonUser {
	name: string;
	email: string;
	stats: {
		games?: number;
		good?: number;
		wins?: number;
		good_wins?: number;
		playtimeSeconds?: number;
	};
}

interface GlobalStats {
	games: number;
	good_wins: number;
}

interface AvalonApi {
	user?: AvalonUser;
	globalStats?: GlobalStats;
	createLobby: (name: string) => Promise<void>;
	joinLobby: (name: string, lobby: string) => Promise<void>;
}

interface LoginProps {
	avalon: AvalonApi;
	disableAutoFocus?: boolean;
}

const Login: React.FC<LoginProps> = ({avalon, disableAutoFocus = false}) => {
	const [name, setName] = useState<string>(avalon.user ? avalon.user.name : '');
	const [lobby, setLobby] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [showLobbyInput, setShowLobbyInput] = useState<boolean>(false);
	const [isJoiningLobby, setIsJoiningLobby] = useState<boolean>(false);
	const [isCreatingLobby, setIsCreatingLobby] = useState<boolean>(false);
	const [alertTimeoutTimer, setAlertTimeoutTimer] = useState<NodeJS.Timeout | null>(null);

	const nameTextFieldRef = useRef<HTMLInputElement>(null);
	const lobbyTextFieldRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setInputWidth(nameTextFieldRef);
		document.title = 'Avalon - ' + (name ? name : avalon.user?.email || '');
	}, [name, avalon.user?.email]);

	useEffect(() => {
		const textFieldRef = showLobbyInput ? lobbyTextFieldRef : nameTextFieldRef;
		if (textFieldRef.current) {
			if (!disableAutoFocus) {
				textFieldRef.current.focus();
			}
			setInputWidth(textFieldRef);
		}
	}, [showLobbyInput, disableAutoFocus]);

	const setInputWidth = (fieldRef: React.RefObject<HTMLInputElement | null>) => {
		const size = 20;
		if (fieldRef.current) {
			fieldRef.current.setAttribute('size', size.toString());
		}
	};

	const genericLogin = (
		loadingStateSetter: React.Dispatch<React.SetStateAction<boolean>>,
		loginPromise: Promise<void>,
	) => {
		loadingStateSetter(true);
		loginPromise.catch((err: Error) => showErrorMessage(err.message)).finally(() => loadingStateSetter(false));
	};

	const createLobby = () => {
		genericLogin(setIsCreatingLobby, avalon.createLobby(name));
	};

	const joinLobby = () => {
		genericLogin(setIsJoiningLobby, avalon.joinLobby(name, lobby));
	};

	const showErrorMessage = (errorMsg: string) => {
		if (alertTimeoutTimer) {
			clearTimeout(alertTimeoutTimer);
		}
		setErrorMessage(errorMsg);
		const timer = setTimeout(() => {
			setAlertTimeoutTimer(null);
			setErrorMessage('');
		}, 5000);
		setAlertTimeoutTimer(timer);
	};

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value.toUpperCase());
	};

	const handleLobbyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setLobby(event.target.value.toUpperCase());
	};

	const handleLobbyKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			joinLobby();
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.layout}>
				{!showLobbyInput ? (
					<>
						<input
							ref={nameTextFieldRef}
							className={`${styles.textField} ${errorMessage ? styles.error : ''}`}
							placeholder="Your Name"
							value={name}
							onChange={handleNameChange}
							autoFocus={!disableAutoFocus}
						/>
						{errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
						<button
							className={`${styles.button} ${isCreatingLobby ? styles.loading : ''}`}
							disabled={!name}
							onClick={createLobby}
						>
							{isCreatingLobby ? 'Creating...' : 'Create Lobby'}
						</button>
						<button
							className={styles.button}
							disabled={!name || isCreatingLobby}
							onClick={() => setShowLobbyInput(true)}
						>
							Join Lobby
						</button>
					</>
				) : (
					<>
						<input
							ref={lobbyTextFieldRef}
							className={`${styles.textField} ${errorMessage ? styles.error : ''}`}
							placeholder="Lobby"
							value={lobby}
							onChange={handleLobbyChange}
							onKeyUp={handleLobbyKeyUp}
						/>
						{errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
						<button
							className={`${styles.button} ${isJoiningLobby ? styles.loading : ''}`}
							disabled={!lobby}
							onClick={joinLobby}
						>
							{isJoiningLobby ? 'Joining...' : 'Join Lobby'}
						</button>
						<button
							className={styles.button}
							disabled={isJoiningLobby}
							onClick={() => setShowLobbyInput(false)}
						>
							Cancel
						</button>
					</>
				)}
				<div className={styles.spacer}></div>
				<StatsDisplay
					stats={avalon.user?.stats || {}}
					globalStats={avalon.globalStats}
				/>
			</div>
		</div>
	);
};

export default Login;
