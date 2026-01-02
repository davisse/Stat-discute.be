'use client'

import { useState, useMemo } from 'react'

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
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  // Update threshold when prop changes
  const handlePropChange = (newProp: PropType) => {
    setSelectedProp(newProp)
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
    points: 'PTS',
    rebounds: 'REB',
    assists: 'AST',
    steals: 'STL',
    blocks: 'BLK',
    turnovers: 'TOV',
    fg3_made: '3PM',
    fg_made: 'FGM',
    ft_made: 'FTM',
    minutes: 'MIN'
  }

  const propLabelFull: Record<PropType, string> = {
    points: 'Points',
    rebounds: 'Rebounds',
    assists: 'Assists',
    steals: 'Steals',
    blocks: 'Blocks',
    turnovers: 'Turnovers',
    fg3_made: '3-Pointers',
    fg_made: 'Field Goals',
    ft_made: 'Free Throws',
    minutes: 'Minutes'
  }

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
      value: game[selectedProp] as number
    }))

    const values = gamesWithValues.map(g => g.value)
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0

    const overGames = gamesWithValues.filter(g => g.value > threshold)
    const underGames = gamesWithValues.filter(g => g.value <= threshold)

    return {
      total: gamesWithValues.length,
      overCount: overGames.length,
      underCount: underGames.length,
      avg,
      gamesWithValues
    }
  }, [sortedGames, selectedProp, threshold])

  // Calculate Y-axis range
  const { minValue, maxValue, yAxisLabels } = useMemo(() => {
    const values = stats.gamesWithValues.map(g => g.value)
    const min = Math.min(...values)
    const max = Math.max(...values)

    // Add padding to range
    const range = max - min
    const padding = range * 0.15
    const adjustedMin = Math.max(0, Math.floor((min - padding) / 10) * 10)
    const adjustedMax = Math.ceil((max + padding) / 10) * 10

    // Generate Y-axis labels (5-6 ticks)
    const step = Math.ceil((adjustedMax - adjustedMin) / 5 / 10) * 10
    const labels: number[] = []
    for (let v = adjustedMax; v >= adjustedMin; v -= step) {
      labels.push(v)
    }

    return {
      minValue: adjustedMin,
      maxValue: adjustedMax,
      yAxisLabels: labels
    }
  }, [stats.gamesWithValues])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Calculate bar height percentage
  const getBarHeight = (value: number) => {
    const range = maxValue - minValue
    return ((value - minValue) / range) * 100
  }

  // Calculate line position
  const getLinePosition = (value: number) => {
    const range = maxValue - minValue
    return ((value - minValue) / range) * 100
  }

  return (
    <div className="bg-black rounded-2xl border border-zinc-800 overflow-hidden w-full h-full flex flex-col">
      {/* Title */}
      <div className="p-4 md:p-6 pb-0">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase" style={{ letterSpacing: '-0.05em' }}>
            Performance
          </h2>
          <span className="text-3xl md:text-5xl font-light text-zinc-600 uppercase" style={{ letterSpacing: '-0.05em' }}>
            vs Line
          </span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="p-4 md:p-6 pt-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Prop Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-500 uppercase font-medium">
            Prop
          </label>
          <select
            value={selectedProp}
            onChange={(e) => handlePropChange(e.target.value as PropType)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800
                     rounded-lg text-white text-sm font-medium
                     focus:border-zinc-600 focus:outline-none
                     hover:bg-zinc-800 cursor-pointer"
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
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-500 uppercase font-medium">
            Line
          </label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
            step={0.5}
            min={0}
            className="w-20 px-3 py-2 bg-zinc-900 border border-zinc-800
                     rounded-lg text-white text-center font-mono text-sm
                     focus:border-zinc-600 focus:outline-none"
          />
          <input
            type="range"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            min={minValue}
            max={maxValue}
            step={0.5}
            className="w-32 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-3
                     [&::-webkit-slider-thumb]:h-3
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-white
                     [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4 md:p-6 pt-8 relative flex-1 flex flex-col">
        <div className="relative flex-1" style={{ minHeight: '320px' }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-zinc-500 font-mono">
            {yAxisLabels.map((label, i) => (
              <span key={i} className="text-right pr-2">
                {label}
              </span>
            ))}
          </div>

          {/* Chart container */}
          <div className="ml-9 mr-1 relative" style={{ height: '280px' }}>
            {/* Grid lines */}
            {yAxisLabels.map((label, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-zinc-800/50"
                style={{ bottom: `${getLinePosition(label)}%` }}
              />
            ))}

            {/* Threshold Line */}
            <div
              className="absolute left-0 right-0 z-10 pointer-events-none"
              style={{ bottom: `${getLinePosition(threshold)}%` }}
            >
              <div className="border-t-2 border-white" />
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex">
              {stats.gamesWithValues.map((game) => {
                const isOver = game.value > threshold
                const diff = game.value - threshold
                const heightPercent = getBarHeight(game.value)
                const isHovered = hoveredGame === game.game_id

                return (
                  <div
                    key={game.game_id}
                    className="relative flex-1 h-full"
                    onMouseEnter={() => setHoveredGame(game.game_id)}
                    onMouseLeave={() => setHoveredGame(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div
                        className="absolute z-30 pointer-events-none left-1/2 -translate-x-1/2"
                        style={{ bottom: `${heightPercent + 2}%` }}
                      >
                        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                          <div className="text-white font-semibold text-sm">
                            vs {game.opponent_abbr}
                          </div>
                          <div className="text-zinc-300 text-sm mt-1">
                            {game.value} {propLabel[selectedProp]}
                          </div>
                          <div className="text-zinc-500 text-xs mt-1">
                            {formatDate(game.game_date)} • {game.home_away.toUpperCase()}
                          </div>
                          <div className={`text-xs mt-1 font-semibold ${isOver ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isOver ? 'OVER' : 'UNDER'} {threshold} ({diff > 0 ? '+' : ''}{diff.toFixed(0)})
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                        </div>
                      </div>
                    )}

                    {/* Bar - positioned absolutely from bottom */}
                    <div
                      className="absolute bottom-0 left-px right-px transition-all duration-150 cursor-pointer"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: isOver
                          ? (isHovered ? '#34d399' : '#10b981')
                          : (isHovered ? '#f87171' : '#ef4444'),
                        minHeight: '4px'
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* X-axis labels (opponent abbreviations - diagonal) */}
          <div className="ml-9 mr-1 flex mt-2" style={{ height: '40px' }}>
            {stats.gamesWithValues.map((game) => (
              <div
                key={game.game_id}
                className="flex-1 relative"
              >
                <span
                  className="absolute left-1/2 top-0 text-[10px] text-zinc-500 font-medium whitespace-nowrap"
                  style={{ transform: 'translateX(-50%) rotate(-45deg)', transformOrigin: 'top center' }}
                >
                  {game.opponent_abbr}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hit Rate Stats */}
        <div className="flex items-center justify-center gap-6 mt-8 py-4 bg-zinc-900/50 rounded-xl mx-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {stats.overCount}/{stats.total}
            </div>
            <div className="text-xs text-zinc-500 uppercase mt-1">Over</div>
          </div>
          <div className="text-center px-6 border-x border-zinc-800">
            <div className="text-3xl font-bold text-white">
              {stats.total > 0 ? ((stats.overCount / stats.total) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-xs text-zinc-500 uppercase mt-1">Hit Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {stats.underCount}/{stats.total}
            </div>
            <div className="text-xs text-zinc-500 uppercase mt-1">Under</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-emerald-500" />
            <span className="text-sm text-zinc-400">Over {threshold}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-red-500" />
            <span className="text-sm text-zinc-400">Under {threshold}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
