'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { usePageTransition } from '@/components/transitions'
import { sectionColors, cardVariants } from './data'
import type { CardData } from './types'

// ============================================================================
// NavigationCard Component
// ============================================================================

export function NavigationCard({ card }: { card: CardData }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { startTransition } = usePageTransition()
  const colors = sectionColors[card.section]

  const handleClick = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      startTransition(rect, card.href, 'rgb(24, 24, 27)')
    }
  }

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onClick={handleClick}
      className={`
        group relative p-6 min-h-[160px]
        bg-zinc-900/50 border border-zinc-800 rounded-xl
        cursor-pointer transition-all duration-300
        hover:border-white hover:bg-zinc-900/70
        ${colors.hover}
      `}
    >
      {/* Badge flottant */}
      {card.badge && (
        <span className={`absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${card.badgeColor} text-white`}>
          {card.badge}
        </span>
      )}

      {/* Section Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${colors.badge}`}>
          {card.number} {card.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>

      {/* Separator */}
      <div className="w-full h-px bg-zinc-800 mb-3" />

      {/* Features */}
      <ul className="space-y-1.5">
        {card.features.map((feature, index) => (
          <li key={index} className="text-sm text-zinc-400 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Arrow */}
      <span className="absolute bottom-6 right-6 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-200">
        →
      </span>
    </motion.div>
  )
}
