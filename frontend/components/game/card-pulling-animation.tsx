export default function CardPullingAnimation({ result }: { result: any }) {
  const isWinner = result?.isWinner

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className={`mb-6 animate-bounce transition-transform ${isWinner ? "text-6xl" : "text-5xl"}`}>
        {isWinner ? "🎉" : "🎲"}
      </div>
      <div className="text-center">
        <p className="text-slate-400 mb-4">Revealing card...</p>
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  )
}
