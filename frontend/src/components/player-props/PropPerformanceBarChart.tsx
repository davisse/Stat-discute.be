'use client'

import { useState, useMemo } from 'react'
import { Target } from 'lucide-react'

interface Game {
  game_id: string
  game_date: string
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fg_made: number
  fg_attempted: number
  fg3_made: number
  fg3_attempted: number
  ft_made: number
  ft_attempted: number
  minutes: number
  opponent: string
  opponent_abbr: string
  home_away: 'home' | 'away'
  result: 'W' | 'L'
  team_score?: number
  opponent_score?: number
}

export interface PropPerformanceBarChartProps {
  games: Game[]
  playerAvg: {
    points_avg: number
    rebounds_avg: number
    assists_avg: number
    steals_avg: number
    blocks_avg: number
    turnovers_avg: number
    threes_avg: number
    fgm_avg: number
    ftm_avg: number
    minutes_avg: number
  }
  playerTeam: string
  initialProp?: PropType
  initialThreshold?: number
}

type PropType =
  | 'points'
  | 'rebounds'
  | 'assists'
  | 'steals'
  | 'blocks'
  | 'turnovers'
  | 'fg3_made'
  | 'fg_made'
  | 'ft_made'
  | 'minutes'

export function PropPerformanceBarChart({
  games,
  playerAvg,
  playerTeam,
  initialProp = 'points',
  initialThreshold
}: PropPerformanceBarChartProps) {
  const [selectedProp, setSelectedProp] = useState<PropType>(initialProp)
  const [threshold, setThreshold] = useState<number>(
    initialThreshold ?? playerAvg.points_avg
  )

  // Update threshold when prop changes
  const handlePropChange = (newProp: PropType) => {
    setSelectedProp(newProp)
    // Set threshold to player average for the new prop
    const avgMap: Record<PropType, number> = {
      points: playerAvg.points_avg,
      rebounds: playerAvg.rebounds_avg,
      assists: playerAvg.assists_avg,
      steals: playerAvg.steals_avg,
      blocks: playerAvg.blocks_avg,
      turnovers: playerAvg.turnovers_avg,
      fg3_made: playerAvg.threes_avg,
      fg_made: playerAvg.fgm_avg,
      ft_made: playerAvg.ftm_avg,
      minutes: playerAvg.minutes_avg
    }
    setThreshold(avgMap[newProp])
  }

  // Get prop label
  const propLabel: Record<PropType, string> = {
    points: 'Points',
    rebounds: 'Rebounds',
    assists: 'Assists',
    steals: 'Steals',
    blocks: 'Blocks',
    turnovers: 'Turnovers',
    fg3_made: '3-Pointers Made',
    fg_made: 'Field Goals Made',
    ft_made: 'Free Throws Made',
    minutes: 'Minutes'
  }

  const currentPropLabel = propLabel[selectedProp]

  // Sort games chronologically (oldest to newest)
  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) =>
      new Date(a.game_date).getTime() - new Date(b.game_date).getTime()
    )
  }, [games])

  // Calculate statistics
  const stats = useMemo(() => {
    const gamesWithValues = sortedGames.map(game => ({
      ...game,
      value: game[selectedProp]
    }))

    const overGames = gamesWithValues.filter(g => g.value > threshold)
    const underGames = gamesWithValues.filter(g => g.value < threshold)
    const pushGames = gamesWithValues.filter(g => g.value === threshold)

    const total = gamesWithValues.length
    const overCount = overGames.length
    const underCount = underGames.length
    const pushCount = pushGames.length

    const overPct = total > 0 ? (overCount / total) * 100 : 0
    const underPct = total > 0 ? (underCount / total) * 100 : 0
    const pushPct = total > 0 ? (pushCount / total) * 100 : 0

    // Last 10 games trend
    const last10 = gamesWithValues.slice(-10)
    const last10Over = last10.filter(g => g.value > threshold).length
    const last10Under = last10.filter(g => g.value < threshold).length

    // Previous 10 games (for trend comparison)
    const previous10 = gamesWithValues.slice(-20, -10)
    const prev10Over = previous10.length > 0
      ? previous10.filter(g => g.value > threshold).length
      : 0
    const prev10Total = previous10.length

    const trendChange = prev10Total > 0
      ? ((last10Over / 10) - (prev10Over / prev10Total)) * 100
      : 0

    return {
      total,
      overCount,
      underCount,
      pushCount,
      overPct,
      underPct,
      pushPct,
      last10Over,
      last10Under,
      trendChange,
      gamesWithValues
    }
  }, [sortedGames, selectedProp, threshold])

  // Get max value for scaling
  const maxValue = useMemo(() => {
    const values = stats.gamesWithValues.map(g => g.value)
    const max = Math.max(...values, threshold * 1.2)
    return Math.ceil(max / 5) * 5 // Round up to nearest 5
  }, [stats.gamesWithValues, threshold])

  // Format date to short format
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  // Y-axis labels (5 ticks)
  const yAxisLabels = [
    maxValue,
    Math.round(maxValue * 0.75),
    Math.round(maxValue * 0.5),
    Math.round(maxValue * 0.25),
    0
  ]

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-950 px-4 py-3 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-white" />
          Prop Performance Analysis
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Track prop success rates across recent games
        </p>
      </div>

      <div className="p-4 md:p-6">
        {/* Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Prop Selector */}
          <div>
            <label className="block text-xs text-gray-400 uppercase mb-2 font-medium">
              Select Prop
            </label>
            <select
              value={selectedProp}
              onChange={(e) => handlePropChange(e.target.value as PropType)}
              className="w-full px-4 py-3 bg-transparent border border-gray-800
                       rounded-md text-white text-base font-medium
                       transition-all duration-300
                       focus:border-white focus:ring-1 focus:ring-white focus:outline-none
                       hover:bg-gray-950 cursor-pointer"
            >
              <option value="points">Points</option>
              <option value="rebounds">Rebounds</option>
              <option value="assists">Assists</option>
              <option value="fg3_made">3-Pointers Made</option>
              <option value="steals">Steals</option>
              <option value="blocks">Blocks</option>
              <option value="turnovers">Turnovers</option>
              <option value="fg_made">Field Goals Made</option>
              <option value="ft_made">Free Throws Made</option>
              <option value="minutes">Minutes Played</option>
            </select>
          </div>

          {/* Threshold Control */}
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400 uppercase font-medium">
                Threshold
              </label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
                step={0.5}
                min={0}
                max={maxValue}
                className="w-20 px-2 py-1 bg-transparent border border-gray-700
                         rounded text-white text-center font-mono text-sm
                         focus:border-white focus:ring-1 focus:ring-white focus:outline-none"
              />
            </div>
            <input
              type="range"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              min={0}
              max={maxValue}
              step={0.5}
              className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-white
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:hover:scale-110
                       [&::-webkit-slider-thumb]:transition-transform
                       [&::-moz-range-thumb]:w-4
                       [&::-moz-range-thumb]:h-4
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-white
                       [&::-moz-range-thumb]:border-0
                       [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* Success Rate Display */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3 bg-gray-950 border border-gray-800 rounded-lg px-6 py-3">
            <span className="text-2xl font-bold text-white font-mono">
              {stats.overCount}/{stats.total}
            </span>
            <span className="text-lg text-gray-400 uppercase text-sm font-medium">
              OVER
            </span>
            <span className="text-gray-600">•</span>
            <span className={`text-lg font-semibold ${
              stats.overPct >= 50 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stats.overPct.toFixed(0)}% Success Rate
            </span>
          </div>
        </div>

        {/* Vertical Bar Chart */}
        <div className="relative bg-gray-950 rounded-lg border border-gray-800 p-6 overflow-x-auto">
          <div className="relative min-w-[800px]">
            {/* Y-axis */}
            <div className="absolute left-0 top-0 bottom-24 flex flex-col justify-between text-xs text-gray-500 font-mono">
              {yAxisLabels.map((label, i) => (
                <span key={i} className="text-right w-8">
                  {label}
                </span>
              ))}
            </div>

            {/* Chart Area */}
            <div className="ml-12 mr-4">
              {/* Bars Container */}
              <div className="flex justify-around items-end h-64 relative">
                {/* Threshold Line */}
                <div
                  className="absolute left-0 right-0 pointer-events-none z-20"
                  style={{
                    bottom: `${(threshold / maxValue) * 100}%`,
                    borderTop: '2px solid #FFFFFF'
                  }}
                >
                  <span
                    className="absolute -left-12 -top-3 text-xs font-mono font-semibold"
                    style={{ color: '#FFFFFF' }}
                  >
                    {threshold.toFixed(1)}
                  </span>
                </div>
                {stats.gamesWithValues.map((game, index) => {
                  const heightPercent = (game.value / maxValue) * 100
                  const isOver = game.value > threshold

                  return (
                    <div key={game.game_id} className="flex flex-col items-center group">
                      {/* Bar */}
                      <div className="relative h-64 w-8 md:w-10 flex items-end">
                        <div
                          className={`w-full rounded-t transition-all duration-300 ${
                            isOver
                              ? 'bg-green-500/80 hover:bg-green-500'
                              : 'bg-red-500/80 hover:bg-red-500'
                          } cursor-pointer relative`}
                          style={{ height: `${heightPercent}%` }}
                        >
                          {/* Value label on hover */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2
                                        opacity-0 group-hover:opacity-100 transition-opacity
                                        text-sm font-mono font-bold text-white bg-gray-900
                                        px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                            {game.value} {currentPropLabel.toLowerCase()}
                            <div className="text-xs text-gray-400 mt-1">
                              {game.result} {game.team_score !== undefined ? `${game.team_score}-${game.opponent_score}` : ''}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2
                                          border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      </div>

                      {/* Date Label */}
                      <div className="mt-1 text-xs text-gray-500 text-center font-mono whitespace-nowrap">
                        {formatShortDate(game.game_date)}
                      </div>

                      {/* Matchup Label */}
                      <div className="text-xs text-gray-500 text-center whitespace-nowrap font-medium">
                        {game.home_away === 'home'
                          ? `${playerTeam} vs ${game.opponent_abbr}`
                          : `${playerTeam} @ ${game.opponent_abbr}`
                        }
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* X-axis Direction Labels */}
              <div className="flex justify-between items-center mt-4 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1">
                  <span>←</span>
                  <span>Oldest</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Newest</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Breakdown */}
        <div className="mt-6 p-4 bg-gray-950 rounded-lg border border-gray-800">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Statistics Breakdown
          </h4>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white font-mono">
                {stats.total}
              </div>
              <div className="text-xs text-gray-500">Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 font-mono">
                {stats.overCount}
              </div>
              <div className="text-xs text-gray-500">
                Over ({stats.overPct.toFixed(0)}%)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 font-mono">
                {stats.underCount}
              </div>
              <div className="text-xs text-gray-500">
                Under ({stats.underPct.toFixed(0)}%)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400 font-mono">
                {stats.pushCount}
              </div>
              <div className="text-xs text-gray-500">
                Push ({stats.pushPct.toFixed(0)}%)
              </div>
            </div>
          </div>

          {/* Recent Trend */}
          <div className="pt-3 border-t border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm">
              <span className="text-gray-400">Last 10 games:</span>
              <span className="text-white font-medium">
                {stats.last10Over} Over, {stats.last10Under} Under
                <span className="text-gray-600 mx-2">•</span>
                Trend:{' '}
                <span
                  className={`ml-1 ${
                    stats.trendChange > 0
                      ? 'text-green-400'
                      : stats.trendChange < 0
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}
                >
                  {stats.trendChange > 0 ? '↗' : stats.trendChange < 0 ? '↘' : '→'}{' '}
                  {stats.trendChange > 0 ? '+' : ''}
                  {stats.trendChange.toFixed(0)}%
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
