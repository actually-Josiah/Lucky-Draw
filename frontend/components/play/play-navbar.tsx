// components/play/play-navbar.tsx

"use client"

import { useState } from "react"
import Image from 'next/image';
import { useRouter } from "next/navigation" // Needed for Logout
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Settings, User, Menu, X, LogOut, Zap } from "lucide-react" // Added Zap for tokens
import { UserProfile } from "@/app/home/page" // Import the interface

interface PlayNavbarProps {
  user: UserProfile; // RECEIVE the real user data
  onOpenUpdateProfile: () => void;
  // Note: We need a prop to handle the "Play Now" button action, 
  // but for now we'll just keep it functional
}

export default function PlayNavbar({ user, onOpenUpdateProfile }: PlayNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  // --- Data Calculations ---
  // Use the name from the user object, fallback to email if name is null
  const displayName = user.name || user.email.split('@')[0]; 
  const avatarInitials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : displayName[0].toUpperCase()

  const navLinks = ["Home", "Leaderboard", "How to Play"] // More relevant links

  // --- Handlers ---
  const handleLogout = () => {
      localStorage.removeItem("supabase.access_token");
      router.push("/"); // Redirect to login page
  }
  
  // Use a placeholder for the game start action for now
  const handlePlayNow = () => {
      router.push("/game") 
  }
  // ---------------

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
<div className="w-10 h-10 relative"> 
    <Image
      src="/logo.png"
      alt="Your Company Logo"
      fill
      style={{ objectFit: 'contain' }} 
    />
  </div>
          <span className="font-bold text-xl text-slate-900 hidden sm:inline">FoodStuff Home</span>
        </div>

        {/* Desktop Navigation (Center) */}
        {/* <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(' ', '-')}`}
              className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
            >
              {link}
            </a>
          ))}
        </nav> */}

        {/* Right Section - Desktop */}
        <div className="hidden md:flex items-center gap-4">
            
          {/* Game Tokens Display */}
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full text-sm font-semibold text-slate-700">
              <Zap className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
              {user.gameTokens} Token(s)
          </div>

          <Button onClick={handlePlayNow} className="bg-red-500 hover:bg-red-400 font-semibold cursor-pointer">
              Play To Win
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
<button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <Avatar className="size-10">
                {/* FIX: Using Dicebear API for a stable, dynamic initials image */}
                <AvatarImage 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${displayName}&backgroundColor=d1d5db,10b981&backgroundType=solid`} 
                    alt={displayName}
                />
                <AvatarFallback>{avatarInitials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate max-w-[80px]">{displayName}</span>
            </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem className="flex flex-col items-start" disabled>
                <span className="font-bold text-slate-900">{displayName}</span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={onOpenUpdateProfile}>
                <User className="mr-2 size-4" />
                <span className="cursor-pointer">Update Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 size-4" />
                <span className="cursor-pointer">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50/50">
                <LogOut className="mr-2 size-4" />
                <span className="cursor-pointer">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {/* Tokens for mobile */}
          <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-700">
              <Zap className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
              {user.gameTokens}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border absolute w-full shadow-lg">
          <div className="px-4 py-4 space-y-4">
            
            {/* User Info (Mobile) */}
             <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="size-10">
                <AvatarImage 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${displayName}&backgroundColor=d1d5db,10b981&backgroundType=solid`} 
                    alt={displayName}
                />
                    <AvatarFallback>{avatarInitials}</AvatarFallback>
                </Avatar>
                <div>
                    <span className="font-bold text-slate-900 block">{displayName}</span>
                    <span className="text-sm text-slate-500">{user.email}</span>
                </div>
            </div>

            {/* Nav Links (Mobile) */}
            {/* {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-slate-700 hover:text-red-600 transition-colors py-2"
              >
                {link}
              </a>
            ))} */}
            
            {/* <DropdownMenuSeparator /> */}

            {/* Action Links (Mobile) */}
            <button
                onClick={() => { onOpenUpdateProfile(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-base hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-3"
            >
                <User size={20} className="text-slate-600" />
                Update Profile
            </button>
            <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-base hover:bg-red-50/50 rounded-lg transition-colors flex items-center gap-3 text-red-600"
            >
                <LogOut size={20} />
                Logout
            </button>

            <Button onClick={handlePlayNow} className="w-full mt-4 bg-red-500 hover:bg-red-400 font-semibold">
                <Zap className="h-5 w-5 mr-2" /> Play To Win
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}