// components/game/game-navbar.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Zap } from 'lucide-react';
import { UserProfile } from '@/app/home/page'; // Assuming this is the correct path

interface GameNavbarProps {
  user: UserProfile;
}

export default function GameNavbar({ user }: GameNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-2xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo - links back to home */}
        <Link href="/home" className="flex items-center gap-2 group">
          <div className="w-10 h-10 relative group-hover:scale-110 transition-transform">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
             <span className="font-black text-xl text-white leading-none group-hover:text-red-500 transition-colors">
               Lucky Draw
             </span>
             <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest hidden sm:block">
               Wo Sura A Wo Nni
             </span>
          </div>
        </Link>

        {/* Game Tokens & Profile Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg shadow-slate-900/20 border border-slate-800">
            <Zap className="h-3.5 w-3.5 mr-2 text-amber-400 fill-amber-400" />
            <span className="tracking-tight">{user.gameTokens} <span className="text-slate-400 hidden sm:inline">TRIES</span></span>
          </div>
          
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold border-2 border-white shadow-sm ring-1 ring-red-100">
             {user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
          </div>
        </div>
      </div>
    </header>
  );
}
