'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface StatsBarProps {
  wins: number
  losses: number
  streak: string
  netRating: number
}

/**
 * StatsBar - Horizontal stats display with record, streak, and net rating
 * Uses JetBrains Mono for numbers, color-coded values
 */
export function StatsBar({ wins, losses, streak, netRating }: StatsBarProps) {
  const shouldReduceMotion = useReducedMotion()

  // Parse streak for color (W = green, L = red)
  const streakIsWin = streak.startsWith('W')
  const streakColor = streakIsWin ? 'text-emerald-400' : 'text-red-400'

  // Net rating color
  const netRatingColor = netRating >= 0 ? 'text-emerald-400' : 'text-red-400'
  const netRatingSign = netRating >= 0 ? '+' : ''

  const statItems = [
    {
      label: 'Record',
      value: `${wins}-${losses}`,
      color: 'text-white',
    },
    {
      label: 'Streak',
      value: streak,
      color: streakColor,
    },
    {
      label: 'Net RTG',
      value: `${netRatingSign}${netRating.toFixed(1)}`,
      color: netRatingColor,
    },
  ]

  return (
    <motion.div
      className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.1 : 0.6,
        delay: shouldReduceMotion ? 0 : 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {statItems.map((stat, index) => (
        <div key={stat.label} className="flex items-center gap-4 sm:gap-6 md:gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 mb-1">
              {stat.label}
            </span>
            <span
              className={`text-lg sm:text-xl md:text-2xl font-bold font-mono ${stat.color}`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {stat.value}
            </span>
          </div>

          {/* Divider (not after last item) */}
          {index < statItems.length - 1 && (
            <span className="text-zinc-600 text-xl hidden sm:block">|</span>
          )}
        </div>
      ))}
    </motion.div>
  )
}
