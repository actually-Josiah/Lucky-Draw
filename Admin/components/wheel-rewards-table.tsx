'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Reward } from "@/app/wheel-rewards/page" // Import the Reward type
import { cn } from "@/lib/utils"

interface WheelRewardsTableProps {
    rewards: Reward[];
    onClaimReward: (rewardId: string) => Promise<void>;
}

export function WheelRewardsTable({ rewards, onClaimReward }: WheelRewardsTableProps) {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">Spin Code</TableHead>
                        <TableHead>Prize</TableHead>
                        <TableHead>Winner</TableHead>
                        <TableHead>Winner Phone</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right w-[180px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rewards.length > 0 ? (
                        rewards.map((reward) => (
                            <TableRow key={reward.id}>
                                <TableCell className="font-mono">{reward.spin_code}</TableCell>
                                <TableCell>{reward.prize_name}</TableCell>
                                <TableCell className="font-medium">{reward.user_name}</TableCell>
                                <TableCell>{reward.user_phone}</TableCell>
                                <TableCell>
                                    <Badge
                                        className={cn(
                                            "capitalize",
                                            reward.status === 'claimed'
                                                ? "bg-green-100 text-green-800 border-green-300"
                                                : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                        )}
                                        variant="outline"
                                    >
                                        {reward.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(reward.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    {reward.status === 'unclaimed' ? (
                                        <Button
                                            size="sm"
                                            onClick={() => onClaimReward(reward.id)}
                                        >
                                            Mark as Claimed
                                        </Button>
                                    ) : (
                                       <span className="text-sm text-muted-foreground">
                                            Claimed on {new Date(reward.claimed_at!).toLocaleDateString()}
                                       </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No rewards found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
