"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlusCircle, CheckCircle, AlertTriangle, Loader2, Gamepad2 } from "lucide-react"

export default function CreateGamePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [range, setRange] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [statusLoading, setStatusLoading] = useState(true)
  const [activeGame, setActiveGame] = useState<any | null>(null)

  useEffect(() => {
    const fetchGameStatus = async () => {
      try {
        const token = localStorage.getItem("sb_admin_token")
        const res = await fetch("/api/admin/game-status", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch game status.")
        const data = await res.json()
        setActiveGame(data.activeGame)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setStatusLoading(false)
      }
    }
    fetchGameStatus()
  }, [success]) // Refetch status after successfully creating a game

  const handleCreate = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("sb_admin_token")
      if (!token) throw new Error("Authentication token not found.")

      const res = await fetch("/api/lucky-grid/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, description, range: Number(range) }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create game.")
      
      setSuccess(`Game "${data.game.title}" created successfully!`)
      setTitle("")
      setDescription("")
      setRange("")
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    if (statusLoading) {
      return (
        <div className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }
    if (activeGame) {
      return (
        <Card className="max-w-xl border-border bg-card text-center p-10">
            <Gamepad2 className="h-12 w-12 mx-auto text-primary" />
            <CardTitle className="mt-4">A Game is Already Active</CardTitle>
            <p className="text-muted-foreground mt-2">
                You must end the current game before creating a new one.
            </p>
            <Button asChild className="mt-6">
                <Link href="/game-details">Manage Active Game</Link>
            </Button>
        </Card>
      )
    }
    return (
        <Card className="max-w-xl border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Game Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default" className="bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-card-foreground">Title</Label>
              <Input id="title" placeholder="e.g., Weekly Mega Jackpot" value={title} onChange={(e) => setTitle(e.target.value)} className="border-border bg-input text-foreground placeholder:text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-card-foreground">Description</Label>
              <Textarea id="description" placeholder="e.g., Pick a number from 1 to 100 to win!" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24 border-border bg-input text-foreground placeholder:text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="range" className="text-card-foreground">Number Range</Label>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="border-border bg-input text-foreground"><SelectValue placeholder="Select range" /></SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="20">1 - 20</SelectItem>
                  <SelectItem value="30">1 - 30</SelectItem>
                  <SelectItem value="50">1 - 50</SelectItem>
                  <SelectItem value="100">1 - 100</SelectItem>
                  <SelectItem value="200">1 - 200</SelectItem>
                  <SelectItem value="500">1 - 500</SelectItem>
                  <SelectItem value="1000">1 - 1000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCreate} disabled={!title || !description || !range || isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>) : (<><PlusCircle className="mr-2 h-4 w-4" />Create Game</>)}
            </Button>
          </CardContent>
        </Card>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Game</h1>
          <p className="text-muted-foreground">Set up a new lottery game</p>
        </div>
        {renderContent()}
      </div>
    </AdminLayout>
  )
}
