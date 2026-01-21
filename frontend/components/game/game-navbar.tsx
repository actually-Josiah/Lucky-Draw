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
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo - links back to home */}
        <Link href="/home" className="flex items-center gap-2 group">
          <div className="w-10 h-10 relative group-hover:scale-110 transition-transform">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <span className="font-bold text-xl text-white hidden sm:inline group-hover:text-gray-200 transition-colors">
            Lucky Draw
          </span>
        </Link>

        {/* Game Tokens Display */}
        <div className="flex items-center bg-gray-800/50 px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/20">
          <Zap className="h-5 w-5 mr-2 text-red-700 fill-red-700" />
          {user.gameTokens} Token(s)
        </div>
      </div>
    </header>
  );
}
