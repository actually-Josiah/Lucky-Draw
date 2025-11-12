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
    <main className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Header />
      <h1 className="text-4xl font-bold text-foreground mb-12">Select your preferred game</h1>

      <div className="flex gap-8 px-4">
        {/* First Button with Image */}
        <div className="flex flex-col items-center gap-4">
          <Image
          onClick={gotowheel}
            src="/spin2.png"
            alt="First button image"
            width={400}
            height={400}
            className="rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer"
          />
          <Button className="w-full bg-red-500 hover:bg-red-400 text-white py-6 text-base font-semibold disabled:opacity-50 cursor-pointer">
            Spin & Win
          </Button>
        </div>

        {/* Second Button with Image */}
        <div className="flex flex-col items-center gap-4">
          <Image
          onClick={gotogrid}
            src="/lucky.png"
            alt="Second button image"
            width={400}
            height={400}
            className="rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer"
          />
          <Button
            variant="outline"
            className="w-full bg-red-500 hover:bg-red-400 text-white py-6 text-base font-semibold disabled:opacity-50 cursor-pointer"
          >
            Twa Na Di
          </Button>
        </div>
      </div>
    </main>
  )
}
