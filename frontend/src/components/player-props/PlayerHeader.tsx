'use client'

import { User } from 'lucide-react'

interface PlayerHeaderProps {
  player: {
    player_id: string
    full_name: string
    position: string | null
    jersey_number: string | null
    team_abbr: string
    team_name: string
    height: string | null
    weight: string | null
    games_played: number
    points_avg: number
    rebounds_avg: number
    assists_avg: number
    minutes_avg: number
    fg_pct: number
  }
}

export function PlayerHeader({ player }: PlayerHeaderProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Mobile Layout */}
      <div className="p-4 md:p-6">
        {/* Player Identity Section */}
        <div className="flex gap-4 items-start mb-6">
          {/* Player Photo Placeholder */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-800 flex items-center justify-center">
              <User className="w-10 h-10 md:w-12 md:h-12 text-gray-600" />
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-grow min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 truncate">
              {player.full_name}
            </h1>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-400">
              {player.position && (
                <span className="flex items-center gap-1">
                  <span className="font-medium text-blue-400">{player.position}</span>
                  {player.jersey_number && (
                    <span className="text-gray-500">#{player.jersey_number}</span>
                  )}
                </span>
              )}

              <span className="flex items-center gap-1">
                <span className="text-gray-500">•</span>
                <span className="font-medium text-white">{player.team_abbr}</span>
              </span>

              {player.height && player.weight && (
                <span className="flex items-center gap-1">
                  <span className="text-gray-500">•</span>
                  <span>{player.height}, {player.weight} lbs</span>
                </span>
              )}
            </div>

            <div className="mt-2 text-sm text-gray-500">
              {player.games_played} games played
            </div>
          </div>
        </div>

        {/* Season Averages - Mobile Optimized Grid */}
        <div className="border-t border-gray-800 pt-4">
          <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-3">
            Season Averages
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {/* Points */}
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {player.points_avg.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                PPG
              </div>
            </div>

            {/* Rebounds */}
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {player.rebounds_avg.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                RPG
              </div>
            </div>

            {/* Assists */}
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {player.assists_avg.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                APG
              </div>
            </div>

            {/* Minutes */}
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {player.minutes_avg.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                MPG
              </div>
            </div>

            {/* FG% */}
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {player.fg_pct.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                FG%
              </div>
            </div>

            {/* Games */}
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {player.games_played}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                GP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
