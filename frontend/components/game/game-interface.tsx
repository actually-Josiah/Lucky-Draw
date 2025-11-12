"use client"

import { useState } from "react"
import GameStartScreen from "./game-start-screen"
import GamePlayScreen from "./game-play-screen"
import GameOverScreen from "./game-over-screen"

export default function GameInterface({ onGameOver }: { onGameOver: () => void }) {
  const [gameState, setGameState] = useState<"start" | "playing" | "over">("start")
  const [sessionData, setSessionData] = useState<any>(null)
  const [gameResult, setGameResult] = useState<any>(null)

  const handleGameStart = (data: any) => {
    setSessionData(data)
    setGameState("playing")
  }

  const handleGameEnd = (result: any) => {
    setGameResult(result)
    setGameState("over")
  }

  const handleBackToPlay = () => {
    setGameState("start")
    setSessionData(null)
    setGameResult(null)
    onGameOver()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {gameState === "start" && <GameStartScreen onGameStart={handleGameStart} />}
      {gameState === "playing" && <GamePlayScreen sessionData={sessionData} onGameEnd={handleGameEnd} />}
      {gameState === "over" && <GameOverScreen result={gameResult} onBackToPlay={handleBackToPlay} />}
    </div>
  )
}
