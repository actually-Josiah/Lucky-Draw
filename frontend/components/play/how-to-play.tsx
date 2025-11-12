import { Card } from "@/components/ui/card"

const rules = [
  {
    title: "Purchase Game Tokens",
    description: "Click the 'Buy Tokens' button and select the amount of tokens to buy.",
    image: "/htp1.png",
  },
  {
    title: "Try your luck, compete and win",
    description: "Click Play Now and select your preferred game to play.",
    image: "/htp2.png",
  },
  {
    title: "Earn Rewards",
    description:
      "Compete against other players and earn points. The more you win, the higher you climb the leaderboard.",
    image: "/htp3.png",
  },
  {
    title: "Claim Prizes Weekly",
    description:
      "Unlock achievements and special rewards as you progress. Reach milestones to unlock exclusive content.",
    image: "/htp4.png",
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
    </section>
  )
}
