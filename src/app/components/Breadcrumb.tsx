import {
	Breadcrumb as BreadcrumbComponent,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/app/components/ui/breadcrumb';

interface BreadcrumbProps {
	items: Array<{
		label: string;
		href?: string;
	}>;
}

export function Breadcrumb({items}: BreadcrumbProps) {
	return (
		<BreadcrumbComponent className="mb-4">
			<BreadcrumbList>
				{items.map((item, index) => (
					<div
						key={index}
						className="flex items-center"
					>
						<BreadcrumbItem>
							{item.href ? (
								<BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
							) : (
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							)}
						</BreadcrumbItem>
						{index < items.length - 1 && <BreadcrumbSeparator />}
					</div>
				))}
			</BreadcrumbList>
		</BreadcrumbComponent>
	);
}
