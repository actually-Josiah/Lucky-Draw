"use client"
import CardGame from "@/components/card-game/card-game"
import Header from "@/components/header2"

export default function Home() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[url('/bg-wheel.png')] bg-cover bg-center bg-no-repeat ">
      <Header />
      <CardGame />
    </main>
  )
}
