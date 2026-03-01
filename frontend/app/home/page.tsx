// app/home/page.tsx

"use client"

import { useState, useEffect, useCallback } from "react" 
import { useRouter } from "next/navigation" 
import PlayNavbar from "@/components/play/play-navbar"
import BuyTriesCard from "@/components/play/buy-tries-card"
import PlayHeader from "@/components/play/play-header"
import Carousel from "@/components/play/carousel"
import Sponsors from "@/components/play/sponsors"
import HowToPlay from "@/components/play/how-to-play"
import UpdateProfileModal from "@/components/play/update-profile-modal"
import { Loader2 } from "lucide-react"


const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Define the User Profile interface
export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    phone_number: string | null;
    gameTokens: number;
    totalWins: number;
}

// NOTE: Renamed PlayPage to HomePage for clarity based on previous conversation
export default function HomePage() { 
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpdateProfile, setShowUpdateProfile] = useState(false)
  const router = useRouter()
  
  // --- CORE FUNCTION: Fetches user and dashboard data ---
  // ... (fetchUserData function remains the same) ...
  const fetchUserData = useCallback(async () => {
    // ... (logic to fetch data and setUser) ...
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

  console.log("📡 Fetching:", `${API_URL}/api/dashboard`);
  console.log("📦 Response status:", response.status);
  console.log("📦 Response type:", response.headers.get("content-type"));

  const text = await response.text(); // Read raw response
  console.log("🧾 Raw Response:", text);

  // Try parsing JSON only if it's valid JSON
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("❌ Failed to parse JSON. Possibly HTML error page.");
    throw new Error("Backend did not return JSON");
  }

  if (!response.ok) {
    if (response.status === 401) { 
      localStorage.removeItem("supabase.access_token");
      router.push("/");
    }
    throw new Error(data.error || 'Failed to load user data.');
  }

  setUser(data.user); 
  if (!data.user.name && !showUpdateProfile) {
    setShowUpdateProfile(true);
  }
} catch (err) {
  console.error("Dashboard Fetch Error:", err);
} finally {
  setLoading(false);
}

  }, [router, showUpdateProfile])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData]) 

  // --- Profile Update Handler ---
  // ... (handleProfileUpdateSuccess remains the same) ...
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

  // 💰 NEW HANDLER: Function to re-fetch user data after a successful token purchase.
  const handlePurchaseSuccess = () => {
      // Re-run the main fetch to update the token balance immediately from the database
      fetchUserData(); 
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-500 selection:text-white pb-24">
      {/* Navbar uses the fetched user data */}
      <PlayNavbar 
          user={user} 
          onOpenUpdateProfile={() => setShowUpdateProfile(true)} 
      />

      <main className="pt-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <PlayHeader userName={user.name || "Player"} />
          
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 mt-12 items-start">
            
            {/* Left Column (Main Content) - Order 1 on mobile, Order 1 on Desktop */}
            <div className="w-full lg:col-span-2 space-y-8 order-1">
                <Carousel />
            </div>
            
            {/* 🛒 RENDER BuyTriesCard: Place it in the sidebar (Right Column) - Order 2 on mobile, Order 2 on Desktop */}
            <aside className="w-full lg:sticky lg:top-24 order-2">
                <BuyTriesCard 
                    userId={user.id} 
                    userEmail={user.email} 
                    onPurchaseSuccess={handlePurchaseSuccess} 
                />
            </aside>

            {/* Bottom Content - Order 3 on mobile, Order 3 on Desktop (Spans full width or just left col) */}
            <div className="w-full lg:col-span-2 space-y-8 order-3">
                <HowToPlay />
                <Sponsors />
            </div>
          </div>
        </div>
      </main>

      {/* Modal remains the same */}
      <UpdateProfileModal 
          open={showUpdateProfile} 
          onOpenChange={setShowUpdateProfile} 
          currentUser={user}
          onSuccess={handleProfileUpdateSuccess} 
      />
    </div>
  )
}