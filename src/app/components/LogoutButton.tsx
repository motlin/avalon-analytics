import type React from 'react';
import {useState} from 'react';
import styles from './LogoutButton.module.css';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

interface AvalonApi {
	logout: () => void;
}

interface LogoutButtonProps {
	avalon: AvalonApi;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({avalon}) => {
	const [loggingOut, setLoggingOut] = useState(false);

	const handleLogoutClick = () => {
		setLoggingOut(true);
		avalon.logout();
	};

	return (
		<button
			className={`${styles.logoutButton} ${loggingOut ? styles.loading : ''}`}
			onClick={handleLogoutClick}
			disabled={loggingOut}
		>
			<span className={styles.icon}>
				<ExitToAppIcon />
			</span>
			{loggingOut ? 'Logging out...' : 'Logout'}
		</button>
	);
};

export default LogoutButton;
