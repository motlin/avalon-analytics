interface PaginationProps {
	currentPage: number;
	totalPages: number;
	baseUrl: string;
	hasNext: boolean;
	hasPrevious: boolean;
	nextPageToken?: string;
	previousPageUrl?: string;
}

export function Pagination({
	currentPage,
	totalPages,
	baseUrl,
	hasNext,
	hasPrevious,
	nextPageToken,
	previousPageUrl,
}: PaginationProps) {
	const buildNextUrl = () => {
		const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
		url.searchParams.set('page', (currentPage + 1).toString());
		if (nextPageToken) {
			url.searchParams.set('pageToken', nextPageToken);
		}
		return url.pathname + url.search;
	};

	const buildPreviousUrl = () => {
		if (previousPageUrl) {
			return previousPageUrl;
		}
		const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
		if (currentPage > 2) {
			url.searchParams.set('page', (currentPage - 1).toString());
		}
		return url.pathname + url.search;
	};

	return (
		<>
			<style>{`
				.pagination-button {
					background: #0066cc;
					color: white;
					border: none;
					padding: 0.5rem 1rem;
					margin: 0 0.25rem;
					border-radius: 4px;
					text-decoration: none;
					display: inline-block;
					font-size: 0.9rem;
					transition: background-color 0.2s;
				}
				.pagination-button:hover:not(.disabled) {
					background: #0052a3;
				}
				.pagination-button.disabled {
					background: #ccc;
					color: #666;
					cursor: not-allowed;
				}
				.pagination-button.current {
					background: #333;
				}
				.pagination-info {
					color: #666;
					font-size: 0.9rem;
					margin: 0 1rem;
				}
			`}</style>
			<nav
				aria-label="Games pagination"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					margin: '2rem 0',
					gap: '0.5rem',
				}}
			>
				{hasPrevious ? (
					<a
						href={buildPreviousUrl()}
						className="pagination-button"
					>
						← Previous
					</a>
				) : (
					<span className="pagination-button disabled">← Previous</span>
				)}

				<span className="pagination-info">
					Page {currentPage} {totalPages > 0 && `of ${totalPages}`}
				</span>

				{hasNext ? (
					<a
						href={buildNextUrl()}
						className="pagination-button"
					>
						Next →
					</a>
				) : (
					<span className="pagination-button disabled">Next →</span>
				)}
			</nav>
		</>
	);
}
