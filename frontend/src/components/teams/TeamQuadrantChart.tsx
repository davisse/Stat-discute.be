'use client'

import * as React from 'react'
import { cn, safeNum } from '@/lib/utils'

/**
 * TeamQuadrantChart Component
 *
 * Multi-scenario 2D scatter plot with pill tabs for switching views:
 * 1. Score (Pts): PPG vs OPP PPG - Offensive/Defensive scoring
 * 2. Style: PACE vs NET RTG - Team tempo and efficiency
 * 3. Efficiency (Eff): ORTG vs DRTG - Pace-adjusted ratings
 * 4. Stability (Stable): Totals Avg vs Std Dev - Consistency
 *
 * Mobile-first responsive design with touch-friendly pill selector
 */

// Extended interface for all scenario stats
export interface TeamQuadrantData {
  team_id: number
  abbreviation: string
  ppg: number
  opp_ppg: number
  pace?: number
  ortg?: number
  drtg?: number
  net_rtg?: number
  total_avg?: number
  std_dev?: number
}

// Scenario configuration type
interface QuadrantScenario {
  id: string
  label: string
  title: string
  subtitle: string
  xAxis: {
    key: keyof TeamQuadrantData
    labelLow: string
    labelHigh: string
  }
  yAxis: {
    key: keyof TeamQuadrantData
    labelLow: string
    labelHigh: string
    inverted?: boolean // true = lower value at bottom is better
  }
  quadrants: {
    topLeft: string
    topRight: string
    bottomLeft: string
    bottomRight: string
    eliteCorner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  }
}

// Scenario configurations
const SCENARIOS: QuadrantScenario[] = [
  {
    id: 'score',
    label: 'Pts',
    title: 'Offense vs Defense',
    subtitle: 'Bottom-right = elite teams',
    xAxis: { key: 'ppg', labelLow: 'Low Offense', labelHigh: 'High Offense' },
    yAxis: { key: 'opp_ppg', labelLow: 'Strong Defense', labelHigh: 'Weak Defense', inverted: true },
    quadrants: {
      topLeft: 'Struggling',
      topRight: 'Offensive',
      bottomLeft: 'Defensive',
      bottomRight: 'Elite',
      eliteCorner: 'bottomRight',
    },
  },
  {
    id: 'style',
    label: 'Style',
    title: 'Pace vs Net Rating',
    subtitle: 'Bottom-right = fast elite',
    xAxis: { key: 'pace', labelLow: 'Slow Pace', labelHigh: 'Fast Pace' },
    yAxis: { key: 'net_rtg', labelLow: 'Losing', labelHigh: 'Winning', inverted: false },
    quadrants: {
      topLeft: 'Slow Winners',
      topRight: 'Fast Winners',
      bottomLeft: 'Slow Losers',
      bottomRight: 'Fast Losers',
      eliteCorner: 'topRight',
    },
  },
  {
    id: 'eff',
    label: 'Eff',
    title: 'Offensive vs Defensive Eff',
    subtitle: 'Top-right = elite efficiency',
    xAxis: { key: 'ortg', labelLow: 'Bad Offense', labelHigh: 'Good Offense' },
    yAxis: { key: 'drtg', labelLow: 'Good Defense', labelHigh: 'Bad Defense', inverted: true },
    quadrants: {
      topLeft: 'Struggling',
      topRight: 'Offensive',
      bottomLeft: 'Defensive',
      bottomRight: 'Elite',
      eliteCorner: 'bottomRight',
    },
  },
  {
    id: 'stable',
    label: 'Stable',
    title: 'Totals vs Consistency',
    subtitle: 'Bottom-right = high & stable',
    xAxis: { key: 'total_avg', labelLow: 'Low Scoring', labelHigh: 'High Scoring' },
    yAxis: { key: 'std_dev', labelLow: 'Consistent', labelHigh: 'Volatile', inverted: true },
    quadrants: {
      topLeft: 'Unpredictable Low',
      topRight: 'Unpredictable High',
      bottomLeft: 'Predictable Low',
      bottomRight: 'Predictable High',
      eliteCorner: 'bottomRight',
    },
  },
]

export interface TeamQuadrantChartProps {
  data: TeamQuadrantData[]
  selectedTeamId?: number
  className?: string
}

