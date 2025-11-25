'use client'

import { useRef } from 'react'

interface Card {
  icon: string
  title: string
  description: string
  metric?: string
  metricLabel?: string
}

interface HorizontalScrollCardsProps {
  cards: Card[]
  title?: string
}

export default function HorizontalScrollCards({ cards, title }: HorizontalScrollCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      const newPosition =
        scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="relative py-16">
      {title && (
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 px-6">{title}</h2>
      )}

      <div className="relative">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:-translate-y-1/2 hover:-translate-x-1 active:scale-95"
          aria-label="Scroll left"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:-translate-y-1/2 hover:translate-x-1 active:scale-95"
          aria-label="Scroll right"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Scrollable Cards Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 px-6 scrollbar-hide snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[280px] sm:w-[320px] bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20 active:translate-y-0 active:shadow-sm snap-start"
            >
              {/* Icon */}
              <div className="text-4xl mb-4">{card.icon}</div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-3">{card.title}</h3>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{card.description}</p>

              {/* Metric (if provided) */}
              {card.metric && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="text-2xl font-bold font-mono text-green-500">{card.metric}</div>
                  {card.metricLabel && (
                    <div className="text-xs text-gray-400 mt-1">{card.metricLabel}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Gradient Overlays for Visual Fade Effect */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent pointer-events-none" />
      </div>
    </section>
  )
}
