import React, {useState, useEffect, useRef} from 'react';
import styles from './UserLogin.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEnvelopeSquare} from '@fortawesome/free-solid-svg-icons';

interface AvalonApi {
	confirmingEmailError: string;
	submitEmailAddr: (email: string) => Promise<void>;
	signInAnonymously: () => Promise<void>;
}

interface UserLoginProps {
	avalon: AvalonApi;
}

const UserLogin: React.FC<UserLoginProps> = ({avalon}) => {
	const [tab, setTab] = useState<number>(0);
	const [emailAddr, setEmailAddr] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [isSubmittingEmailAddr, setIsSubmittingEmailAddr] = useState<boolean>(false);
	const [emailSubmitted, setEmailSubmitted] = useState<boolean>(false);
	const userEmailFieldRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		document.title = 'Avalon (Not Logged In)';
	}, []);

	const clearErrorMessage = () => {
		setErrorMessage('');
	};

	const submitEmailAddress = () => {
		setIsSubmittingEmailAddr(true);
		clearErrorMessage();
		avalon.confirmingEmailError = '';

		avalon
			.submitEmailAddr(emailAddr)
			.then(() => {
				setEmailSubmitted(true);
			})
			.catch((err: Error) => {
				setErrorMessage(err.message);
			})
			.finally(() => {
				setIsSubmittingEmailAddr(false);
			});
	};

	const signInAnonymously = () => {
		clearErrorMessage();
		avalon
			.signInAnonymously()
			.then(() => {})
			.catch((err: Error) => {
				setErrorMessage(err.message);
			});
	};

	const resetForm = () => {
		setEmailSubmitted(false);
	};

	const handleEmailKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
		clearErrorMessage();
		if (event.key === 'Enter') {
			submitEmailAddress();
		}
	};

	return (
		<div className={`${styles.card} ${styles.welcome} ${styles.cyanLighten5}`}>
			<div
				className={`${styles.layout} ${styles.alignCenter} ${styles.justifyCenter} ${styles.column} ${styles.fillHeight}`}
			>
				<div className={styles.cardTitle}>
					{avalon.confirmingEmailError && (
						<div className={`${styles.alert} ${styles.error}`}>
							{avalon.confirmingEmailError} Please try logging in again.
						</div>
					)}

					<div className={styles.welcomeSection}>
						<span className={styles.textH3}>
							Avalon: The Resistance <span className={styles.fontWeightThin}>Online</span>
						</span>
						<p className={`${styles.mt4} ${styles.pt2}`}>
							<span className={styles.subheading}>
								A game of social deduction for 5 to 10 people, now on desktop and mobile.
							</span>
						</p>
					</div>
				</div>

				<div className={styles.tabs}>
					<div className={styles.tabsSlider}></div>
					<button
						className={`${styles.tab} ${tab === 0 ? styles.tabActive : ''}`}
						onClick={() => setTab(0)}
					>
						Email
					</button>
					<button
						className={`${styles.tab} ${tab === 1 ? styles.tabActive : ''}`}
						onClick={() => setTab(1)}
					>
						Anonymous
					</button>
				</div>

				<div className={styles.tabsItems}>
					{tab === 0 && (
						<div className={styles.tabItem}>
							{!emailSubmitted ? (
								<>
									<input
										ref={userEmailFieldRef}
										className={`${styles.textField} ${errorMessage ? styles.textFieldError : ''}`}
										placeholder="Email Address"
										value={emailAddr}
										type="email"
										autoComplete="email"
										onChange={(e) => setEmailAddr(e.target.value)}
										onKeyUp={handleEmailKeyUp}
										autoFocus
									/>
									{errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
									<button
										className={`${styles.btn} ${isSubmittingEmailAddr ? styles.loading : ''}`}
										onClick={submitEmailAddress}
										disabled={isSubmittingEmailAddr}
									>
										{isSubmittingEmailAddr ? 'Loading...' : 'Login'}
									</button>
								</>
							) : (
								<>
									<div
										className={`${styles.card} ${styles.xs6} ${styles.md3} ${styles.blueGreyLighten4}`}
									>
										<div className={`${styles.cardText} ${styles.textCenter}`}>
											<p>Check your email for the verification link</p>
										</div>
									</div>
									<button
										className={`${styles.btn} ${styles.mt4}`}
										onClick={resetForm}
									>
										Try Again
									</button>
								</>
							)}
						</div>
					)}

					{tab === 1 && (
						<div className={styles.tabItem}>
							<button
								className={styles.btn}
								onClick={signInAnonymously}
							>
								Login
							</button>
						</div>
					)}
				</div>
			</div>

			<div className={`${styles.layout} ${styles.column} ${styles.alignEnd}`}>
				<div className={`${styles.flex} ${styles.mt4} ${styles.pt4}`}>
					<a
						href="mailto:avalon@shamm.as"
						target="_blank"
						rel="noopener noreferrer"
						className={`${styles.btn} ${styles.small} ${styles.greyLighten2}`}
					>
						<span className={`${styles.icon} ${styles.left} ${styles.small}`}>
							<FontAwesomeIcon icon={faEnvelopeSquare} />
						</span>
						<span>Email</span>
					</a>
				</div>
			</div>
		</div>
	);
};

export default UserLogin;
