import {env} from 'cloudflare:workers';
import {Breadcrumb} from '../../components/Breadcrumb';
import {db, setupDb} from '@/db';

interface ExportPerson {
	fullName: string;
	uuids: string[];
	dateRanges: Array<{startDate: string; endDate?: string}>;
}

interface ExportData {
	people: {
		people: ExportPerson[];
	};
}

export async function ExportPage() {
	let exportData: ExportData | null = null;
	let error: string | null = null;

	try {
		await setupDb(env);

		const people = await db.person.findMany({
			include: {
				uids: true,
				dateRanges: true,
			},
			orderBy: {name: 'asc'},
		});

		exportData = {
			people: {
				people: people.map((p) => ({
					fullName: p.name,
					uuids: p.uids.map((u) => u.uid),
					dateRanges: p.dateRanges.map((dr) => ({
						startDate: dr.startDate,
						...(dr.endDate && {endDate: dr.endDate}),
					})),
				})),
			},
		};
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to load export data';
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const jsonString = JSON.stringify(exportData, null, 2);

	return (
		<div style={{padding: '1rem', maxWidth: '1200px', margin: '0 auto'}}>
			<Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'Admin'}, {label: 'Export'}]} />

			<h1>Export Person Mappings</h1>
			<p>
				This JSON can be copied to <code>config.json5</code> in the avalon-log-scraper project.
			</p>

			<div style={{marginBottom: '1rem'}}>
				<strong>Statistics:</strong>
				<ul style={{marginTop: '0.5rem'}}>
					<li>{exportData?.people.people.length || 0} people</li>
					<li>{exportData?.people.people.reduce((sum, p) => sum + p.uuids.length, 0) || 0} total UIDs</li>
					<li>
						{exportData?.people.people.reduce((sum, p) => sum + p.dateRanges.length, 0) || 0} date ranges
					</li>
				</ul>
			</div>

			<div
				style={{
					backgroundColor: '#f5f5f5',
					border: '1px solid #ddd',
					borderRadius: '4px',
					padding: '1rem',
					overflow: 'auto',
					maxHeight: '70vh',
				}}
			>
				<pre style={{margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
					<code>{jsonString}</code>
				</pre>
			</div>
		</div>
	);
}
