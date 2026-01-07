'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { getTeamColors } from '@/lib/team-colors'
import { SpotlightRays } from './SpotlightRays'
import { SpotlightCone } from './SpotlightCone'
import { RankDisplay } from './RankDisplay'
import { StatsBar } from './StatsBar'

export interface StadiumSpotlightHeroProps {
  teamId: number
  abbreviation: string
  fullName: string
  conferenceRank: number
  conference: 'East' | 'West'
  wins: number
  losses: number
  streak: string
  netRating: number
}

/**
 * StadiumSpotlightHero - Team hero section with spotlight effects
 * Features team-colored light rays, logo, giant rank number, and stats bar
 * Designed as an inline section (not full-viewport)
 */
export function StadiumSpotlightHero({
  teamId,
  abbreviation,
  fullName,
  conferenceRank,
  conference,
  wins,
  losses,
  streak,
  netRating,
}: StadiumSpotlightHeroProps) {
  const shouldReduceMotion = useReducedMotion()

  // Get team colors
  const { primary: teamColor } = getTeamColors(abbreviation)

  // NBA CDN logo URL
  const logoUrl = `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`

  return (
    <section
      className="relative w-full h-[450px] sm:h-[500px] md:h-[550px] lg:h-[600px] overflow-hidden rounded-lg sm:rounded-xl"
    >
      {/* Background Effects */}
      <SpotlightRays teamColor={teamColor} />
      <SpotlightCone teamColor={teamColor} />

      {/* Main Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.1 : 0.4 }}
      >
        {/* Team Logo */}
        <motion.div
          className="relative mb-4 md:mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.8,
            delay: shouldReduceMotion ? 0 : 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="relative w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[200px] md:h-[200px] lg:w-[220px] lg:h-[220px]">
            <Image
              src={logoUrl}
              alt={`${fullName} logo`}
              fill
              priority
              className="object-contain drop-shadow-2xl"
              sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 200px, 220px"
            />
          </div>
        </motion.div>

        {/* Team Name (small) */}
        <motion.h1
          className="text-base sm:text-lg md:text-xl font-medium text-white/90 tracking-wide mb-2 md:mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.1 : 0.5,
            delay: shouldReduceMotion ? 0 : 0.4,
          }}
        >
          {fullName}
        </motion.h1>

        {/* Giant Rank Number */}
        <RankDisplay
          rank={conferenceRank}
          conference={conference}
          teamColor={teamColor}
        />

        {/* Stats Bar */}
        <div className="mt-4 md:mt-6">
          <StatsBar
            wins={wins}
            losses={losses}
            streak={streak}
            netRating={netRating}
          />
        </div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))',
        }}
      />
    </section>
  )
}
