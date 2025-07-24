import React, {useState} from 'react';
import styles from './ToolbarQuitButton.module.css';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

interface AvalonApi {
	isGameInProgress: boolean;
	cancelGame: () => Promise<void>;
	leaveLobby: () => void;
}

interface ToolbarQuitButtonProps {
	avalon: AvalonApi;
}

const ToolbarQuitButton: React.FC<ToolbarQuitButtonProps> = ({avalon}) => {
	const [quitting, setQuitting] = useState(false);
	const [dialog, setDialog] = useState(false);

	const actionDescription = avalon.isGameInProgress ? 'Cancel Game' : 'Leave Lobby';
	const gameInProgressText = avalon.isGameInProgress ? 'The current game will be canceled!' : '';

	const quitButtonClicked = () => {
		setQuitting(true);
		setDialog(false);

		if (avalon.isGameInProgress) {
			avalon.cancelGame().finally(() => setQuitting(false));
		} else {
			avalon.leaveLobby();
		}
	};

	return (
		<>
			<button
				className={`${styles.quitButton} ${quitting ? styles.loading : ''}`}
				onClick={() => setDialog(true)}
				disabled={quitting}
			>
				<span className={styles.icon}>
					<ExitToAppIcon />
				</span>
				Quit
			</button>

			{dialog && (
				<div
					className={styles.overlay}
					onClick={() => setDialog(false)}
				>
					<div
						className={styles.dialog}
						onClick={(e) => e.stopPropagation()}
					>
						<div className={styles.card}>
							<div className={styles.title}>
								<h3>{actionDescription}?</h3>
							</div>
							<div className={styles.content}>
								{gameInProgressText && <p>{gameInProgressText}</p>}
								<p>Are you sure you want to proceed?</p>
							</div>
							<div className={styles.divider}></div>
							<div className={styles.actions}>
								<button
									onClick={quitButtonClicked}
									className={styles.primaryButton}
								>
									{actionDescription}
								</button>
								<button
									onClick={() => setDialog(false)}
									className={styles.secondaryButton}
								>
									Nevermind
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ToolbarQuitButton;
