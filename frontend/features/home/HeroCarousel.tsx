'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CAROUSEL_IMAGES = [
  { id: 1, src: '/chemical1.png', alt: 'Chemical Products 1' },
  { id: 2, src: '/chemical2.png', alt: 'Chemical Products 2' },
  { id: 3, src: '/chemical3.png', alt: 'Chemical Products 3' },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  // Auto-play carousel every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      zIndex: 20,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrent((prev) => (prev + newDirection + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center hero-carousel">
      {/* Carousel container */}
      <div className="relative w-full h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] overflow-hidden flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'tween', duration: 0.4, ease: 'easeInOut' },
              opacity: { type: 'tween', duration: 0.4, ease: 'easeInOut' },
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
              <span className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded md:hidden z-30">
                Slide {current + 1}
              </span>

              {/* Mobile fallback image (standard <img>) to avoid Next/Image rendering issues on some phones */}
              <img
                src={CAROUSEL_IMAGES[current].src}
                alt={CAROUSEL_IMAGES[current].alt}
                className="block md:hidden object-cover w-full h-full"
              />

              {/* Desktop/medium+ uses Next/Image for optimization */}
              <Image
                src={CAROUSEL_IMAGES[current].src}
                alt={CAROUSEL_IMAGES[current].alt}
                fill
                className="hidden md:block md:object-contain w-full h-full"
                priority
              />
          </motion.div>
        </AnimatePresence>

        {/* Left arrow */}
        <button
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 backdrop-blur-md p-1.5 sm:p-2 hover:bg-white/40 transition-colors"
          onClick={() => paginate(-1)}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
        </button>

        {/* Right arrow */}
        <button
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 backdrop-blur-md p-1.5 sm:p-2 hover:bg-white/40 transition-colors"
          onClick={() => paginate(1)}
          aria-label="Next image"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 sm:gap-2">
          {CAROUSEL_IMAGES.map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                index === current ? 'bg-white sm:w-6' : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={() => {
                setDirection(index > current ? 1 : -1)
                setCurrent(index)
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
