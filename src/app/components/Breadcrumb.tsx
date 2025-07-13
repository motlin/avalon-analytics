import type {ReactNode} from 'react';

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
}

export function Breadcrumb({items}: BreadcrumbProps): ReactNode {
	return (
		<nav aria-label="Breadcrumb" style={{marginBottom: '1rem'}}>
			<ol
				style={{
					display: 'flex',
					listStyle: 'none',
					padding: 0,
					margin: 0,
					fontSize: '0.9rem',
					color: '#666',
				}}
			>
				{items.map((item, index) => (
					<li key={index} style={{display: 'flex', alignItems: 'center'}}>
						{index > 0 && (
							<span
								style={{
									margin: '0 0.5rem',
									color: '#999',
								}}
								aria-hidden="true"
							>
								&gt;
							</span>
						)}
						{item.href ? (
							<a
								href={item.href}
								style={{
									color: '#0066cc',
									textDecoration: 'none',
								}}
								onMouseOver={(e) => {
									e.currentTarget.style.textDecoration = 'underline';
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.textDecoration = 'none';
								}}
							>
								{item.label}
							</a>
						) : (
							<span
								style={{
									color: '#333',
									fontWeight: '500',
								}}
								aria-current="page"
							>
								{item.label}
							</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}