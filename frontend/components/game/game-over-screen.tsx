"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import PrizeHistory from "./prize-history"

export default function GameOverScreen({
  result,
  onBackToPlay,
}: {
  result: any
  onBackToPlay: () => void
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className={`text-7xl mb-6 ${result?.isWinner ? "animate-bounce" : ""}`}>
          {result?.isWinner ? "🎉" : "💔"}
        </div>
        <h1 className={`text-5xl font-bold mb-4 text-balance ${result?.isWinner ? "text-green-400" : "text-red-400"}`}>
          {result?.isWinner ? "You Won!" : "Game Over"}
        </h1>
        <p className="text-2xl text-slate-300 text-balance">
          {result?.isWinner ? result?.prizeName : "No prize this time. Better luck next time!"}
        </p>
      </div>

      {result?.isWinner && (
        <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700 p-8 mb-8">
          <div className="text-center">
            <p className="text-slate-300 mb-2">Your Prize</p>
            <p className="text-3xl font-bold text-green-400">{result?.prizeName}</p>
            {result?.duration && (
              <p className="text-slate-400 mt-2">Completed in {(result.duration / 1000).toFixed(1)} seconds</p>
            )}
          </div>
        </Card>
      )}

      {result?.history && result.history.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Your Game History</h2>
          <PrizeHistory history={result.history} />
        </div>
      )}

      <div className="text-center">
        <Button onClick={onBackToPlay} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 text-lg">
          Back to Play
        </Button>
      </div>
    </div>
  )
}
