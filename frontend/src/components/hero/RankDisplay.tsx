'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { hexToRgba } from '@/lib/team-colors'

interface RankDisplayProps {
  rank: number
  conference: 'East' | 'West'
  teamColor: string
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

/**
 * RankDisplay - Giant conference rank number with team-colored glow
 * Features ordinal suffix and conference label
 */
export function RankDisplay({ rank, conference, teamColor }: RankDisplayProps) {
  const shouldReduceMotion = useReducedMotion()
  const ordinal = getOrdinalSuffix(rank)

  // Generate text shadow glow effect
  const glowShadow = `
    0 0 40px ${hexToRgba(teamColor, 0.4)},
    0 0 80px ${hexToRgba(teamColor, 0.2)},
    0 0 120px ${hexToRgba(teamColor, 0.1)}
  `

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 0.8,
        delay: shouldReduceMotion ? 0 : 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Conference Label */}
      <motion.span
        className="text-xs sm:text-sm uppercase tracking-[0.3em] text-zinc-400 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.1 : 0.4,
          delay: shouldReduceMotion ? 0 : 0.7,
        }}
      >
        {conference}ern Conference
      </motion.span>

      {/* Giant Rank Number */}
      <div className="relative">
        <span
          className="text-[5rem] sm:text-[6rem] md:text-[7rem] lg:text-[8rem] font-black text-white leading-none"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            textShadow: glowShadow,
          }}
        >
          {rank}
        </span>

        {/* Ordinal Suffix */}
        <span
          className="absolute -top-1 -right-4 sm:-right-5 md:-right-6 lg:-right-8 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white/80"
          style={{ textShadow: glowShadow }}
        >
          {ordinal}
        </span>
      </div>
    </motion.div>
  )
}
