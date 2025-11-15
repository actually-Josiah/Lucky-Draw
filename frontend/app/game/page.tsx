"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "@/components/header"

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    phone_number: string | null;
    gameTokens: number;
    totalWins: number;
}

export default function Game() {

  const router = useRouter()

  const gotogrid = () => {
      router.push("/luckygrid") 
  }

    const gotowheel = () => {
      router.push("/wheel") 
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4 pt-20 sm:p-8 sm:pt-28"> 
      <Header />
      <h1 className="text-2xl font-bold text-foreground mb-8 text-center sm:mb-12">
        Play & Win THis Amazing Prize This week
      </h1>

      {/* 🚀 FIX: Increased max-w-xl to max-w-3xl on larger screens for bigger images */}
      <div className="flex flex-col sm:flex-row gap-8 w-full max-w-xl sm:max-w-3xl"> 

                {/* Second Button with Image */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* ✅ FIX: Aspect ratio wrapper to enforce square height */}
          <div className="relative w-full aspect-square">
            <Image
              onClick={gotogrid}
              src="/play1.jpeg"
              alt="Twa Na Di Game"
              fill // Use fill to size the image based on the parent container
              className="rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer object-cover"
            />
          </div>
          <Button
            onClick={gotogrid}
            variant="outline"
            className="w-full bg-red-500 hover:bg-red-400 text-white py-6 text-base font-semibold disabled:opacity-50 cursor-pointer">
            Twa Na Di
          </Button>
        </div>
        
        {/* First Button with Image */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* ✅ FIX: Aspect ratio wrapper to enforce square height */}
          <div className="relative w-full aspect-square">
            <Image
              // onClick={gotowheel}
              src="/win.jpeg"
              alt="Spin & Win Game"
              fill // Use fill to size the image based on the parent container
              className="rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer object-cover" 
            />
          </div>
          {/* <Button className="w-full bg-red-500 hover:bg-red-400 text-white py-6 text-base font-semibold disabled:opacity-50 cursor-pointer" onClick={gotowheel}>
            Spin & Win
          </Button> */}
        </div>

      </div>
    </main>
  )
}