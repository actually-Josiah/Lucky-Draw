import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function Sponsors() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-6">Our Partners</h2>
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="relative h-20 w-40 hover:scale-110 transition-transform duration-300">
              <Image
                src="/yango.png"
                alt="Yango"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-24 w-48 hover:scale-110 transition-transform duration-300">
              <Image
                src="/Caritas.png"
                alt="Caritas"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
