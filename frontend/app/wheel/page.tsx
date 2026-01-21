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

  // --- 4. Render Game ---
  return (
<main
      className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      {/* 1. Blurred Background Image Layer */}
      <div 
        className="absolute inset-0 bg-[url('/twirwheelno.png')] bg-cover bg-center bg-no-repeat blur-[2px] z-0"
      />

      {/* 2. Dark Overlay (Keeps text readable) */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* 3. Content Layer (Navbar + Game) - z-10 keeps it sharp & on top */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <GameNavbar user={user} />

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-7xl mt-4">
          <div className="flex-grow">
            <WheelGame />
          </div>
          <div className="w-full lg:w-auto">
            <RecentWinners />
          </div>
        </div>
      </div>
    </main>
  );
}