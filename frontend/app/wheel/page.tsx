// app/wheel/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import WheelGame from "@/components/wheelgame/wheelgame";
import GameNavbar from "@/components/game/game-navbar";
import RecentWinners from "@/components/game/recent-winners";
import { UserProfile } from "@/app/home/page";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function WheelPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize Supabase Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- 1. Fetch Initial Data ---
  const fetchInitialData = useCallback(async () => {
    const token = localStorage.getItem("supabase.access_token");
    if (!token) {
      router.push("/");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
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
      console.error("Dashboard Fetch Error:", err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);


  // --- 2. Real-time Subscription (The Fix) ---
  useEffect(() => {
    if (!user?.id) return;

    // Defines what the raw DB row looks like
    type ProfileDBRow = {
      id: string;
      available_game_sessions: number; // This matches your SQL column name
      [key: string]: any;
    };

    const handleProfileUpdate = (payload: RealtimePostgresChangesPayload<ProfileDBRow>) => {
      console.log("Realtime update received:", payload);
      
      const newRecord = payload.new as ProfileDBRow;

      setUser((currentUser) => {
        if (!currentUser) return null;
        
        // Only update if it's the correct user
        if (newRecord.id === currentUser.id) {
          return { 
            ...currentUser, 
            // CRITICAL: Map database column "available_game_sessions" to frontend "gameTokens"
            gameTokens: newRecord.available_game_sessions ?? currentUser.gameTokens 
          };
        }
        return currentUser;
      });
    };

    // Subscribe to the 'profiles' table
    const channel = supabase
      .channel(`profiles-user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        handleProfileUpdate
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Live connection established for user ${user.id}`);
        }
      });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase]);


  // --- 3. Loading State ---
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[url('/bg-wheel.png')] bg-cover bg-center flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans selection:bg-red-500 selection:text-white pb-24 overflow-hidden">
      {/* 1. Background Image Layer */}
      <div 
        className="absolute inset-0 bg-[url('/twirwheelno.png')] bg-cover bg-center bg-no-repeat z-0"
      />
      {/* 2. Dark Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-0" />

      <GameNavbar user={user} />

      <main className="relative z-10 pt-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-red-500 font-bold tracking-wider uppercase text-sm mb-3">Spin to Win</h2>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 underline decoration-red-500/30 underline-offset-8">
              Twir Wheel No
            </h1>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-12 items-start mt-8">
            <div className="w-full lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/20 relative overflow-hidden group">
                 {/* Subtle decorative background - lightened for glass */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-5 -mr-20 -mt-20 group-hover:opacity-10 transition-opacity duration-700"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-5 -ml-20 -mb-20 group-hover:opacity-10 transition-opacity duration-700"></div>
                 
                 <div className="relative z-10">
                   <WheelGame />
                 </div>
              </div>
            </div>
            
            <aside className="w-full lg:sticky lg:top-24">
              <RecentWinners />
              
              <div className="mt-8 p-6 bg-white/10 backdrop-blur-2xl rounded-3xl text-white border border-white/20 relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-bold text-lg mb-2">How it works</h4>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    Each spin costs 1 token. You can win cash prizes, food vouchers, or sponsor gifts. Wins are added to your profile instantly.
                  </p>
                  <Button 
                    onClick={() => router.push("/game")}
                    variant="link" 
                    className="p-0 text-red-500 h-auto hover:text-red-400 font-bold flex items-center gap-2"
                  >
                    Go Back <span className="text-lg">←</span>
                  </Button>
                </div>
                {/* Decorative circle */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full"></div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}