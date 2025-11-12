import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const leaderboardData = [
  { rank: 1, name: "Alex Chen", score: 10, badge: "🏆" },
  { rank: 2, name: "Jordan Smith", score: 9, badge: "🥈" },
  { rank: 3, name: "Casey Williams", score: 8, badge: "🥉" },
  { rank: 4, name: "Morgan Davis", score: 7, badge: "" },
  { rank: 5, name: "Taylor Johnson", score: 6, badge: "" },
  { rank: 6, name: "Riley Brown", score: 5, badge: "" },
  { rank: 7, name: "Sam Wilson", score: 4, badge: "" },
  { rank: 8, name: "Jamie Martinez", score: 3, badge: "" },
]

export default function Leaderboard() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Weekly Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Player</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Games Won</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player) => (
                  <tr key={player.rank} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{player.rank}</span>
                        {player.badge && <span className="text-xl">{player.badge}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">{player.name}</td>
                    <td className="py-4 px-4 text-right font-semibold text-grey-900">{player.score.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}