"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GameEntriesTable } from "./game-entries-table"
import { Trophy, Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Interfaces to match backend data structure
interface Game {
  id: string;
  created_at: string;
  range: number;
  status: "active" | "closed" | "revealed" | "completed";
  winning_number: number | null;
  title: string | null;
  description: string | null;
}

interface GameEntry {
  userId: string;
  userName: string;
  numbers: number[];
}

interface WinnerModalProps {
  game: Game | null
  entries: GameEntry[]
  open: boolean
  onClose: () => void
  loadingEntries: boolean // New prop
  entriesError: string | null // New prop
}

export function WinnerModal({ game, entries, open, onClose, loadingEntries, entriesError }: WinnerModalProps) {
  if (!game) return null

  // Calculate winners from the provided entries
  const winners = game.winning_number != null 
    ? [...new Set(entries.filter(entry => entry.numbers.includes(game.winning_number!)).map(entry => entry.userName))]
    : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col border-border bg-card text-card-foreground">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">{game.title || "Untitled Game"} - Results</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4 overflow-hidden flex-1">
          {/* Fixed header section - winning number and winners */}
          <div className="flex-shrink-0">
            <div className="flex flex-col items-center justify-center py-4">
              <Trophy className="mb-2 h-10 w-10 text-accent" />
              <p className="mb-1 text-sm text-muted-foreground">Winning Number</p>
              <p className="gold-shimmer text-6xl font-bold">{game.winning_number || 'N/A'}</p>
            </div>

            {winners.length > 0 ? (
              <Card className="border-accent/30 bg-accent/10">
                <CardHeader className="py-2">
                  <CardTitle className="text-center text-accent text-sm">🎉 Winner 🎉</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex flex-wrap justify-center gap-2 max-h-20 overflow-y-auto">
                    {winners.map((winner, idx) => (
                      <span key={idx} className="rounded-full bg-accent/10 px-4 py-2 text-lg font-medium text-accent">
                        {winner}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-center text-muted-foreground text-sm">No winners for this game.</p>
            )}
          </div>

          {/* Scrollable entries section */}
          <Card className="border-border bg-secondary/30 flex-1 flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="py-2 flex-shrink-0">
              <CardTitle className="text-base">All Entries</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {loadingEntries ? (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : entriesError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error Loading Entries</AlertTitle>
                  <AlertDescription>{entriesError}</AlertDescription>
                </Alert>
              ) : entries.length > 0 ? (
                <GameEntriesTable entries={entries} winningNumber={game.winning_number} />
              ) : (
                <p className="text-center text-muted-foreground">No entries for this game yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
