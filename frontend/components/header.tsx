"use client"

import { useState } from "react"
import Image from 'next/image';
import { Menu, X } from "lucide-react"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/40 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
        <div className="w-10 h-10 relative"> 
        <Image
         src="/logo.png"
         alt="FoodStuff Home Logo"
         fill
         style={{ objectFit: 'contain' }} 
        />
      </div>
          <span className="font-bold text-xl text-white">FoodStuff Home</span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`fixed top-16 right-0 h-screen w-64 bg-white/95 backdrop-blur-sm transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-3">
          <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium py-2">
            Home
          </a>
          <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium py-2">
            About
          </a>
          <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium py-2">
            Contact
          </a>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/20 md:hidden z-40" onClick={() => setIsOpen(false)} />}
    </header>
  )
}
