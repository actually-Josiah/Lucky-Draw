// components/wheelgame/wheelgame.tsx
"use client";

import { useState, useEffect } from "react"; // <--- FIXED: Added these imports
import dynamic from "next/dynamic";
import { toast } from "sonner"; // <--- NOTE: change to 'react-hot-toast' if you use that instead
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
      <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-cover bg-center bg-no-repeat">
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 tracking-wide drop-shadow-lg">
          Lucky Fortune
        </h1>

        <div className="relative flex items-center justify-center w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl aspect-square">
          {loading ? (
            <div className="text-white text-xl">Loading Wheel...</div>
          ) : (
            <>
              {wheelData.length > 0 && (
                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={wheelData}
                  outerBorderColor="#fff"
                  outerBorderWidth={5}
                  innerBorderColor="transparent"
                  radiusLineColor="#fff"
                  radiusLineWidth={1}
                  textColors={["#fff"]}
                  textDistance={60}
                  fontSize={18}
                  fontWeight={500}
                  backgroundColors={[
                    "#165FA9", "#239b63", "#F7A415", "#3F297E",
                    "#BE1080", "#DC0836", "#8A2BE2", "#FF4500"
                  ]}
                  onStopSpinning={onStopSpinning}
                />
              )}
              <button
                onClick={handleSpinClick}
                disabled={spinning || loading}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] bg-white text-gray-800 font-semibold rounded-full w-10 h-10 sm:w-12 sm:h-12 shadow-lg active:scale-95 transition z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {spinning ? "..." : "SPIN"}
              </button>
            </>
          )}
        </div>

        <button
          onClick={handleSpinClick}
          disabled={spinning || loading}
          className="mt-8 px-6 py-2 sm:px-8 sm:py-3 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition-transform hover:-translate-y-1 text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {spinning ? "Spinning..." : "SPIN AGAIN"}
        </button>
      </div>
    </>
  );
}