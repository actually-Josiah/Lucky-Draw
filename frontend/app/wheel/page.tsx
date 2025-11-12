import WheelGame from "@/components/wheelgame/wheelgame";
import Header from "@/components/header2"

export default function HomePage() {
  return (
    <main
      className="relative min-h-screen bg-[url('/bg-wheel.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center"
    >
      <Header />
      {/* Optional overlay for contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Actual content */}
      <div className="relative z-10">
        <WheelGame />
      </div>
    </main>
  );
}
