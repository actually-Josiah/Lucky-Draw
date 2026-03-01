"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, Zap, RotateCw, LayoutGrid, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import PlayNavbar from "@/components/play/play-navbar"
import UpdateProfileModal from "@/components/play/update-profile-modal"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    phone_number: string | null;
    gameTokens: number;
    totalWins: number;
}

export default function GamePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpdateProfile, setShowUpdateProfile] = useState(false)
  const router = useRouter()

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("supabase.access_token")
    if (!token) {
      router.push("/")
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("supabase.access_token");
          router.push("/");
        }
        throw new Error('Failed to load user data.');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error("Game Page Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [router])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const handleProfileUpdateSuccess = (updatedFields: {name: string, phone_number: string}) => {
    if (user) {
      setUser({
        ...user,
        name: updatedFields.name,
        phone_number: updatedFields.phone_number
      })
    }
    setShowUpdateProfile(false)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-500 selection:text-white pb-24">
      <PlayNavbar 
        user={user} 
        onOpenUpdateProfile={() => setShowUpdateProfile(true)} 
      />

      <main className="pt-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-red-500 font-bold tracking-wider uppercase text-sm mb-3">Game Zone</h2>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Choose Your Challenge</h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Use your tokens to play and win amazing prizes. Will you pick the Lucky Grid or Spin the Wheel? The choice is yours!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* LUCKY GRID CARD */}
            <div 
              onClick={() => router.push("/luckygrid")}
              className="group bg-white rounded-3xl p-4 shadow-sm border border-slate-200 hover:shadow-xl hover:border-red-500/20 transition-all duration-500 cursor-pointer overflow-hidden relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                 <Image
                    src="/play1.png"
                    alt="Lucky Grid"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <LayoutGrid size={14} />
                      Twa Na Di
                    </div>
                  </div>
              </div>

              <div className="px-4 pb-4">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center justify-between">
                  Lucky Grid
                  <ChevronRight className="text-slate-300 group-hover:text-red-500 transition-colors" />
                </h3>
                <p className="text-slate-600 mb-6 line-clamp-2">
                  Pick your lucky numbers on the grid. Daily draws with jumbo grocery packs up for grabs!
                </p>
                <Button className="w-full bg-slate-900 group-hover:bg-red-600 text-white rounded-xl py-6 h-auto font-bold transition-all">
                  Play Lucky Grid
                </Button>
              </div>
            </div>

            {/* WHEEL OF FORTUNE CARD */}
            <div 
              onClick={() => router.push("/wheel")}
              className="group bg-white rounded-3xl p-4 shadow-sm border border-slate-200 hover:shadow-xl hover:border-red-500/20 transition-all duration-500 cursor-pointer overflow-hidden relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                 <Image
                    src="/play2.png"
                    alt="Wheel of Fortune"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <RotateCw size={14} className="animate-spin-slow" />
                      Twir Wheel No
                    </div>
                  </div>
              </div>

              <div className="px-4 pb-4">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center justify-between">
                  Wheel of Fortune
                  <ChevronRight className="text-slate-300 group-hover:text-red-500 transition-colors" />
                </h3>
                <p className="text-slate-600 mb-6 line-clamp-2">
                  Spin to win instant cash prizes, Momo transfers, and partner vouchers. Luck is just a spin away!
                </p>
                <Button className="w-full bg-slate-900 group-hover:bg-red-600 text-white rounded-xl py-6 h-auto font-bold transition-all">
                  Spin the Wheel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <UpdateProfileModal 
        open={showUpdateProfile} 
        onOpenChange={setShowUpdateProfile} 
        currentUser={user}
        onSuccess={handleProfileUpdateSuccess} 
      />
    </div>
  )
}