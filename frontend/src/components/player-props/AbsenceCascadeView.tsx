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

type SortOption = 'deltaPercent' | 'absoluteDelta' | 'usage' | 'minutes'
type StatFocus = 'all' | 'points' | 'assists' | 'rebounds'

export function AbsenceCascadeView({ absentPlayer, teammates }: AbsenceCascadeViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>('deltaPercent')
  const [statFocus, setStatFocus] = useState<StatFocus>('all')
  const [minGames, setMinGames] = useState(3)
  const [showOnlySignificant, setShowOnlySignificant] = useState(false)

  // Filter and sort teammates
  const filteredTeammates = useMemo(() => {
    let filtered = teammates.filter(teammate =>
      teammate.games_with_absent >= minGames &&
      teammate.games_with_present >= minGames
    )

    // Apply significance filter (>20% change)
    if (showOnlySignificant) {
      filtered = filtered.filter(teammate => {
        const maxDeltaPct = Math.max(
          Math.abs(teammate.stats.points.deltaPercent),
          Math.abs(teammate.stats.assists.deltaPercent),
          Math.abs(teammate.stats.rebounds.deltaPercent)
        )
        return maxDeltaPct >= 20
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deltaPercent':
          return b.stats.points.deltaPercent - a.stats.points.deltaPercent
        case 'absoluteDelta':
          return b.stats.points.delta - a.stats.points.delta
        case 'usage':
          return b.stats.fg_attempts.delta - a.stats.fg_attempts.delta
        case 'minutes':
          return b.stats.minutes.delta - a.stats.minutes.delta
        default:
          return 0
      }
    })

    return filtered
  }, [teammates, minGames, showOnlySignificant, sortBy])

  // Helper function to get delta color
  const getDeltaColor = (deltaPercent: number) => {
    const abs = Math.abs(deltaPercent)
    if (abs < 10) return 'text-gray-400'
    if (deltaPercent > 40) return 'text-green-400'
    if (deltaPercent > 20) return 'text-green-300'
    if (deltaPercent > 0) return 'text-green-200'
    if (deltaPercent < -40) return 'text-red-400'
    if (deltaPercent < -20) return 'text-red-300'
    return 'text-red-200'
  }

  // Helper function to determine if this is a prop opportunity
  const isPropOpportunity = (stat: { delta: number; deltaPercent: number }, threshold: number = 3.0) => {
    return Math.abs(stat.delta) >= threshold && Math.abs(stat.deltaPercent) >= 20
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="deltaPercent">Delta % (Points)</option>
              <option value="absoluteDelta">Absolute Delta</option>
              <option value="usage">Usage Increase</option>
              <option value="minutes">Minutes Increase</option>
            </select>
          </div>

          {/* Stat Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Stat Focus</label>
            <select
              value={statFocus}
              onChange={(e) => setStatFocus(e.target.value as StatFocus)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stats</option>
              <option value="points">Points Only</option>
              <option value="assists">Assists Only</option>
              <option value="rebounds">Rebounds Only</option>
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

          {/* Significance Toggle */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlySignificant}
                onChange={(e) => setShowOnlySignificant(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-400">Only Significant (&gt;20%)</span>
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
          <p className="text-sm text-gray-500 mt-2">Try adjusting the minimum games or significance filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeammates.map((teammate) => (
            <div
              key={teammate.player_id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
            >
              {/* Player Name */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{teammate.player_name}</h3>
                <p className="text-sm text-gray-400">
                  {teammate.games_with_absent} games when {absentPlayer.playerName.split(' ').pop()} out
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {/* Points */}
                {(statFocus === 'all' || statFocus === 'points') && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Points</span>
                      <span className={`text-sm font-mono font-bold ${getDeltaColor(teammate.stats.points.deltaPercent)}`}>
                        {teammate.stats.points.delta > 0 ? '+' : ''}{teammate.stats.points.delta}
                        <span className="text-xs ml-1">({teammate.stats.points.deltaPercent > 0 ? '+' : ''}{teammate.stats.points.deltaPercent}%)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-gray-500">{teammate.stats.points.with.toFixed(1)}</span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500/50"
                          style={{ width: `${(teammate.stats.points.with / 30) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-bold">{teammate.stats.points.without.toFixed(1)}</span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(teammate.stats.points.without / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                    {isPropOpportunity(teammate.stats.points) && (
                      <div className="mt-1 text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                        💡 Prop Opportunity
                      </div>
                    )}
                  </div>
                )}

                {/* Assists */}
                {(statFocus === 'all' || statFocus === 'assists') && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Assists</span>
                      <span className={`text-sm font-mono font-bold ${getDeltaColor(teammate.stats.assists.deltaPercent)}`}>
                        {teammate.stats.assists.delta > 0 ? '+' : ''}{teammate.stats.assists.delta}
                        <span className="text-xs ml-1">({teammate.stats.assists.deltaPercent > 0 ? '+' : ''}{teammate.stats.assists.deltaPercent}%)</span>
                      </span>
                    </div>
                    <div className="text-xs font-mono text-gray-500">
                      {teammate.stats.assists.with.toFixed(1)} → {teammate.stats.assists.without.toFixed(1)}
                    </div>
                    {isPropOpportunity(teammate.stats.assists, 1.5) && (
                      <div className="mt-1 text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                        💡 Prop Opportunity
                      </div>
                    )}
                  </div>
                )}

                {/* Rebounds */}
                {(statFocus === 'all' || statFocus === 'rebounds') && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Rebounds</span>
                      <span className={`text-sm font-mono font-bold ${getDeltaColor(teammate.stats.rebounds.deltaPercent)}`}>
                        {teammate.stats.rebounds.delta > 0 ? '+' : ''}{teammate.stats.rebounds.delta}
                        <span className="text-xs ml-1">({teammate.stats.rebounds.deltaPercent > 0 ? '+' : ''}{teammate.stats.rebounds.deltaPercent}%)</span>
                      </span>
                    </div>
                    <div className="text-xs font-mono text-gray-500">
                      {teammate.stats.rebounds.with.toFixed(1)} → {teammate.stats.rebounds.without.toFixed(1)}
                    </div>
                    {isPropOpportunity(teammate.stats.rebounds, 2.0) && (
                      <div className="mt-1 text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                        💡 Prop Opportunity
                      </div>
                    )}
                  </div>
                )}

                {/* Minutes & Usage (always show in compact form) */}
                {statFocus === 'all' && (
                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Minutes:</span>
                      <span className={`font-mono ${getDeltaColor(teammate.stats.minutes.deltaPercent)}`}>
                        {teammate.stats.minutes.with.toFixed(1)} → {teammate.stats.minutes.without.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-500">FG Attempts:</span>
                      <span className={`font-mono ${getDeltaColor(teammate.stats.fg_attempts.deltaPercent)}`}>
                        {teammate.stats.fg_attempts.with.toFixed(1)} → {teammate.stats.fg_attempts.without.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
