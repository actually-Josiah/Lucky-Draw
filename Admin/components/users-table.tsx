import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/mock-data"

interface UsersTableProps {
  users: User[]
  title?: string
}

export function UsersTable({ users, title = "Users" }: UsersTableProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Phone Number</TableHead>
              <TableHead className="text-muted-foreground">Tokens</TableHead>
              <TableHead className="text-muted-foreground">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-border hover:bg-secondary/50">
                <TableCell className="font-medium text-card-foreground">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-muted-foreground">{user.phone_number}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {user.tokens}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
