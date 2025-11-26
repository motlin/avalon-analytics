import {vi} from 'vitest';

export function suppressExpectedErrors() {
	const originalError = console.error;
	const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
		const message = args.join(' ');
		if (message.includes('Error in performIO') && message.includes('UNIQUE constraint failed')) {
			return;
		}
		originalError(...args);
	});

	return () => spy.mockRestore();
}
