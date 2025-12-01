interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
}

export function Breadcrumb({items}: BreadcrumbProps) {
	return (
		<>
			<style>{`
				.breadcrumb-link:hover {
					text-decoration: underline !important;
				}
			`}</style>
			<nav
				aria-label="Breadcrumb"
				style={{padding: '1rem', paddingBottom: 0}}
			>
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
						<li
							key={index}
							style={{display: 'flex', alignItems: 'center'}}
						>
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
									className="breadcrumb-link"
									style={{
										color: '#0066cc',
										textDecoration: 'none',
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
		</>
	);
}
