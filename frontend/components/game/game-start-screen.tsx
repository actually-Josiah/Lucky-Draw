"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import PrizesDisplay from "./prizes-display"

export default function GameStartScreen({ onGameStart }: { onGameStart: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleStartGame = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/start-session", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to start game")
        return
      }

      onGameStart({
        sessionId: data.sessionId,
        attempts: data.attempts,
        prizeHistory: [],
      })
    } catch (err) {
      setError("Network error. Please try again.")
      console.error("[v0] Error starting game:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 text-balance">Ready to Win Big?</h1>
        <p className="text-xl text-slate-400 text-balance">Try your luck and pull cards to win amazing prizes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card className="bg-slate-800/50 border-slate-700 p-8 flex flex-col justify-center items-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold text-white mb-4">Start Your Game</h2>
            <p className="text-slate-300 mb-6">Click below to begin. You get 2 attempts!</p>
            <Button
              onClick={handleStartGame}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 text-lg"
            >
              {loading ? "Starting..." : "Start Game"}
            </Button>
            {error && <p className="text-red-400 mt-4">{error}</p>}
          </div>
        </Card>

        <div>
          <PrizesDisplay />
        </div>
      </div>
    </div>
  )
}
