'use client'

import { useEffect, useRef, useState } from 'react'

interface TickerItem {
  id: string
  icon?: string
  text: string
  highlight?: boolean
}

interface LiveTickerProps {
  items: TickerItem[]
  speed?: number // pixels per second
  pauseOnHover?: boolean
}

export default function LiveTicker({
  items,
  speed = 30,
  pauseOnHover = true
}: LiveTickerProps) {
  const [isPaused, setIsPaused] = useState(false)
  const tickerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const ticker = tickerRef.current
    if (!ticker) return

    let position = 0
    let lastTime = Date.now()

    const animate = () => {
      if (!isPaused) {
        const currentTime = Date.now()
        const delta = (currentTime - lastTime) / 1000
        lastTime = currentTime

        position += speed * delta

        // Reset position when first set of items scrolls out
        const tickerWidth = ticker.scrollWidth / 2
        if (position >= tickerWidth) {
          position = 0
        }

        ticker.style.transform = `translateX(-${position}px)`
      } else {
        lastTime = Date.now()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused, speed])

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items]

  return (
    <div className="relative overflow-hidden bg-white/5 py-4">
      {/* Live indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded-full">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider">Live</span>
      </div>

      {/* Ticker content */}
      <div
        ref={tickerRef}
        className="flex gap-8 whitespace-nowrap"
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        style={{ willChange: 'transform' }}
      >
        {/* Add spacing for the LIVE indicator */}
        <div className="w-20 flex-shrink-0" />

        {duplicatedItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={`flex items-center gap-2 px-4 py-1 rounded-lg transition-colors ${
              item.highlight ? 'bg-green-500/20 text-green-400' : 'text-gray-300'
            }`}
          >
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <span className="text-sm font-medium">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black/80 via-black/40 to-transparent pointer-events-none" />
    </div>
  )
}
