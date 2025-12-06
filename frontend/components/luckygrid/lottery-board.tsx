//components/luckygrid/lottery-board.tsx
"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import NumberCard from "./number-card"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

// --- Interface Alignment ---
interface GameData {
  id: string
  range: number
  status: "active" | "closed" | "revealed" | "completed";
  winning_number: number | null
  created_at: string
}

interface Pick {
  id: string
  game_id: string
  number: number
  user_id: string
  picked_at: string
}

interface LotteryBoardProps {
  gameData: GameData
  picks: Pick[]
}

const colors = [
 "bg-red-700",     // Deep Santa Red
  "bg-green-800",   // Pine Forest Green
  "bg-amber-500",   // Warm Gold/Lights
  "bg-rose-800",    // Cranberry/Burgundy
  "bg-emerald-600", // Bright Holly Leaf Green
  "bg-blue-900",    // "Silent Night" Deep Blue
  "bg-orange-700",  // Gingerbread/Spice
  "bg-teal-700",    // Deep Winter Teal
  "bg-purple-800",  // Sugarplum
  "bg-slate-500",   // Silver Bells/Tinsel
  "bg-yellow-400"
]

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LotteryBoard({ gameData, picks }: LotteryBoardProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        persistSession: true,
      },
    }
  )

  const pickedNumbers = new Set(picks.map((p) => p.number))
const numbers = useMemo(() =>
  Array.from({ length: gameData.range }, (_, i) => ({
    value: i + 1,
    color: colors[Math.floor(Math.random() * colors.length)],
  })),
  [gameData.range]
)

  // --- Handle number selection ---
  const handleNumberClick = useCallback(
    (number: number) => {
      if (pickedNumbers.has(number)) return

      setSelectedNumbers((prev) =>
        prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
      )
    },
    [pickedNumbers]
  )

  // --- Submit picks ---
  const handleSubmitPicks = useCallback(async () => {
    if (selectedNumbers.length === 0) {
      toast.warning("Please select at least one number.")
      return
    }

    if (gameData.status !== "active") {
      toast.error(`Cannot pick: Game is ${gameData.status}.`)
      return
    }

    let token: string | null = null
    if (typeof window !== "undefined") {
      token = window.localStorage.getItem("supabase.access_token")
    }

    if (!token) {
      toast.error("You must be logged in to pick numbers.")
      console.error("User not authenticated: Access token not found.")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(`${API_URL}/api/lucky-grid/pick`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ numbers: selectedNumbers }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const message = errorData.error || response.statusText
        toast.error(message)
        console.error("[v0] Failed to submit picks:", message)
      } else {
        toast.success("Your picks were successfully submitted! 🎉")
        setSelectedNumbers([])
        router.refresh()
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected network error occurred."
      )
      console.error("[v0] Error submitting picks:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedNumbers, gameData.status, router])

  const isGameClosed = gameData.status !== "active" || isSubmitting
  const tokenCost = selectedNumbers.length

  return (
    <div className="w-full">
      <div className="mb-6 rounded-lg border-border bg-white/10 p-6 flex justify-between items-center backdrop-blur-sm">
        <div>
          <p className="text-sm text-white mb-2">
            Range: <span className="font-semibold text-white">1 - {gameData.range}</span>
          </p>
          <p className="text-sm text-white">
            Total Numbers:{" "}
            <span className="font-semibold text-white">{gameData.range}</span>
          </p>
        </div>

        <button
          onClick={handleSubmitPicks}
          disabled={isSubmitting || selectedNumbers.length === 0 || isGameClosed}
          className={`
            px-6 py-3 rounded-sm font-semibold text-white transition-colors duration-200
            ${
              isSubmitting || selectedNumbers.length === 0 || isGameClosed
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 cursor-pointer"
            }
          `}
        >
          {isSubmitting
            ? "Confirming..."
            : `Confirm (${tokenCost})`}
        </button>
      </div>

      <div className="mt-8 text-center mb-6 ">
        <div className="mb-3 h-2 w-full rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(picks.length / gameData.range) * 100}%` }}
          />
        </div>
        <p className="text-sm text-white">
          {picks.length} of {gameData.range} numbers claimed
        </p>
      </div>

<div className="grid gap-3 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
  {numbers.map(({ value, color }) => {
    const isSelected = selectedNumbers.includes(value)
    const isPicked = pickedNumbers.has(value)

    return (
      <NumberCard
        key={value}
        number={value}
        isSelected={isSelected}
        isPicked={isPicked}
        onClick={() => handleNumberClick(value)}
        disabled={isPicked || isGameClosed}
        colorClass={color}
      />
    )
  })}
</div>
    </div>
  )
}
