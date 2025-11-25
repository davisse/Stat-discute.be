'use client'

import { Calendar, MapPin, Clock } from 'lucide-react'

interface NextGameMatchupProps {
  nextGame: {
    game_id: string
    game_date: string
    game_time: string | null
    venue: string | null
    home_team: string
    home_abbr: string
    away_team: string
    away_abbr: string
    player_location: 'home' | 'away' | null
  } | null
  playerTeam: string
}

export function NextGameMatchup({ nextGame, playerTeam }: NextGameMatchupProps) {
  if (!nextGame) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Next Game</h2>
        <p className="text-gray-400 text-center py-8">
          No upcoming game scheduled
        </p>
      </div>
    )
  }

  // Format date
  const gameDate = new Date(nextGame.game_date)
  const formattedDate = gameDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  // Determine opponent
  const isHome = nextGame.player_location === 'home'
  const opponent = isHome ? nextGame.away_abbr : nextGame.home_abbr
  const opponentFull = isHome ? nextGame.away_team : nextGame.home_team

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-950 px-4 py-3 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Next Game
        </h2>
      </div>

      {/* Game Info */}
      <div className="p-4 md:p-6">
        {/* Date and Time */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          {nextGame.game_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{nextGame.game_time}</span>
            </div>
          )}

          {nextGame.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{nextGame.venue}</span>
            </div>
          )}
        </div>

        {/* Matchup */}
        <div className="flex items-center justify-center gap-4 md:gap-6">
          {/* Player's Team */}
          <div className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-600/20 flex items-center justify-center mb-2 mx-auto">
              <span className="text-xl md:text-2xl font-bold text-blue-400">
                {playerTeam}
              </span>
            </div>
            <div className="text-sm font-medium text-white">
              {isHome ? 'HOME' : 'AWAY'}
            </div>
          </div>

          {/* VS */}
          <div className="text-2xl md:text-3xl font-bold text-gray-600">
            VS
          </div>

          {/* Opponent */}
          <div className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-800 flex items-center justify-center mb-2 mx-auto">
              <span className="text-xl md:text-2xl font-bold text-gray-400">
                {opponent}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-400">
              {isHome ? 'AWAY' : 'HOME'}
            </div>
          </div>
        </div>

        {/* Full Team Names */}
        <div className="mt-6 pt-4 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            {isHome ? nextGame.home_team : nextGame.away_team}
            {' vs '}
            {opponentFull}
          </p>
        </div>
      </div>
    </div>
  )
}
