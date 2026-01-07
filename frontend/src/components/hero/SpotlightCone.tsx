'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { hexToRgba } from '@/lib/team-colors'

interface SpotlightConeProps {
  teamColor: string
}

/**
 * SpotlightCone - Radial gradient creating soft cone of light around logo
 * Provides ambient team-colored glow from top
 */
export function SpotlightCone({ teamColor }: SpotlightConeProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="absolute top-0 left-0 w-full h-[70vh]"
        style={{
          background: `radial-gradient(ellipse 50% 80% at 50% 0%,
            ${hexToRgba(teamColor, 0.15)} 0%,
            ${hexToRgba(teamColor, 0.08)} 30%,
            ${hexToRgba(teamColor, 0.03)} 60%,
            transparent 100%)`,
        }}
      />
    </motion.div>
  )
}
