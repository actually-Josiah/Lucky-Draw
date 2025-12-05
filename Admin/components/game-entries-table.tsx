import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { GameEntry } from "@/lib/mock-data"

interface GameEntriesTableProps {
  entries: GameEntry[]
  winningNumber?: number
}

export function GameEntriesTable({ entries, winningNumber }: GameEntriesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground">User</TableHead>
          <TableHead className="text-muted-foreground">Numbers Picked</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.userId} className="border-border hover:bg-secondary/50">
            <TableCell className="font-medium text-card-foreground">{entry.userName}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {entry.numbers.map((num, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className={
                      winningNumber !== undefined && num === winningNumber
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }
                  >
                    {num}
                  </Badge>
                ))}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
