'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

interface CarouselProps {
  items: Array<{
    id: string
    title: string
    subtitle: string
    image: string
    cta: string
    ctaLink: string
  }>
  autoplay?: boolean
  interval?: number
}

export function Carousel({ items, autoplay = true, interval = 5000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!autoplay) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      )
    }, interval)

    return () => clearInterval(timer)
  }, [autoplay, interval, items.length])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? items.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === items.length - 1 ? 0 : currentIndex + 1)
  }

  if (items.length === 0) return null

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden rounded-2xl">
      {/* Carousel Items */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="w-full h-full flex-shrink-0 relative"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${item.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-center text-white">
              <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                  {item.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-delay">
                  {item.subtitle}
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 animate-fade-in-delay-2"
                  asChild
                >
                  <a href={item.ctaLink}>{item.cta}</a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-white scale-110' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </div>
  )
}