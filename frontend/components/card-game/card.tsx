"use client"

import { motion } from 'framer-motion'; // ✅ CORRECT PATH
import Image from "next/image"

interface CardProps {
  card: { id: number; prize: string | null; image: string }
  isFlipped: boolean
  onClick: () => void
  disabled: boolean
}

export default function Card({ card, isFlipped, onClick, disabled }: CardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full aspect-square rounded-lg font-bold text-lg transition-all ${
        disabled && !isFlipped ? "opacity-50 cursor-not-allowed" : ""
      } ${!disabled && !isFlipped ? "cursor-pointer hover:scale-105" : ""}`}
      whileHover={!disabled && !isFlipped ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isFlipped ? { scale: 0.95 } : {}}
    >
      <div
        className="w-full h-full relative"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.1s",
        }}
      >
        {/* Back of card - shows question mark */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <span className="text-5xl font-bold">?</span>
        </div>

        {/* Front of card - displays prize image */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Image
            src={card.image || "/placeholder.svg"}
            alt={card.prize || "Try Again"}
            width={200}
            height={250}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>
    </motion.button>
  )
}
