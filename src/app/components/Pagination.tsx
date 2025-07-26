import {
	Pagination as PaginationComponent,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/app/components/ui/pagination';

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
		<PaginationComponent className="my-8">
			<PaginationContent>
				<PaginationItem>
					{hasPrevious ? (
						<PaginationPrevious href={buildPreviousUrl()} />
					) : (
						<PaginationPrevious
							href="#"
							aria-disabled="true"
							className="pointer-events-none opacity-50"
						/>
					)}
				</PaginationItem>
				<PaginationItem>
					<span className="px-4 text-sm text-muted-foreground">
						Page {currentPage} {totalPages > 0 && `of ${totalPages}`}
					</span>
				</PaginationItem>
				<PaginationItem>
					{hasNext ? (
						<PaginationNext href={buildNextUrl()} />
					) : (
						<PaginationNext
							href="#"
							aria-disabled="true"
							className="pointer-events-none opacity-50"
						/>
					)}
				</PaginationItem>
			</PaginationContent>
		</PaginationComponent>
	);
}
