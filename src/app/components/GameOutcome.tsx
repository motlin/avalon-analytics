import {Card, CardContent, CardHeader, CardTitle} from '@/app/components/ui/card';
import {Badge} from '@/app/components/ui/badge';
import {cn} from '@/lib/utils';

interface GameOutcomeProps {
	outcome: any;
}

export function GameOutcomeComponent({outcome}: GameOutcomeProps) {
	const isGoodWin = outcome.state === 'GOOD_WIN';
	const winner = isGoodWin ? 'GOOD' : 'EVIL';

	return (
		<Card
			className={cn(
				'border-2 mt-4',
				isGoodWin
					? 'border-green-500 bg-green-50 dark:bg-green-950/50'
					: 'border-red-500 bg-red-50 dark:bg-red-950/50',
			)}
		>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Game Over</CardTitle>
					<Badge variant={isGoodWin ? 'success' : 'destructive'}>{winner} Wins!</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-2">
				<p className="text-sm">
					<span className="font-medium">Reason:</span> {outcome.message}
				</p>
				{outcome.assassinated && (
					<p className="text-sm">
						<span className="font-medium">Assassinated:</span> {outcome.assassinated}
					</p>
				)}

				{outcome.roles && (
					<div className="mt-4">
						<h4 className="font-medium mb-3">Revealed Roles</h4>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
							{outcome.roles.map((player: any, index: number) => (
								<Card
									key={index}
									className={cn('p-3', player.assassin && 'bg-red-100 dark:bg-red-950/50')}
								>
									<div className="text-sm">
										<span className="font-medium">{player.name}</span>: {player.role}
										{player.assassin && (
											<Badge
												variant="destructive"
												className="ml-1 text-xs"
											>
												Assassin
											</Badge>
										)}
									</div>
								</Card>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
