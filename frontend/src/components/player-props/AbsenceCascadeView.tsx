'use client'

import { useState, useMemo } from 'react'
import { TeammatePerformanceSplit } from '@/lib/queries'

interface AbsenceCascadeViewProps {
  absentPlayer: {
    playerId: number
    playerName: string
    teamId: number
    teamAbbr: string
    gamesPlayed: number
    gamesMissed: number
  }
  teammates: TeammatePerformanceSplit[]
}

type SortOption = 'boost' | 'games'

export function AbsenceCascadeView({ absentPlayer, teammates }: AbsenceCascadeViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>('boost')
  const [minGames, setMinGames] = useState(3)
  const [showOnlyPositive, setShowOnlyPositive] = useState(false)

  // Filter and sort teammates
  const filteredTeammates = useMemo(() => {
    let filtered = teammates.filter(teammate =>
      teammate.without_games >= minGames &&
      teammate.with_games >= minGames
    )

    // Apply positive boost filter
    if (showOnlyPositive) {
      filtered = filtered.filter(teammate => teammate.pts_boost > 0)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'boost':
          return b.pts_boost - a.pts_boost
        case 'games':
          return b.without_games - a.without_games
        default:
          return 0
      }
    })

    return filtered
  }, [teammates, minGames, showOnlyPositive, sortBy])

  // Helper function to get boost color
  const getBoostColor = (boost: number) => {
    if (boost > 5) return 'text-green-400'
    if (boost > 2) return 'text-green-300'
    if (boost > 0) return 'text-green-200'
    if (boost < -5) return 'text-red-400'
    if (boost < -2) return 'text-red-300'
    if (boost < 0) return 'text-red-200'
    return 'text-gray-400'
  }

  return (
    <div className="space-y-6">
      {/* Header: Absent Player */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{absentPlayer.playerName}</h2>
            <p className="text-gray-400 mt-1">{absentPlayer.teamAbbr} • Starter</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Games Missed</p>
            <p className="text-3xl font-mono font-bold text-white">{absentPlayer.gamesMissed}</p>
            <p className="text-xs text-gray-500 mt-1">
              {absentPlayer.gamesPlayed} played • {((absentPlayer.gamesPlayed / (absentPlayer.gamesPlayed + absentPlayer.gamesMissed)) * 100).toFixed(1)}% availability
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="boost">Points Boost</option>
              <option value="games">Games Without</option>
            </select>
          </div>

          {/* Min Games */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Min Games: {minGames}</label>
            <input
              type="range"
              min="3"
              max="10"
              value={minGames}
              onChange={(e) => setMinGames(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Positive Filter */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyPositive}
                onChange={(e) => setShowOnlyPositive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-400">Only Positive Boost</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Showing {filteredTeammates.length} teammates with meaningful stat changes
        </p>
      </div>

      {/* Teammate Cards Grid */}
      {filteredTeammates.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No teammates meet the current filter criteria</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting the minimum games or boost filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeammates.map((teammate) => (
            <div
              key={teammate.teammate_id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
            >
              {/* Player Name */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{teammate.teammate_name}</h3>
                <p className="text-sm text-gray-400">
                  {teammate.without_games} games when {absentPlayer.playerName.split(' ').pop()} out
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {/* Points Comparison */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Points</span>
                    <span className={`text-sm font-mono font-bold ${getBoostColor(teammate.pts_boost)}`}>
                      {teammate.pts_boost > 0 ? '+' : ''}{teammate.pts_boost.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-gray-500">With: {teammate.with_pts.toFixed(1)}</span>
                    <span className="text-white">→</span>
                    <span className="text-white font-bold">Without: {teammate.without_pts.toFixed(1)}</span>
                  </div>
                  {teammate.pts_boost >= 3 && (
                    <div className="mt-1 text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                      💡 Prop Opportunity
                    </div>
                  )}
                </div>

                {/* Sample Size */}
                <div className="pt-2 border-t border-gray-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Sample:</span>
                    <span className="font-mono text-gray-400">
                      {teammate.with_games} with / {teammate.without_games} without
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
