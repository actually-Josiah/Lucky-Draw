"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

export const PRIZE_CONFIG = [
  {
    id: 1,
    name: "Main Prize: The Big One! 🏆",
    reward_text: "Main_Prize",
    probability: 0.0003,
    color: "from-yellow-500 to-orange-600",
  },
  {
    id: 2,
    name: "Mid Prize: $100 Coupon 🎉",
    reward_text: "Mid_Prize_100",
    probability: 0.05,
    color: "from-purple-500 to-pink-600",
  },
  {
    id: 3,
    name: "Small Prize: Free Coffee ☕",
    reward_text: "Small_Prize_Coffee",
    probability: 0.1,
    color: "from-amber-500 to-orange-500",
  },
  {
    id: 4,
    name: "Try Again (+1 Attempt) ♻️",
    reward_text: "Try_Again",
    probability: 0.05,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 5,
    name: "No Prize (Loss) 😔",
    reward_text: "Loss",
    probability: 0.7997,
    color: "from-slate-600 to-slate-700",
  },
]

interface PrizeCardsProps {
  isAnimating: boolean
  selectedPrizeId?: number
  onAnimationComplete?: () => void
}

export default function PrizeCards({ isAnimating, selectedPrizeId, onAnimationComplete }: PrizeCardsProps) {
  const [highlightedCard, setHighlightedCard] = useState<number | null>(null)

  useEffect(() => {
    if (!isAnimating) {
      setHighlightedCard(null)
      return
    }

    let currentCard = 0
    const interval = setInterval(() => {
      currentCard = (currentCard + 1) % PRIZE_CONFIG.length
      setHighlightedCard(PRIZE_CONFIG[currentCard].id)
    }, 100) // Switch card every 100ms

    return () => clearInterval(interval)
  }, [isAnimating])

  // When animation ends, show the selected card
  useEffect(() => {
    if (!isAnimating && selectedPrizeId) {
      setHighlightedCard(selectedPrizeId)
      onAnimationComplete?.()
    }
  }, [isAnimating, selectedPrizeId, onAnimationComplete])

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Select Your Prize</h2>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {PRIZE_CONFIG.map((prize) => (
          <div
            key={prize.id}
            className={`transition-all duration-200 ${
              highlightedCard === prize.id ? "scale-110 ring-4 ring-yellow-400" : "scale-100"
            }`}
          >
            <Card
              className={`bg-gradient-to-br ${prize.color} border-0 p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform ${
                highlightedCard === prize.id ? "shadow-2xl shadow-yellow-400" : ""
              }`}
            >
              <div className="text-3xl mb-2">{prize.name.split(" ")[prize.name.split(" ").length - 1]}</div>
              <p className="text-xs text-center font-semibold text-white line-clamp-2">{prize.name.split(":")[0]}</p>
              <p className="text-xs text-white/70 mt-1">{(prize.probability * 100).toFixed(2)}%</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
