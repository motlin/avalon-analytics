import React, {useEffect, useState} from 'react';
import StartGameEventHandler from './StartGameEventHandler';
import EndGameEventHandler from './EndGameEventHandler';
import MissionResultEventHandler from './MissionResultEventHandler';
import styles from './EventHandler.module.css';

interface EventBusContext {
	addEventListener: (eventName: string, handler: (data?: any) => void) => void;
	removeEventListener: (eventName: string, handler: (data?: any) => void) => void;
}

interface EventHandlerProps {
	avalon: any;
	eventBus: EventBusContext;
}

interface Toast {
	id: number;
	message: string;
}

const EventHandler: React.FC<EventHandlerProps> = ({avalon, eventBus}) => {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const [nextId, setNextId] = useState(0);

	const showToast = (message: string) => {
		const id = nextId;
		setNextId((prev) => prev + 1);
		setToasts((prev) => [...prev, {id, message}]);

		setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, 2000);
	};

	useEffect(() => {
		const handlers: {[key: string]: (data?: any) => void} = {
			LOBBY_CONNECTED: () => {
				document.title = `Avalon - ${avalon.lobby.name} - ${avalon.user.name}`;
			},
			LOBBY_NEW_ADMIN: () => {
				if (avalon.isAdmin) {
					showToast('You are now lobby administrator');
				} else {
					showToast(`${avalon.lobby.admin.name} became lobby administrator`);
				}
			},
			PROPOSAL_REJECTED: () => {
				showToast(`${avalon.lobby.game.lastProposal.proposer}'s team rejected`);
			},
			PROPOSAL_APPROVED: () => {
				showToast(`${avalon.lobby.game.currentProposal.proposer}'s team approved`);
			},
			TEAM_PROPOSED: () => {
				showToast(`${avalon.lobby.game.currentProposal.proposer} has proposed a team`);
			},
			PLAYER_LEFT: (name: string) => {
				showToast(`${name} left the lobby`);
			},
			PLAYER_JOINED: (name: string) => {
				showToast(`${name} joined the lobby`);
			},
			DISCONNECTED_FROM_LOBBY: (lobby: string) => {
				showToast(`You've been disconnected from ${lobby}`);
			},
		};

		Object.entries(handlers).forEach(([eventName, handler]) => {
			eventBus.addEventListener(eventName, handler);
		});

		return () => {
			Object.entries(handlers).forEach(([eventName, handler]) => {
				eventBus.removeEventListener(eventName, handler);
			});
		};
	}, [avalon, eventBus, showToast]);

	return (
		<div>
			<StartGameEventHandler avalon={avalon} />
			<MissionResultEventHandler avalon={avalon} />
			<EndGameEventHandler avalon={avalon} />

			<div className={styles.toastContainer}>
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className={styles.toast}
					>
						{toast.message}
					</div>
				))}
			</div>
		</div>
	);
};

export default EventHandler;
