'use client';

import {startAuthentication, startRegistration} from '@simplewebauthn/browser';
import * as React from 'react';
import {ThemeToggle} from '../../components/ThemeToggle';
const {useState, useTransition} = React;
import {finishPasskeyLogin, finishPasskeyRegistration, startPasskeyLogin, startPasskeyRegistration} from './functions';

export function Login() {
	const [username, setUsername] = useState('');
	const [result, setResult] = useState('');
	const [isPending, startTransition] = useTransition();

	const passkeyLogin = async () => {
		// 1. Get a challenge from the worker
		const options = await startPasskeyLogin();

		// 2. Ask the browser to sign the challenge
		const login = await startAuthentication({optionsJSON: options});

		// 3. Give the signed challenge to the worker to finish the login process
		const success = await finishPasskeyLogin(login);

		if (!success) {
			setResult('Login failed');
		} else {
			setResult('Login successful!');
		}
	};

	const passkeyRegister = async () => {
		// 1. Get a challenge from the worker
		const options = await startPasskeyRegistration(username);

		// 2. Ask the browser to sign the challenge
		const registration = await startRegistration({optionsJSON: options});

		// 3. Give the signed challenge to the worker to finish the registration process
		const success = await finishPasskeyRegistration(username, registration);

		if (!success) {
			setResult('Registration failed');
		} else {
			setResult('Registration successful!');
		}
	};

	const handlePerformPasskeyLogin = () => {
		startTransition(() => void passkeyLogin());
	};

	const handlePerformPasskeyRegister = () => {
		startTransition(() => void passkeyRegister());
	};

	return (
		<div className="p-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Login</h1>
				<ThemeToggle />
			</div>
			<div className="max-w-md mx-auto space-y-4">
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Username"
					className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
				/>
				<button
					onClick={handlePerformPasskeyLogin}
					disabled={isPending}
					className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
				>
					{isPending ? <>...</> : 'Login with passkey'}
				</button>
				<button
					onClick={handlePerformPasskeyRegister}
					disabled={isPending}
					className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50"
				>
					{isPending ? <>...</> : 'Register with passkey'}
				</button>
				{result && <div className="mt-4 text-center">{result}</div>}
			</div>
		</div>
	);
}
