'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { hexToRgba } from '@/lib/team-colors'

interface SpotlightRaysProps {
  teamColor: string
}

/**
 * SpotlightRays - Conic gradient light rays emanating from top center
 * Creates stadium spotlight effect with team-colored rays
 */
export function SpotlightRays({ teamColor }: SpotlightRaysProps) {
  const shouldReduceMotion = useReducedMotion()

  // Generate conic gradient with 12 rays spread across -30deg to +30deg from top
  const generateRaysGradient = () => {
    const rayColor = hexToRgba(teamColor, 0.15)
    const transparent = 'transparent'
    const rayWidth = 2 // degrees per ray
    const gapWidth = 3 // degrees between rays
    const totalRays = 12
    const spreadStart = -30

    let stops: string[] = []
    stops.push(`${transparent} 0deg`)
    stops.push(`${transparent} ${150 + spreadStart}deg`) // Start at 150deg (180-30)

    for (let i = 0; i < totalRays; i++) {
      const rayStart = 150 + spreadStart + i * (rayWidth + gapWidth)
      const rayEnd = rayStart + rayWidth

      stops.push(`${transparent} ${rayStart}deg`)
      stops.push(`${rayColor} ${rayStart}deg`)
      stops.push(`${rayColor} ${rayEnd}deg`)
      stops.push(`${transparent} ${rayEnd}deg`)
    }

    stops.push(`${transparent} 210deg`) // End at 210deg (180+30)
    stops.push(`${transparent} 360deg`)

    return `conic-gradient(from 180deg at 50% 0%, ${stops.join(', ')})`
  }

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={shouldReduceMotion ? { opacity: 0.7 } : {
        opacity: [0.6, 0.9, 0.6]
      }}
      transition={shouldReduceMotion ? { duration: 0.3 } : {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[150%]"
        style={{
          background: generateRaysGradient(),
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
        }}
      />
    </motion.div>
  )
}
