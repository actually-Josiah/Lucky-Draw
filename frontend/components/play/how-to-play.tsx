import { Card } from "@/components/ui/card"
import { Info } from "lucide-react"

const rules = [
  {
    title: "Purchase Game Tokens",
    description: "Click the 'Buy Tokens' button and select the amount of tokens to buy.",
    image: "/buy.png",
  },
  {
    title: "Try your luck, compete and win",
    description: "Click Play To Win and select your preferred game to play.",
    image: "/playing.png",
  },
  {
    title: "Earn Rewards",
    description:
      "Select your lucky number and compete with other players in realtime and stand a chance of winning.",
    image: "/winning.png",
  },
  {
    title: "Claim Prizes Weekly",
    description:
      "Claim you prize after the game ends. Prizes are distributed weekly to all winners.",
    image: "/going.png",
  },
]

export default function HowToPlay() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How to Play</h2>
        <p className="text-lg text-muted-foreground">
          Follow these simple steps to get started and become a champion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rules.map((rule, index) => (
          <Card key={index} className="p-6 space-y-4 rounded-2xl shadow-sm">
            {/* Number + Title Row with underline */}
            <div className="flex items-end gap-4 pb-2 border-b border-muted-foreground/20 w-fit">
              <span className="text-6xl md:text-7xl font-extrabold text-primary leading-none">
                {index + 1}
              </span>
              <h3 className="text-2xl font-semibold leading-tight">{rule.title}</h3>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mt-2">{rule.description}</p>

            {/* Image */}
            <img
              src={rule.image}
              alt={rule.title}
              className="w-full h-48 object-cover rounded-lg mt-4"
            />
          </Card>
        ))}
      </div>

      {/* AI Generated Disclaimer */}
      <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground opacity-75">
        <Info className="h-4 w-4" />
        <p className="text-sm hover:text-red-500">All images are AI generated</p>
      </div>
    </section>
  )
}