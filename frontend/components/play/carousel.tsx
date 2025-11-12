"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const images = [
  // Updated with different placeholder paths
  { id: 1, title: "Game Challenge 1", image: "/caro1.png" },
  { id: 2, title: "Game Challenge 2", image: "/caro4.png" },
  { id: 3, title: "Game Challenge 3", image: "/caro2.png" },
  { id: 4, title: "Game Challenge 4", image: "/caro3.png" },
  { id: 5, title: "Game Challenge 5", image: "/caro4.png" },
]

export default function Carousel() {
  const [current, setCurrent] = useState(0)

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const next = () => setCurrent((prev) => (prev + 1) % images.length)
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length)

  return (
    <section className="max-w-7xl mx-auto py-12">
      <div className="relative w-full h-96 md:h-[500px] rounded-xl overflow-hidden bg-muted">
        {/* Carousel Images */}
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                // Corrected src to use the valid path from the images array
                src={image.image} 
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-end p-6">
                <h3 className="text-white text-2xl font-bold">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <Button
          onClick={prev}
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white z-10"
        >
          <ChevronLeft className="size-6" />
        </Button>
        <Button
          onClick={next}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white z-10"
        >
          <ChevronRight className="size-6" />
        </Button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === current ? "bg-white w-8" : "bg-white/50"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}