import { Card } from "@/components/ui/card"

const PRIZES = [
  {
    name: "The Big One!",
    emoji: "🏆",
    probability: "0.03%",
    color: "from-yellow-600 to-amber-600",
  },
  {
    name: "$100 Coupon",
    emoji: "🎉",
    probability: "5%",
    color: "from-purple-600 to-pink-600",
  },
  {
    name: "Free Coffee",
    emoji: "☕",
    probability: "10%",
    color: "from-orange-600 to-red-600",
  },
  {
    name: "+1 Attempt",
    emoji: "♻️",
    probability: "5%",
    color: "from-blue-600 to-cyan-600",
  },
  {
    name: "No Prize",
    emoji: "😔",
    probability: "79.97%",
    color: "from-slate-600 to-slate-700",
  },
]

export default function PrizesDisplay() {
  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">Prize Odds</h3>
      <div className="space-y-3">
        {PRIZES.map((prize, idx) => (
          <Card key={idx} className={`bg-gradient-to-r ${prize.color} border-0 p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{prize.emoji}</span>
              <div>
                <p className="text-white font-semibold">{prize.name}</p>
              </div>
            </div>
            <p className="text-white font-bold">{prize.probability}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