export function TeamQuadrantChart({
  data,
  selectedTeamId,
  className,
}: TeamQuadrantChartProps) {
  // Selected scenario state
  const [selectedScenario, setSelectedScenario] = React.useState<string>('score')
  const scenario = SCENARIOS.find((s) => s.id === selectedScenario) || SCENARIOS[0]

  // Check if scenario has valid data
  const hasScenarioData = React.useCallback(
    (scenarioId: string) => {
      const sc = SCENARIOS.find((s) => s.id === scenarioId)
      if (!sc || data.length === 0) return false
      // Check if at least one team has both axis values
      return data.some((team) => {
        const xVal = team[sc.xAxis.key]
        const yVal = team[sc.yAxis.key]
        return xVal !== undefined && xVal !== null && yVal !== undefined && yVal !== null
      })
    },
    [data]
  )

  // Calculate bounds and averages dynamically based on scenario
  const stats = React.useMemo(() => {
    const xKey = scenario.xAxis.key
    const yKey = scenario.yAxis.key

    // Filter teams that have both values for current scenario
    const validTeams = data.filter((t) => {
      const xVal = t[xKey]
      const yVal = t[yKey]
      return xVal !== undefined && xVal !== null && yVal !== undefined && yVal !== null
    })

    if (validTeams.length === 0) {
      return {
        minX: 100,
        maxX: 130,
        minY: 100,
        maxY: 130,
        avgX: 115,
        avgY: 115,
      }
    }

    const xValues = validTeams.map((t) => safeNum(t[xKey] as number))
    const yValues = validTeams.map((t) => safeNum(t[yKey] as number))

    const minX = Math.min(...xValues)
    const maxX = Math.max(...xValues)
    const minY = Math.min(...yValues)
    const maxY = Math.max(...yValues)

    const avgX = xValues.reduce((a, b) => a + b, 0) / xValues.length
    const avgY = yValues.reduce((a, b) => a + b, 0) / yValues.length

    // Minimal padding to bounds (4%)
    const xPadding = (maxX - minX) * 0.04
    const yPadding = (maxY - minY) * 0.04

    return {
      minX: minX - xPadding,
      maxX: maxX + xPadding,
      minY: minY - yPadding,
      maxY: maxY + yPadding,
      avgX,
      avgY,
    }
  }, [data, scenario])

  // Convert data point to chart position (percentage)
  const getPosition = React.useCallback(
    (team: TeamQuadrantData) => {
      const xVal = safeNum(team[scenario.xAxis.key] as number)
      const yVal = safeNum(team[scenario.yAxis.key] as number)

      // X position (left = low, right = high)
      const x = ((xVal - stats.minX) / (stats.maxX - stats.minX)) * 100

      // Y position - may be inverted based on scenario
      let y = ((yVal - stats.minY) / (stats.maxY - stats.minY)) * 100
      // If inverted, flip the Y axis (so lower values appear at bottom)
      if (scenario.yAxis.inverted) {
        y = y // Keep as is - high values at top
      } else {
        y = 100 - y // Invert - high values at top for non-inverted (like net rating where high is good)
      }

      return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
    },
    [stats, scenario]
  )

  // Get quadrant center lines position
  const centerLines = React.useMemo(() => {
    const avgX = ((stats.avgX - stats.minX) / (stats.maxX - stats.minX)) * 100
    let avgY = ((stats.avgY - stats.minY) / (stats.maxY - stats.minY)) * 100
    if (!scenario.yAxis.inverted) {
      avgY = 100 - avgY
    }
    return { x: avgX, y: avgY }
  }, [stats, scenario])

  // Get tooltip text for a team
  const getTooltip = React.useCallback(
    (team: TeamQuadrantData) => {
      const xVal = safeNum(team[scenario.xAxis.key] as number)
      const yVal = safeNum(team[scenario.yAxis.key] as number)
      return `${team.abbreviation}: ${xVal.toFixed(1)} × ${yVal.toFixed(1)}`
    },
    [scenario]
  )

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 sm:p-4',
          className
        )}
      >
        <p className="text-zinc-500 text-sm">No team data available</p>
      </div>
    )
  }

  // Filter teams that have data for current scenario
  const validTeams = data.filter((t) => {
    const xVal = t[scenario.xAxis.key]
    const yVal = t[scenario.yAxis.key]
    return xVal !== undefined && xVal !== null && yVal !== undefined && yVal !== null
  })

  return (
    <div
      className={cn(
        'sm:bg-zinc-900/50 sm:border sm:border-zinc-800 sm:rounded-lg p-0 sm:p-4 md:p-6',
        className
      )}
    >
      {/* Pill Tabs - Scenario Selector */}
      <div className="flex justify-center mb-2 sm:mb-3">
        <div className="inline-flex bg-zinc-800/50 rounded-full p-0.5 sm:p-1">
          {SCENARIOS.map((sc) => {
            const isActive = sc.id === selectedScenario
            const hasData = hasScenarioData(sc.id)
            return (
              <button
                key={sc.id}
                onClick={() => hasData && setSelectedScenario(sc.id)}
                disabled={!hasData}
                className={cn(
                  'px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all',
                  'min-w-[52px] sm:min-w-[64px]',
                  isActive
                    ? 'bg-white text-black'
                    : hasData
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                      : 'text-zinc-600 cursor-not-allowed'
                )}
              >
                {sc.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dynamic Header */}
      <h3 className="text-white text-sm sm:text-base font-medium mb-0.5 sm:mb-1 text-center sm:text-left">
        {scenario.title}
      </h3>
      <p className="text-zinc-500 text-xs sm:text-sm mb-1 sm:mb-4 md:mb-6 text-center sm:text-left">
        {scenario.subtitle}
      </p>

      {/* Chart Container */}
      <div className="relative">
        {/* Y-axis label - hidden on mobile */}
        <div className="hidden sm:block absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
          <span className="text-[10px] sm:text-xs text-zinc-500 whitespace-nowrap">
            ← {scenario.yAxis.labelLow} | {scenario.yAxis.labelHigh} →
          </span>
        </div>

        {/* Chart Area */}
        <div className="sm:ml-8 md:ml-12 sm:mr-4 md:mr-6">
          {/* Y-axis values - hidden on mobile */}
          <div className="hidden sm:flex justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-zinc-600 font-mono">
              {scenario.yAxis.inverted ? stats.maxY.toFixed(0) : stats.minY.toFixed(0)}
            </span>
          </div>

          {/* Main chart - responsive height */}
          <div
            className="relative bg-zinc-900 sm:border sm:border-zinc-800 rounded h-[320px] sm:h-[360px] md:h-[480px]"
          >

            {/* Quadrant backgrounds */}
            <div
              className="absolute bg-red-900/10"
              style={{
                left: 0,
                top: 0,
                width: `${centerLines.x}%`,
                height: `${centerLines.y}%`,
              }}
            />
            <div
              className="absolute bg-yellow-900/10"
              style={{
                left: `${centerLines.x}%`,
                top: 0,
                right: 0,
                height: `${centerLines.y}%`,
              }}
            />
            <div
              className="absolute bg-blue-900/10"
              style={{
                left: 0,
                top: `${centerLines.y}%`,
                width: `${centerLines.x}%`,
                bottom: 0,
              }}
            />
            <div
              className="absolute bg-green-900/10"
              style={{
                left: `${centerLines.x}%`,
                top: `${centerLines.y}%`,
                right: 0,
                bottom: 0,
              }}
            />

            {/* Center lines */}
            <div
              className="absolute w-px bg-zinc-700"
              style={{
                left: `${centerLines.x}%`,
                top: 0,
                bottom: 0,
              }}
            />
            <div
              className="absolute h-px bg-zinc-700"
              style={{
                top: `${centerLines.y}%`,
                left: 0,
                right: 0,
              }}
            />

            {/* Quadrant labels - smaller on mobile */}
            <div
              className={cn(
                'absolute text-[10px] sm:text-xs pointer-events-none hidden sm:block',
                scenario.quadrants.eliteCorner === 'topLeft' ? 'text-emerald-600 font-medium' : 'text-zinc-600'
              )}
              style={{ left: '4px', top: '4px' }}
            >
              {scenario.quadrants.topLeft}
            </div>
            <div
              className={cn(
                'absolute text-[10px] sm:text-xs pointer-events-none hidden sm:block',
                scenario.quadrants.eliteCorner === 'topRight' ? 'text-emerald-600 font-medium' : 'text-zinc-600'
              )}
              style={{ right: '4px', top: '4px' }}
            >
              {scenario.quadrants.topRight}
            </div>
            <div
              className={cn(
                'absolute text-[10px] sm:text-xs pointer-events-none hidden sm:block',
                scenario.quadrants.eliteCorner === 'bottomLeft' ? 'text-emerald-600 font-medium' : 'text-zinc-600'
              )}
              style={{ left: '4px', bottom: '4px' }}
            >
              {scenario.quadrants.bottomLeft}
            </div>
            <div
              className={cn(
                'absolute text-[10px] sm:text-xs pointer-events-none hidden sm:block',
                scenario.quadrants.eliteCorner === 'bottomRight' ? 'text-emerald-600 font-medium' : 'text-zinc-600'
              )}
              style={{ right: '4px', bottom: '4px' }}
            >
              {scenario.quadrants.bottomRight}
            </div>

            {/* Team logos */}
            {validTeams.map((team) => {
              const pos = getPosition(team)
              const isSelected = team.team_id === selectedTeamId

              return (
                <div
                  key={team.team_id}
                  className={cn(
                    'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
                    'flex items-center justify-center',
                    isSelected ? 'z-20' : 'z-10 hover:z-20'
                  )}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                  title={getTooltip(team)}
                >
                  {/* Team logo */}
                  <div
                    className={cn(
                      'rounded-full bg-zinc-800 transition-all duration-200 overflow-hidden',
                      isSelected
                        ? 'w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-white/50'
                        : 'w-6 h-6 sm:w-8 sm:h-8 opacity-80 hover:opacity-100 hover:w-8 hover:h-8 sm:hover:w-10 sm:hover:h-10'
                    )}
                  >
                    <img
                      src={`https://cdn.nba.com/logos/nba/${team.team_id}/primary/L/logo.svg`}
                      alt={team.abbreviation}
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Y-axis bottom value - hidden on mobile */}
          <div className="hidden sm:flex justify-between mt-1">
            <span className="text-[10px] sm:text-xs text-zinc-600 font-mono">
              {scenario.yAxis.inverted ? stats.minY.toFixed(0) : stats.maxY.toFixed(0)}
            </span>
          </div>

          {/* X-axis label - hidden on mobile */}
          <div className="hidden sm:flex justify-between items-center mt-2">
            <span className="text-[10px] sm:text-xs text-zinc-600 font-mono">
              {stats.minX.toFixed(0)}
            </span>
            <span className="text-[10px] sm:text-xs text-zinc-500">
              ← {scenario.xAxis.labelLow} | {scenario.xAxis.labelHigh} →
            </span>
            <span className="text-[10px] sm:text-xs text-zinc-600 font-mono">
              {stats.maxX.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Legend - hidden on mobile, 4 cols desktop */}
      <div className="hidden sm:grid mt-6 pt-4 border-t border-zinc-800 md:grid-cols-4 grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded shrink-0',
            scenario.quadrants.eliteCorner === 'bottomRight'
              ? 'bg-green-900/30 border border-green-800/50'
              : 'bg-zinc-800/30 border border-zinc-700/50'
          )} />
          <span className="text-zinc-500 text-xs md:text-sm truncate">{scenario.quadrants.bottomRight}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded shrink-0',
            scenario.quadrants.eliteCorner === 'topRight'
              ? 'bg-green-900/30 border border-green-800/50'
              : 'bg-yellow-900/30 border border-yellow-800/50'
          )} />
          <span className="text-zinc-500 text-xs md:text-sm truncate">{scenario.quadrants.topRight}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded shrink-0',
            scenario.quadrants.eliteCorner === 'bottomLeft'
              ? 'bg-green-900/30 border border-green-800/50'
              : 'bg-blue-900/30 border border-blue-800/50'
          )} />
          <span className="text-zinc-500 text-xs md:text-sm truncate">{scenario.quadrants.bottomLeft}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded shrink-0',
            scenario.quadrants.eliteCorner === 'topLeft'
              ? 'bg-green-900/30 border border-green-800/50'
              : 'bg-red-900/30 border border-red-800/50'
          )} />
          <span className="text-zinc-500 text-xs md:text-sm truncate">{scenario.quadrants.topLeft}</span>
        </div>
      </div>
    </div>
  )
}
