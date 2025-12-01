'use client';

import {useEffect, useState} from 'react';

interface LocalTimestampProps {
	isoString: string;
	showDate?: boolean;
	showTime?: boolean;
}

export function LocalTimestamp({isoString, showDate = true, showTime = true}: LocalTimestampProps) {
	const [formatted, setFormatted] = useState<string>('');

	useEffect(() => {
		const date = new Date(isoString);
		const parts: string[] = [];

		if (showDate) {
			parts.push(date.toLocaleDateString());
		}
		if (showTime) {
			parts.push(date.toLocaleTimeString());
		}

		setFormatted(parts.join(' '));
	}, [isoString, showDate, showTime]);

	if (!formatted) {
		const date = new Date(isoString);
		const parts: string[] = [];
		if (showDate) {
			parts.push(date.toLocaleDateString('en-US', {timeZone: 'UTC'}));
		}
		if (showTime) {
			parts.push(date.toLocaleTimeString('en-US', {timeZone: 'UTC'}));
		}
		return <span>{parts.join(' ')}</span>;
	}

	return <span>{formatted}</span>;
}
