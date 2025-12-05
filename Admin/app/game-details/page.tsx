"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog" // Import AlertDialog components
import { GameEntriesTable } from "@/components/game-entries-table"
import { Sparkles, Loader2, AlertTriangle, Gamepad2, XCircle } from "lucide-react"

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

export default function GameDetailsPage() {
  const [gameToShow, setGameToShow] = useState<Game | null>(null)
  const [entries, setEntries] = useState<GameEntry[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revealing, setRevealing] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false) // State for modal

  const fetchGameData = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const token = localStorage.getItem("sb_admin_token")
      const res = await fetch("/api/admin/game-status", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch game status.")
      const data = await res.json()
      
      const game = data.activeGame || data.lastClosedGame || null
      setGameToShow(game)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGameData()
  }, [fetchGameData])

  useEffect(() => {
    if (!gameToShow) {
      setEntries([])
      return
    }

    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem("sb_admin_token")
        const res = await fetch(`/api/admin/games/${gameToShow.id}/entries`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch game entries.")
        const data: GameEntry[] = await res.json()
        setEntries(data)
      } catch (err: any) {
        // Non-critical error, just log it
        console.error(`Failed to load entries: ${err.message}`)
      }
    }
    fetchEntries()
  }, [gameToShow])

  const getStatusColor = (status: Game["status"]) => {
    switch (status) {
      case "active": return "bg-primary/20 text-primary border-primary/30"
      case "closed": return "bg-amber-500/20 text-amber-500 border-amber-500/30"
      case "revealed": return "bg-green-500/20 text-green-500 border-green-500/30"
      default: return "bg-zinc-500/20 text-zinc-500 border-zinc-500/30"
    }
  }

  // New function to handle the actual API call after confirmation
  const confirmReveal = async () => {
    if (!gameToShow || gameToShow.status === 'revealed') return
    setRevealing(true)
    setError(null)
    try {
      const token = localStorage.getItem("sb_admin_token")
      const res = await fetch("/api/lucky-grid/reveal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to reveal winner.")
      
      // Refetch game data to get the updated status
      await fetchGameData()
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRevealing(false)
      setShowConfirmModal(false) // Close modal
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }
    
    if (error) {
      return (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )
    }
    
    if (!gameToShow) {
      return (
        <Card className="border-border bg-card text-center p-10">
            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <CardTitle className="mt-4">No Current Game</CardTitle>
            <p className="text-muted-foreground mt-2">There is no active or recently closed game to display.</p>
            <Button asChild className="mt-6">
                <Link href="/create-game">Create a New Game</Link>
            </Button>
        </Card>
      )
    }

    return (
      <>
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-card-foreground">{gameToShow.title || "Untitled Game"}</CardTitle>
              <Badge variant="outline" className={getStatusColor(gameToShow.status)}>
                {gameToShow.status.charAt(0).toUpperCase() + gameToShow.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-card-foreground">{gameToShow.description || "No description."}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Range</p>
                <p className="text-card-foreground">1 - {gameToShow.range}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-card-foreground">{new Date(gameToShow.created_at).toLocaleString()}</p>
              </div>
            </div>

            {gameToShow.status === "revealed" && gameToShow.winning_number != null && (
              <div className="rounded-lg bg-green-500/10 p-4 text-center">
                <p className="text-sm text-green-400">Winning Number</p>
                <p className="text-4xl font-bold text-green-400">{gameToShow.winning_number}</p>
              </div>
            )}

            {gameToShow.status !== "revealed" && ( // Show button if not already revealed
              <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90" 
                    disabled={revealing}
                  >
                    {revealing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {gameToShow.status === "active" ? "Force Close & Reveal Winner" : "Reveal Winning Number"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center text-orange-500">
                      <AlertTriangle className="mr-2 h-5 w-5" /> Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will immediately close the current game (if active) and randomly select a winning number. This cannot be undone. All unpicked numbers will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={revealing}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmReveal} disabled={revealing}>
                      {revealing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      {gameToShow.status === "active" ? "Confirm Force Close & Reveal" : "Confirm Reveal Winner"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {/* Display relevant messages based on game status */}
            {gameToShow.status === "active" && (
                <p className="text-sm text-muted-foreground flex items-center">
                    <XCircle className="h-4 w-4 mr-1 text-red-500" />
                    The game is currently active. Entries are being collected. Forcing reveal will end it early.
                </p>
            )}
            {gameToShow.status === "closed" && (
                <p className="text-sm text-muted-foreground flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                    The game is closed. Revealing the winner will finalize this game.
                </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Entries ({entries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length > 0 ? (
              <GameEntriesTable entries={entries} winningNumber={gameToShow.winning_number} />
            ) : (
              <p className="text-center text-muted-foreground">No entries for this game yet.</p>
            )}
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Game Details</h1>
          <p className="text-muted-foreground">View and manage the current lottery game</p>
        </div>
        {renderContent()}
      </div>
    </AdminLayout>
  )
}
