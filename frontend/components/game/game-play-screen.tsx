"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import PrizeCards, { PRIZE_CONFIG } from "./prize-cards"
import PrizeHistory from "./prize-history"

export default function GamePlayScreen({
  sessionData,
  onGameEnd,
}: {
  sessionData: any
  onGameEnd: (result: any) => void
}) {
  const [attempts, setAttempts] = useState(sessionData.attempts)
  const [prizeHistory, setPrizeHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastResult, setLastResult] = useState<any>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedPrizeId, setSelectedPrizeId] = useState<number | null>(null)

  const getCardIdFromReward = (rewardText: string): number => {
    const prize = PRIZE_CONFIG.find((p) => p.reward_text === rewardText)
    return prize?.id || 5 // Default to Loss (id 5)
  }

  const handlePullCard = async () => {
    setLoading(true)
    setError("")
    setIsAnimating(true)
    setSelectedPrizeId(null)

    try {
      const response = await fetch(`/api/pull-card/${sessionData.sessionId}`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to pull card")
        setIsAnimating(false)
        return
      }

      const result = data.result
      setLastResult(result)

      const cardId = getCardIdFromReward(result.outcome)
      setSelectedPrizeId(cardId)

      setPrizeHistory([...prizeHistory, result])
      setAttempts(data.session.attemptsRemaining)

      // Delay before showing results and checking game over
      setTimeout(() => {
        setIsAnimating(false)

        if (data.session.attemptsRemaining <= 0 || result.isWinner) {
          setTimeout(() => {
            onGameEnd({
              outcome: result.outcome,
              prizeName: result.prizeName,
              isWinner: result.isWinner,
              history: [...prizeHistory, result],
              duration: result.duration,
            })
          }, 1500)
        }
      }, 2500) // Animation duration
    } catch (err) {
      setError("Network error. Please try again.")
      setIsAnimating(false)
      console.error("[v0] Error pulling card:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {/* Main Game Area */}
        <div className="md:col-span-3">
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <PrizeCards isAnimating={isAnimating} selectedPrizeId={selectedPrizeId} />

            <div className="mt-8 flex flex-col items-center">
              <Button
                onClick={handlePullCard}
                disabled={loading || attempts <= 0}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 text-lg"
              >
                {loading ? "Pulling..." : "Pull Card"}
              </Button>
              {error && <p className="text-red-400 mt-4">{error}</p>}
              {attempts <= 0 && <p className="text-amber-400 mt-4 font-semibold">No attempts remaining!</p>}
            </div>
          </Card>
        </div>

        {/* Side Info */}
        <div>
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Game Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Attempts Left</p>
                <p className="text-2xl font-bold text-red-400">{attempts}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Cards Pulled</p>
                <p className="text-2xl font-bold text-blue-400">{prizeHistory.length}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Wins</p>
                <p className="text-2xl font-bold text-green-400">{prizeHistory.filter((p) => p.isWinner).length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {prizeHistory.length > 0 && <PrizeHistory history={prizeHistory} />}
    </div>
  )
}
