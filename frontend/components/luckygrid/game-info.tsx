"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

interface GameData {
  id: string
  range: number
  status: "active" | "revealed" | "completed"
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

interface Profile {
  id: string
  name: string | null
}

interface GameInfoProps {
  gameData: GameData
  picks: Pick[]
}

export default function GameInfo({ gameData, picks }: GameInfoProps) {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadProfiles() {
      const userIds = [...new Set(picks.map((p) => p.user_id))]
      if (userIds.length === 0) return

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds)

      if (error) console.error("Error loading profiles:", error)
      else {
        const profileMap: Record<string, Profile> = {}
        data.forEach((p) => (profileMap[p.id] = p))
        setProfiles(profileMap)
      }

      // Get the current user
      const { data: user } = await supabase.auth.getUser()
      if (user?.user) setCurrentUserId(user.user.id)
    }

    loadProfiles()
  }, [picks])

  const picksByUser = picks.reduce((acc, pick) => {
    if (!acc[pick.user_id]) acc[pick.user_id] = []
    acc[pick.user_id].push(pick.number)
    return acc
  }, {} as Record<string, number[]>)

  // Sort users: current user always first
  const sortedUsers = Object.keys(picksByUser).sort((a, b) => {
    if (a === currentUserId) return -1
    if (b === currentUserId) return 1
    return a.localeCompare(b)
  })

  const getInitials = (name: string | null) => {
    if (!name) return "??"
    const parts = name.trim().split(" ")
    const initials = parts
      .map((p) => p[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("")
    return initials
  }

  const completionPercentage = (picks.length / gameData.range) * 100

  return (
    <div className="space-y-6">
      {/* --- Game Stats --- */}
      <div className="rounded-lg border-border bg-white/10 backdrop-blur-sm p-6">
        <h2 className="text-lg font-bold text-white mb-4">Game Stats</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-white">Total Range</span>
            <span className="font-semibold text-white">{gameData.range}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-white">Status</span>
            <span
              className={`font-semibold text-white capitalize ${
                gameData.status === "revealed"
                  ? "text-green-500"
                  : gameData.status === "active"
                  ? "text-yellow-500"
                  : "text-blue-500"
              }`}
            >
              {gameData.status}
            </span>
          </div>
          {gameData.status === "revealed" && (
            <div className="flex justify-between">
              <span className="text-sm text-white">Winning Number</span>
              <span className="font-bold text-lg text-primary">
                {gameData.winning_number ?? "TBD"}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-white">Claimed</span>
            <span className="font-semibold text-white">{picks.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-white">Available</span>
            <span className="font-semibold text-white">
              {gameData.range - picks.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-white">Completion</span>
            <span className="font-semibold text-white">
              {Math.round(completionPercentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* --- Players --- */}
      <div className="rounded-lg bg-white/20 backdrop-blur-small p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Players</h2>
        {sortedUsers.length > 0 ? (
          <div className="space-y-3">
            {sortedUsers.map((userId) => {
              const profile = profiles[userId]
              const numbers = picksByUser[userId]
              const isCurrent = userId === currentUserId
              const label = isCurrent
                ? "YOU"
                : getInitials(profile?.name || "Player")

              return (
                <div
                  key={userId}
                  className={`flex justify-between items-start ${
                    isCurrent ? "bg-primary/10 rounded-lg p-2" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-white mt-1">
                      {numbers.length} number{numbers.length !== 1 ? "s" : ""} picked
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {numbers.sort((a, b) => a - b).join(", ")}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-white">No players yet</p>
        )}
      </div>
    </div>
  )
}
