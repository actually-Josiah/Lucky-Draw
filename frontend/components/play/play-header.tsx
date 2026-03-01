import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation" 
import { Zap, Trophy } from "lucide-react"

interface PlayHeaderProps {
  userName?: string;
}

export default function PlayHeader({ userName = "Player" }: PlayHeaderProps) {
  const router = useRouter()
  const handlePlayNow = () => {
      router.push("/game") 
  }

  return (
    <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 z-0 pointer-events-none"></div>

      <div className="relative z-10 flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium text-xs mb-4">
          <Trophy size={14} />
          <span>Daily Winners Announced</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-slate-600 text-lg max-w-xl">
          Ready to try your luck today? Play the Lucky Grid or spin the Wheel of Fortune to win amazing groceries and cash prizes.
        </p>
      </div>

      <div className="relative z-10 w-full md:w-auto shrink-0">
        <Button 
          onClick={handlePlayNow} 
          className="bg-red-500 hover:bg-red-400 font-bold text-white w-full md:w-auto px-8 py-6 text-lg shadow-lg shadow-red-500/20 transition-all hover:scale-105"
        >
          <Zap className="h-5 w-5 mr-2 fill-current" />
          Play To Win
        </Button>
      </div>
    </section>
  )
}
