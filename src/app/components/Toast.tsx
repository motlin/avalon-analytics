import React, {useState, useEffect} from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
	message: string;
	type?: ToastType;
	duration?: number;
	onClose?: () => void;
	visible?: boolean;
	position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
	fullWidth?: boolean;
}

const Toast: React.FC<ToastProps> = ({
	message,
	type = 'info',
	duration = 2000,
	onClose,
	visible = true,
	position = 'top-center',
	fullWidth = true,
}) => {
	const [isVisible, setIsVisible] = useState<boolean>(visible);
	const [isExiting, setIsExiting] = useState<boolean>(false);

	useEffect(() => {
		setIsVisible(visible);
		if (visible) {
			setIsExiting(false);
		}
	}, [visible]);

	useEffect(() => {
		if (isVisible && duration > 0) {
			const timer = setTimeout(() => {
				handleClose();
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [isVisible, duration]);

	const handleClose = () => {
		setIsExiting(true);
		setTimeout(() => {
			setIsVisible(false);
			onClose?.();
		}, 300);
	};

	if (!isVisible && !isExiting) {
		return null;
	}

	const toastClasses = [
		styles.toast,
		styles[type],
		styles[position.replace('-', '_')],
		fullWidth ? styles.fullWidth : '',
		isExiting ? styles.exiting : styles.entering,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={toastClasses}>
			<div className={styles.content}>
				<span className={styles.icon}>
					{type === 'success' && '✓'}
					{type === 'error' && '✕'}
					{type === 'warning' && '⚠'}
					{type === 'info' && 'ℹ'}
				</span>
				<span className={styles.message}>{message}</span>
				<button
					className={styles.closeButton}
					onClick={handleClose}
					aria-label="Close notification"
				>
					✕
				</button>
			</div>
		</div>
	);
};

export default Toast;
