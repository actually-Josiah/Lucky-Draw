import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation" 

export default function PlayHeader() {
  const router = useRouter()
  const handlePlayNow = () => {
      router.push("/game") 
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance">Wo Sura A, Wo Nni Raffle</h1>
      <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
        Play our exciting game and compete with players worldwide. Test your skills and climb the leaderboard.
      </p>
      <div>
<Button 
  onClick={handlePlayNow} 
  className="
    bg-red-500 
    hover:bg-red-400 
    font-bold 
    text-white 
    mt-5 
    w-full 
    sm:w-1/4 
    py-7 
    sm:pt-8 
    sm:pb-8 
    text-2xl
    cursor-pointer
  "
>
  Play Now
</Button>
      </div>
    </section>
  )
}
