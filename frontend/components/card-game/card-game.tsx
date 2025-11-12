"use client"

import { useState, useEffect } from "react"
import Card from "./card"
import { useRouter } from "next/navigation"
import PrizeModal from "./prize-modal"

interface CardItem {
  id: number
  prize: string | null
  image: string
}

export default function CardGame() {
  const router = useRouter()
  const [cards, setCards] = useState<CardItem[]>(
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      prize: i === 2 ? "🎁 $50 Gift Card" : i === 5 ? "🎉 Free Premium Pass" : null,
      image:
        i === 2 ? "/gift-card-prize.jpg" : i === 5 ? "/premium-pass-reward.jpg" : "/abstract-question-mark.png",
    })),
  )

  const [tries, setTries] = useState(1)
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [flipped, setFlipped] = useState<Set<number>>(new Set())

  // ⏱️ Timer counter state
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (gameOver) return
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [gameOver])

  const handleCardClick = (card: CardItem) => {
    if (gameOver || tries === 0 || flipped.has(card.id)) return

    const newFlipped = new Set(flipped)
    newFlipped.add(card.id)
    setFlipped(newFlipped)

    if (card.prize) {
      setSelectedCard(card)
      setGameOver(true)
    } else {
      setTries(0)
      setGameOver(true)
    }
  }

  const resetGame = () => {
    const prizeIndices = [Math.floor(Math.random() * 9)]
    let secondPrize = Math.floor(Math.random() * 9)
    while (secondPrize === prizeIndices[0]) {
      secondPrize = Math.floor(Math.random() * 9)
    }
    prizeIndices.push(secondPrize)

    const newCards = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      prize: prizeIndices.includes(i) ? (i === prizeIndices[0] ? "🎁 $50 Gift Card" : "🎉 Free Premium Pass") : null,
      image: prizeIndices.includes(i)
        ? i === prizeIndices[0]
          ? "/gift-card-prize.jpg"
          : "/premium-pass-reward.jpg"
        : "/abstract-question-mark.png",
    }))

    setCards(newCards)
    setTries(1)
    setSelectedCard(null)
    setGameOver(false)
    setFlipped(new Set())
    setSeconds(0) // reset timer
  }

  const gohome = () => {
    router.push("/game")
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Click or tap to select your lucky card</h1>
        <p className="text-white text-lg">
          You have <span className="font-bold text-red-600">{Math.max(0, tries)}</span> try left
        </p>

        {/* Timer counter */}
        <p className="text-white mt-2 text-3xl">
          Time Elapsed: <span className="font-semibold text-yellow-400 text-4xl">{seconds}</span><span className="font-semibold text-yellow-400">s</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            isFlipped={flipped.has(card.id)}
            onClick={() => handleCardClick(card)}
            disabled={gameOver || tries === 0 || flipped.has(card.id)}
          />
        ))}
      </div>

      {gameOver && (
        <div className="text-center">
          {selectedCard ? (
            <PrizeModal prize={selectedCard.prize || ""} image={selectedCard.image} onPlayAgain={gohome} />
          ) : (
            <div className="space-y-4">
              <p className="text-2xl font-bold text-white">Sorry you didn't win this time, be bold and try again!</p>
              <button
                onClick={gohome}
                className="px-8 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
