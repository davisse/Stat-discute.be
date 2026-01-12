'use client'

import { useState } from 'react'
import { TeamScoringTrendChart, type TeamGameDay } from '@/components/teams'

interface TeamInfo {
  abbreviation: string
  name: string
}

interface ScoringTrendWrapperProps {
  homeTeam: TeamInfo
  awayTeam: TeamInfo
  homeGames: TeamGameDay[]
  awayGames: TeamGameDay[]
}

export function ScoringTrendWrapper({
  homeTeam,
  awayTeam,
  homeGames,
  awayGames
}: ScoringTrendWrapperProps) {
  const [selectedTeam, setSelectedTeam] = useState<'away' | 'home'>('away')

  const currentGames = selectedTeam === 'home' ? homeGames : awayGames

  return (
    <div className="relative">
      {/* Team Toggle - Positioned above the chart */}
      <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
        <div className="inline-flex bg-zinc-800/80 backdrop-blur-sm rounded-full p-0.5 sm:p-1">
          <button
            onClick={() => setSelectedTeam('away')}
            className={`
              px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider
              transition-all duration-200
              ${selectedTeam === 'away'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
              }
            `}
          >
            {awayTeam.abbreviation}
          </button>
          <button
            onClick={() => setSelectedTeam('home')}
            className={`
              px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider
              transition-all duration-200
              ${selectedTeam === 'home'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
              }
            `}
          >
            {homeTeam.abbreviation}
          </button>
        </div>
      </div>

      <TeamScoringTrendChart games={currentGames} />
    </div>
  )
}

export default ScoringTrendWrapper
