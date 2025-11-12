"use client"

import { motion } from 'framer-motion'; // ✅ CORRECT PATH
import Image from "next/image"
import { useEffect, useState } from "react"

interface PrizeModalProps {
  prize: string
  image: string
  onPlayAgain: () => void
}

function Confetti() {
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
  }))

  return (
    <>
      {confetti.map((item) => (
        <motion.div
          key={item.id}
          className="fixed pointer-events-none"
          style={{
            left: `${item.left}%`,
            top: "-10px",
            zIndex: 50,
          }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: 600 }}
          transition={{ duration: item.duration, delay: item.delay, ease: "easeIn" }}
        >
          <div className="text-3xl">{["🎉", "🎊", "✨", "🎁", "⭐"][Math.floor(Math.random() * 5)]}</div>
        </motion.div>
      ))}
    </>
  )
}

export default function PrizeModal({ prize, image, onPlayAgain }: PrizeModalProps) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4"
      >
        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="bg-gradient-to-b from-red-300 to-red-500 rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6 border border-blue-500/20 relative z-50"
        >
          {/* Prize image with animation */}
          <motion.div
            className="rounded-xl overflow-hidden shadow-xl mx-auto"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={prize}
              width={280}
              height={280}
              className="w-full h-auto"
              priority
            />
          </motion.div>

          {/* Prize text and message */}
          <div className="space-y-3 text-center">
            <p className="text-4xl font-bold text-white">Congratulations!</p>
            <p className="text-2xl font-bold text-yellow-300">{prize}</p>
            <p className="text-gray-300 text-lg">You won an amazing prize! 🎉</p>
          </div>

          {/* Play again button */}
          <motion.button
            onClick={onPlayAgain}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-8 py-3 bg-gradient-to-r from-white to-red-300 hover:from-red-300 hover:to-red-400 text-slate-600 font-bold rounded-lg transition-colors shadow-lg"
          >
            Play Again
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  )
}
