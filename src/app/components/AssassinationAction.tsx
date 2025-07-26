import React, {useState} from 'react';
import styles from './AssassinationAction.module.css';

interface Role {
	role: {
		name: string;
		team: string;
		description: string;
	};
	assassin: boolean;
	sees: string[];
}

interface Lobby {
	role: Role;
}

interface User {
	name: string;
}

interface AvalonApi {
	assassinate: (lobby: string, name: string, target: string) => Promise<void>;
}

interface AvalonProps {
	lobby: Lobby;
	user: User;
	assassinate: (target: string) => Promise<void>;
}

interface AssassinationActionProps {
	avalon: AvalonProps;
	playerList: string[];
}

const AssassinationAction: React.FC<AssassinationActionProps> = ({avalon, playerList}) => {
	const [isAssassinating, setIsAssassinating] = useState(false);

	const isValidSelection = playerList.length === 1 && playerList[0] !== avalon.user?.name;

	const assassinateButtonText = isValidSelection ? `Assassinate ${playerList[0]}` : 'Select target';

	const handleAssassinate = async () => {
		setIsAssassinating(true);
		try {
			await avalon.assassinate(playerList[0]);
		} finally {
			setIsAssassinating(false);
		}
	};

	return (
		<div className={styles.card}>
			<div className={styles.cardHeader}>
				<h3 className={styles.title}>Assassination Attempt</h3>
			</div>
			<div className={styles.cardContent}>
				{avalon.lobby?.role?.assassin ? (
					<button
						className={styles.assassinateButton}
						disabled={!isValidSelection || isAssassinating}
						onClick={handleAssassinate}
					>
						{isAssassinating ? 'Assassinating...' : assassinateButtonText}
					</button>
				) : (
					<div className={styles.waitingMessage}>Waiting for target selection</div>
				)}
			</div>
		</div>
	);
};

export default AssassinationAction;
