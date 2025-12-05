"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WinnerModal } from "@/components/winner-modal"
import { Trophy, Calendar, Loader2, AlertTriangle, Gamepad2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Interfaces to match backend data structure (re-using from game-details)
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

export default function GameHistoryPage() {
  const [gameHistory, setGameHistory] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [selectedGameEntries, setSelectedGameEntries] = useState<GameEntry[]>([])
  const [entriesLoading, setEntriesLoading] = useState(false)
  const [entriesError, setEntriesError] = useState<string | null>(null)


  const fetchGameHistory = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const token = localStorage.getItem("sb_admin_token")
      if (!token) throw new Error("Authentication token not found.")

      const res = await fetch("/api/admin/game-history", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to fetch game history.")
      }
      const data: Game[] = await res.json()
      setGameHistory(data)
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching game history:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGameHistory()
  }, [fetchGameHistory])

  const handleGameClick = useCallback(async (game: Game) => {
    setSelectedGame(game)
    setEntriesLoading(true)
    setEntriesError(null)
    try {
      const token = localStorage.getItem("sb_admin_token")
      if (!token) throw new Error("Authentication token not found.")

      const res = await fetch(`/api/admin/games/${game.id}/entries`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to fetch game entries.")
      }
      const data: GameEntry[] = await res.json()
      setSelectedGameEntries(data)
    } catch (err: any) {
      setEntriesError(err.message)
      console.error("Error fetching game entries for modal:", err)
    } finally {
      setEntriesLoading(false)
    }
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Game History</h1>
          <p className="text-muted-foreground">View past lottery results</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {!loading && !error && (
          gameHistory.length === 0 ? (
            <Card className="border-border bg-card text-center p-10">
                <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground" />
                <CardTitle className="mt-4">No Game History</CardTitle>
                <p className="text-muted-foreground mt-2">No past games have been revealed yet.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gameHistory.map((game) => (
                <Card
                  key={game.id}
                  className="cursor-pointer border-border bg-card transition-colors hover:border-primary/50"
                  onClick={() => handleGameClick(game)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-card-foreground">{game.title || "Untitled Game"}</CardTitle>
                      <Trophy className="h-5 w-5 text-accent" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{game.description || "No description."}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(game.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                        Range: 1-{game.range}
                      </Badge>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Winning #</p>
                        <p className="gold-shimmer text-xl font-bold">{game.winning_number}</p>
                      </div>
                    </div>
                    {selectedGameEntries.length > 0 && selectedGameEntries.some(entry => entry.numbers.includes(game.winning_number || -1)) && (
                      <p className="text-xs text-primary">
                        {selectedGameEntries.filter(entry => entry.numbers.includes(game.winning_number || -1)).length} winner(s)
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
        
        <WinnerModal
          game={selectedGame}
          entries={selectedGameEntries}
          open={!!selectedGame}
          onClose={() => {
            setSelectedGame(null)
            setSelectedGameEntries([]) // Clear entries when modal closes
          }}
          loadingEntries={entriesLoading}
          entriesError={entriesError}
        />
      </div>
    </AdminLayout>
  )
}
