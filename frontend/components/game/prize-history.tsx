import { Card } from "@/components/ui/card"

export default function PrizeHistory({ history }: { history: any[] }) {
  if (history.length === 0) return null

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Prize History</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {history.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg flex items-center justify-between ${
              item.isWinner ? "bg-green-900/30 border border-green-700" : "bg-slate-700/50 border border-slate-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-400">#{idx + 1}</span>
              <div>
                <p className={`font-semibold ${item.isWinner ? "text-green-400" : "text-slate-300"}`}>
                  {item.prizeName}
                </p>
                <p className="text-xs text-slate-500">{item.outcome}</p>
              </div>
            </div>
            {item.isWinner && <span className="text-green-400 font-bold">WIN</span>}
          </div>
        ))}
      </div>
    </Card>
  )
}
