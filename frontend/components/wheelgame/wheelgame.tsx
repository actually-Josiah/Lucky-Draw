// components/wheelgame/wheelgame.tsx
"use client";

import { useState, useEffect } from "react"; // <--- FIXED: Added these imports
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WinModal from "../game/win-modal";

// Dynamic import for the wheel to prevent SSR issues
const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
);

interface Prize {
  id: string;
  name: string;
  probability: number;
}

interface WheelData {
  option: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TRY_AGAIN_TEXT = "TRY AGAIN";

export default function WheelGame() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [wheelData, setWheelData] = useState<WheelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<{ prizeName: string; isWinner: boolean } | null>(null);

  // New state for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winningPrize, setWinningPrize] = useState("");

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/wheel-game/prizes`);
        if (!response.ok) {
          throw new Error("Failed to fetch prizes.");
        }
        const data: Prize[] = await response.json();
        
        // Filter out the "No Prize" option for visual display if desired, 
        // or keep it. This logic depends on how you want the wheel to look.
        const visiblePrizes = data.filter(p => p.name !== 'No Prize');
        
        setWheelData([...visiblePrizes.map(p => ({ option: p.name })), { option: TRY_AGAIN_TEXT }]);

      } catch (error) {
        console.error(error);
        toast.error("Could not load the wheel. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrizes();
  }, []);

  const handleSpinClick = async () => {
    if (spinning || loading) return;

    const token = localStorage.getItem("supabase.access_token");
    if (!token) {
      toast.error("You must be logged in to spin the wheel.");
      return;
    }
    
    setSpinning(true);
    setLastResult(null);

    try {
      const response = await fetch(`${API_URL}/api/wheel-game/spin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to spin the wheel.");
      }

      const { prizeName, isWinner } = data.result;
      setLastResult({ prizeName, isWinner });

      let prizeIndex: number;

      if (isWinner) {
        prizeIndex = wheelData.findIndex(p => p.option === prizeName);
      } else {
        prizeIndex = wheelData.findIndex(p => p.option === TRY_AGAIN_TEXT);
      }
      
      // Safety fallback if prize name doesn't match wheel options
      if (prizeIndex === -1) {
        console.error("Prize not found on wheel, spinning to random spot.");
        prizeIndex = Math.floor(Math.random() * wheelData.length);
      }

      setPrizeNumber(prizeIndex);
      setMustSpin(true);
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
      setSpinning(false);
    }
  };

  const onStopSpinning = () => {
    setMustSpin(false);
    setSpinning(false);
    
    if (lastResult) {
      if (lastResult.isWinner) {
        setWinningPrize(lastResult.prizeName);
        setIsModalOpen(true);
      } else {
        toast.info("So close! Better luck next time.");
      }
    }
  };

  return (
    <>
      <WinModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        prizeName={winningPrize}
      />
      <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center w-full max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-xl aspect-square mb-12 group/wheel">
          {/* Outer Ring Decoration */}
          <div className="absolute inset-0 border-[12px] border-slate-900/5 rounded-full z-0 group-hover/wheel:border-slate-900/10 transition-colors duration-500"></div>
          <div className="absolute -inset-4 border border-slate-200 rounded-full z-0 opacity-50"></div>
          
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-red-500" />
              <p className="text-slate-500 font-medium">Loading Wheel...</p>
            </div>
          ) : (
            <>
              {wheelData.length > 0 && (
                <div className="relative z-10 scale-95 sm:scale-100">
                  <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={wheelData}
                    outerBorderColor="#0f172a" // slate-900
                    outerBorderWidth={8}
                    innerBorderColor="#ffffff"
                    innerRadius={15}
                    radiusLineColor="#ffffff"
                    radiusLineWidth={2}
                    textColors={["#ffffff"]}
                    textDistance={65}
                    fontSize={16}
                    fontWeight={700}
                    backgroundColors={[
                      "#e11d48", // red-600
                      "#1e293b", // slate-800
                      "#f59e0b", // amber-500
                      "#be123c", // rose-700
                      "#334155", // slate-700
                      "#d97706", // amber-600
                    ]}
                    onStopSpinning={onStopSpinning}
                  />
                </div>
              )}
              
              {/* Central Spin Button */}
              <button
                onClick={handleSpinClick}
                disabled={spinning || loading}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] bg-white text-slate-900 font-black rounded-full w-14 h-14 sm:w-20 sm:h-20 shadow-[0_0_30px_rgba(0,0,0,0.15)] active:scale-90 transition-all z-20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center border-4 border-slate-900 group/btn"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-6 bg-slate-900 clip-triangle"></div>
                {spinning ? (
                   <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                ) : (
                  <span className="text-xs sm:text-sm tracking-tighter group-hover/btn:scale-110 transition-transform">SPIN</span>
                )}
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handleSpinClick}
            disabled={spinning || loading}
            size="lg"
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-12 py-7 h-auto text-xl rounded-2xl shadow-xl shadow-red-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {spinning ? "Spinning..." : "SPIN NOW"}
          </Button>
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest">1 Token per spin</p>
        </div>
      </div>
    </>
  );
}