"use client";

import Confetti from "react-confetti";
import Countdown from "react-countdown";
import { useEffect, useState } from "react";

interface GameEndedModalProps {
  game: {
    winning_number: number | null;
    created_at: string;
  };
  winner?: { full_name: string } | null;
  onClose: () => void;
}

export default function GameEndedModal({ game, winner, onClose }: GameEndedModalProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-hidden">
      {/* Confetti fills entire screen */}
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={250}
        recycle={true} // infinite
        gravity={0.15} // slightly stronger downward pull
        wind={0.001} // straight down
        tweenDuration={6000}
        colors={[
          "#FFD700", // gold
          "#FFEC8B", // light gold
          "#FFFFFF", // white
          "#FF69B4", // hot pink
          "#00BFFF", // sky blue
          "#7CFC00", // lime green
          "#FF4500", // orange red
          "#9400D3", // deep violet
          "#FF1493", // deep pink
          "#00FA9A", // mint green
          "#282eddff", // dodger blue
          "#e20000ff",
        ]}
      />

      {/* Modal content */}
      <div className="bg-white/20 rounded-2xl p-10 relative w-11/12 max-w-lg text-center z-10 shadow-2xl">
        <h2 className="text-4xl font-bold mb-4. text-white">Game Ended!</h2>
        <p className="text-xl mb-3 text-white">Lucky Number:</p>

        {/* GOLDEN GLOW EFFECT */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-80 animate-pulse rounded-full"></div>
          <div className="relative text-7xl font-extrabold text-yellow-500 drop-shadow-[0_0_10px_gold] animate-[pulse_1.5s_infinite]">
            {game.winning_number}
          </div>
        </div>

        {winner && (
          <p className="text-lg mb-4">
            Winner: <span className="font-semibold text-red-600">{winner.full_name}</span>
          </p>
        )}

        <p className="text-sm mb-2 text-white">Next game starts in:</p>
        <Countdown date={new Date(game.created_at).getTime() + 24 * 60 * 60 * 1000} className="text-red-500"/>
      </div>
    </div>
  );
}
