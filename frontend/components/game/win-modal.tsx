// components/game/win-modal.tsx
"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizeName: string;
}

export default function WinModal({ isOpen, onClose, prizeName }: WinModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-0 p-0 overflow-visible bg-transparent shadow-none">
        
        <DialogTitle className="sr-only">
          Congratulations! You won {prizeName}
        </DialogTitle>
        <div className="relative bg-gradient-to-b from-red-900/60 via-black/60 to-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
          
          {/* Top Reflection/Sheen (Glass highlight) */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />

          {/* Background Glow Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[200px] bg-red-600/20 blur-[80px] pointer-events-none mix-blend-screen" />
          
          {/* Rotating Sunburst (Subtle) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
             <div className="w-[500px] h-[500px] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.3)_30deg,transparent_60deg)] animate-[spin_8s_linear_infinite]" />
          </div>

          <div className="relative z-10 p-8 flex flex-col items-center text-center">
            
            {/* Animated Icon */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mb-6 relative"
            >
              <div className="absolute inset-0 bg-red-500 blur-2xl opacity-40" />
              {/* Icon Container: Glassy look */}
              <div className="relative bg-gradient-to-br from-red-500/80 to-red-800/80 p-4 rounded-full shadow-lg border border-white/20 backdrop-blur-md">
                <Trophy className="w-12 h-12 text-white drop-shadow-md" />
              </div>
              
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-white fill-white/50" />
              </motion.div>
            </motion.div>

            {/* Header Text */}
            <h2 className="text-3xl font-black uppercase italic tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mb-2">
              Jackpot!
            </h2>
            
            <p className="text-gray-300/80 text-sm mb-6 font-medium">
              Luck is on your side today
            </p>

            {/* The Prize Box - Inner Glass Layer */}
            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 mb-6 backdrop-blur-md relative overflow-hidden group shadow-inner">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              
              <p className="text-sm text-red-300/90 uppercase tracking-widest text-[10px] mb-1 font-bold">
                You Won
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white leading-tight break-words drop-shadow-md">
                {prizeName}
              </p>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={onClose} 
              className="w-full bg-white/90 hover:bg-white text-red-600 font-bold py-6 text-lg tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] backdrop-blur-sm"
            >
              CLAIM PRIZE
            </Button>
            
            <p className="text-[10px] text-gray-400 mt-4 max-w-[250px]">
              Check your dashboard for redemption instructions.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}