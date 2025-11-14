// app/luckygrid/page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"

// Components
import LotteryBoard from "@/components/luckygrid/lottery-board"
import GameInfo from "@/components/luckygrid/game-info"
import GameEndedModal from "@/components/luckygrid/GameEndedModal" // <-- Make sure this exists
import GameClosedModal from "@/components/luckygrid/GameClosedModal"

// Interfaces
interface GameData {
  id: string
  range: number
  status: 'active' | 'closed' | 'revealed' | 'completed';
  winning_number: number | null;
  created_at: string
}

interface Pick {
  id: string
  game_id: string
  number: number
  user_id: string
  picked_at: string
}

// NOTE: API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LuckyGridPage() {
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [lastRevealedGame, setLastRevealedGame] = useState<GameData | null>(null)
  const [winner, setWinner] = useState<{ full_name: string } | null>(null)
  const [showModal, setShowModal] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // --- 1. Fetch Active Game ---
const fetchGameData = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    // 1. First check: is there a CLOSED game?
    const closedRes = await fetch(`${API_URL}/api/lucky-grid/closed`);
    const closedData = await closedRes.json();

    if (closedData.game) {
      // CLOSED GAME FOUND
      setGameData(closedData.game);
      setPicks([]); 
      setLastRevealedGame(null);
      setWinner(null);
      setShowModal(true); // <-- SHOW closed modal
      return;
    }

    // 2. No closed game → check active or revealed
    const res = await fetch(`${API_URL}/api/lucky-grid/active`);
    const data = await res.json();

    if (data.game) {
      // ACTIVE or REVEALED
      setGameData(data.game);
      setPicks(data.picks);

      if (data.game.status === "revealed") {
        setLastRevealedGame(data.game);
        setWinner(data.winner);
        setShowModal(true);
      } else {
        setShowModal(false);
      }

      return;
    }

    // 3. No closed + no active → show last revealed
    const lastRes = await fetch(`${API_URL}/api/lucky-grid/last-revealed`);
    const lastData = await lastRes.json();

    if (lastData.game) {
      setGameData(lastData.game);
      setPicks([]);
      setLastRevealedGame(lastData.game);
      setWinner(lastData.winner);
      setShowModal(true);
      return;
    }

    setError("No active game available.");

  } catch (err) {
    setError(err instanceof Error ? err.message : "Unexpected error");
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    fetchGameData()
  }, [fetchGameData])

  // --- 2. Realtime Picks ---
  useEffect(() => {
    if (!gameData) return

    const handlePickInsert = (payload: RealtimePostgresChangesPayload<Pick>) => {
      if (payload.eventType === "INSERT" && payload.new.game_id === gameData.id) {
        setPicks(prev => [...prev, payload.new])
      }
    }

    const channel = supabase
      .channel(`lucky-game-${gameData.id}`)
      .on<Pick>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lucky_picks",
          filter: `game_id=eq.${gameData.id}`,
        },
        handlePickInsert
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameData, supabase])

  // --- 3. Auto-close modal if new game starts ---
  useEffect(() => {
    if (gameData?.status === "active" && showModal) {
      setShowModal(false)
    }
  }, [gameData, showModal])

  // --- Loading/Error ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-red-500">
          <h2 className="text-xl font-bold mb-2">Error Loading Game</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!gameData || picks === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <h2 className="text-xl font-bold mb-2">No Active Game</h2>
          <p>Please wait for an administrator to start a new game.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[url('/gridbg.png')] bg-cover bg-center bg-no-repeat pt-8 pb-16 relative">
      {/* Lottery Board & Game Info */}
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">TWA NA DI</h1>
          <LotteryBoard gameData={gameData} picks={picks} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-6 lg:invisible">Game Info</h2>
          <GameInfo gameData={gameData} picks={picks} />
        </div>
      </div>

      {/* Modal for last revealed game */}
      {showModal && lastRevealedGame && (
        <GameEndedModal
          game={lastRevealedGame}
          winner={winner}
          onClose={() => setShowModal(false)}
        />
      )}
      {showModal && gameData?.status === "closed" && (
  <GameClosedModal onClose={() => setShowModal(false)} />
)}

    </div>
  )
}
