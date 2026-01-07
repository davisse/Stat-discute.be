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
 * Features:
 * - Conference/Division filtering (keeps all logos visible, dims non-matching)
 * - Mobile-first responsive design with collapsible filters
 * - Touch-friendly pill selector
 */

// Conference and Division mapping for all 30 NBA teams
type Conference = 'Eastern' | 'Western'
type Division = 'Atlantic' | 'Central' | 'Southeast' | 'Northwest' | 'Pacific' | 'Southwest'

interface TeamClassification {
  conference: Conference
  division: Division
}

const TEAM_CLASSIFICATIONS: Record<string, TeamClassification> = {
  // Eastern Conference - Atlantic
  BOS: { conference: 'Eastern', division: 'Atlantic' },
  BKN: { conference: 'Eastern', division: 'Atlantic' },
  NYK: { conference: 'Eastern', division: 'Atlantic' },
  PHI: { conference: 'Eastern', division: 'Atlantic' },
  TOR: { conference: 'Eastern', division: 'Atlantic' },
  // Eastern Conference - Central
  CHI: { conference: 'Eastern', division: 'Central' },
  CLE: { conference: 'Eastern', division: 'Central' },
  DET: { conference: 'Eastern', division: 'Central' },
  IND: { conference: 'Eastern', division: 'Central' },
  MIL: { conference: 'Eastern', division: 'Central' },
  // Eastern Conference - Southeast
  ATL: { conference: 'Eastern', division: 'Southeast' },
  CHA: { conference: 'Eastern', division: 'Southeast' },
  MIA: { conference: 'Eastern', division: 'Southeast' },
  ORL: { conference: 'Eastern', division: 'Southeast' },
  WAS: { conference: 'Eastern', division: 'Southeast' },
  // Western Conference - Northwest
  DEN: { conference: 'Western', division: 'Northwest' },
  MIN: { conference: 'Western', division: 'Northwest' },
  OKC: { conference: 'Western', division: 'Northwest' },
  POR: { conference: 'Western', division: 'Northwest' },
  UTA: { conference: 'Western', division: 'Northwest' },
  // Western Conference - Pacific
  GSW: { conference: 'Western', division: 'Pacific' },
  LAC: { conference: 'Western', division: 'Pacific' },
  LAL: { conference: 'Western', division: 'Pacific' },
  PHX: { conference: 'Western', division: 'Pacific' },
  SAC: { conference: 'Western', division: 'Pacific' },
  // Western Conference - Southwest
  DAL: { conference: 'Western', division: 'Southwest' },
  HOU: { conference: 'Western', division: 'Southwest' },
  MEM: { conference: 'Western', division: 'Southwest' },
  NOP: { conference: 'Western', division: 'Southwest' },
  SAS: { conference: 'Western', division: 'Southwest' },
}

const DIVISIONS_BY_CONFERENCE: Record<Conference, Division[]> = {
  Eastern: ['Atlantic', 'Central', 'Southeast'],
  Western: ['Northwest', 'Pacific', 'Southwest'],
}

const DIVISION_ABBREVS: Record<Division, string> = {
  Atlantic: 'ATL',
  Central: 'CEN',
  Southeast: 'SE',
  Northwest: 'NW',
  Pacific: 'PAC',
  Southwest: 'SW',
}

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

// Quadrant type for team position
type QuadrantPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

// Scenario configuration type
interface QuadrantScenario {
  id: string
  label: string
  title: string
  description: {
    axes: string
    zones: string
  }
  // Dynamic insights based on quadrant position
  insights: Record<QuadrantPosition, (teamAbbr: string, rank: { x: number; y: number }) => string>
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
    eliteCorner: QuadrantPosition
  }
}

// Scenario configurations
const SCENARIOS: QuadrantScenario[] = [
  {
    id: 'score',
    label: 'Pts',
    title: 'Offense vs Defense',
    description: {
      axes: 'X: Points Per Game (offensive output) | Y: Opponent PPG (defensive efficiency)',
      zones: 'Bottom-right = elite (high scoring + strong defense). Top-left = struggling both ends.',
    },
    insights: {
      topLeft: (abbr, r) => `${abbr} struggles on both ends: #${r.x} in scoring, #${r.y} in defense. Needs improvement across the board.`,
      topRight: (abbr, r) => `${abbr} is offense-first: #${r.x} in scoring but #${r.y} in defense. Can outscore opponents but vulnerable.`,
      bottomLeft: (abbr, r) => `${abbr} is defense-first: #${r.y} in defense but only #${r.x} in scoring. Wins ugly, grinds it out.`,
      bottomRight: (abbr, r) => `${abbr} is elite: #${r.x} in scoring AND #${r.y} in defense. True contender profile.`,
    },
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
    description: {
      axes: 'X: Pace (possessions per 48 min) | Y: Net Rating (point differential per 100 poss)',
      zones: 'Top-right = fast winners. Bottom-left = slow losers. Style vs results.',
    },
    insights: {
      topLeft: (abbr, r) => `${abbr} wins grinding: #${r.y} net rating with #${r.x} pace. Methodical, controls tempo.`,
      topRight: (abbr, r) => `${abbr} is the ideal: #${r.x} pace AND #${r.y} net rating. Fast and dominant.`,
      bottomLeft: (abbr, r) => `${abbr} is slow and losing: #${r.x} pace with #${r.y} net rating. Needs to find identity.`,
      bottomRight: (abbr, r) => `${abbr} runs but loses: #${r.x} pace but #${r.y} net rating. Fast tempo not translating to wins.`,
    },
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
    title: 'Offensive vs Defensive Efficiency',
    description: {
      axes: 'X: ORTG (points per 100 poss) | Y: DRTG (opp points per 100 poss)',
      zones: 'Bottom-right = elite efficiency both ends. Pace-adjusted truth.',
    },
    insights: {
      topLeft: (abbr, r) => `${abbr} is inefficient everywhere: #${r.x} ORTG, #${r.y} DRTG. Fundamental issues.`,
      topRight: (abbr, r) => `${abbr} scores efficiently (#${r.x} ORTG) but leaks points (#${r.y} DRTG). Offensive focus.`,
      bottomLeft: (abbr, r) => `${abbr} defends well (#${r.y} DRTG) but struggles to score (#${r.x} ORTG). Defensive identity.`,
      bottomRight: (abbr, r) => `${abbr} is two-way elite: #${r.x} ORTG AND #${r.y} DRTG. Championship caliber.`,
    },
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
    description: {
      axes: 'X: Game Total Avg (combined team+opp score) | Y: Std Deviation (volatility)',
      zones: 'Bottom-right = high scoring + predictable. Key for O/U betting.',
    },
    insights: {
      topLeft: (abbr, r) => `${abbr} is low and volatile: #${r.x} avg total, #${r.y} consistency. Hard to predict, tends under.`,
      topRight: (abbr, r) => `${abbr} is high but wild: #${r.x} avg total, #${r.y} consistency. Overs likely but risky.`,
      bottomLeft: (abbr, r) => `${abbr} is low but stable: #${r.x} avg total, #${r.y} consistency. Reliable unders.`,
      bottomRight: (abbr, r) => `${abbr} is the bettor's dream: #${r.x} avg total AND #${r.y} consistency. Predictable high-scoring games.`,
    },
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

  // Filter states
  const [activeConference, setActiveConference] = React.useState<'all' | Conference>('all')
  const [activeDivision, setActiveDivision] = React.useState<'all' | Division>('all')
  const [filtersExpanded, setFiltersExpanded] = React.useState(false)

  // Get available divisions based on selected conference
  const availableDivisions = React.useMemo(() => {
    if (activeConference === 'all') {
      return [...DIVISIONS_BY_CONFERENCE.Eastern, ...DIVISIONS_BY_CONFERENCE.Western]
    }
    return DIVISIONS_BY_CONFERENCE[activeConference]
  }, [activeConference])

  // Reset division when conference changes and current division is not in new conference
  React.useEffect(() => {
    if (activeDivision !== 'all' && !availableDivisions.includes(activeDivision)) {
      setActiveDivision('all')
    }
  }, [activeConference, activeDivision, availableDivisions])

  // Check if a team matches current filters
  const teamMatchesFilter = React.useCallback(
    (team: TeamQuadrantData) => {
      const classification = TEAM_CLASSIFICATIONS[team.abbreviation]
      if (!classification) return true // Unknown teams always show

      if (activeConference !== 'all' && classification.conference !== activeConference) {
        return false
      }
      if (activeDivision !== 'all' && classification.division !== activeDivision) {
        return false
      }
      return true
    },
    [activeConference, activeDivision]
  )

  // Count teams matching current filter
  const filterStats = React.useMemo(() => {
    const matching = data.filter(teamMatchesFilter)
    return {
      matchingCount: matching.length,
      totalCount: data.length,
      isFiltered: activeConference !== 'all' || activeDivision !== 'all',
    }
  }, [data, teamMatchesFilter, activeConference, activeDivision])

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

      // Y position - CSS top:0% is at TOP, top:100% is at BOTTOM
      // We always want: labelHigh at visual TOP, labelLow at visual BOTTOM
      // Without flip: high value → high% → top:high% → BOTTOM (wrong)
      // With flip: high value → high% → flip → low% → top:low% → TOP (correct)
      let y = ((yVal - stats.minY) / (stats.maxY - stats.minY)) * 100
      y = 100 - y // Always flip: high values → TOP, low values → BOTTOM

      return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
    },
    [stats, scenario]
  )

  // Get quadrant center lines position
  const centerLines = React.useMemo(() => {
    const avgX = ((stats.avgX - stats.minX) / (stats.maxX - stats.minX)) * 100
    let avgY = ((stats.avgY - stats.minY) / (stats.maxY - stats.minY)) * 100
    avgY = 100 - avgY // Same flip as getPosition for consistency
    return { x: avgX, y: avgY }
  }, [stats, scenario])

  // Get selected team's quadrant and rankings
  const selectedTeamInfo = React.useMemo(() => {
    if (!selectedTeamId) return null

    const selectedTeam = data.find((t) => t.team_id === selectedTeamId)
    if (!selectedTeam) return null

    const xKey = scenario.xAxis.key
    const yKey = scenario.yAxis.key
    const xVal = selectedTeam[xKey]
    const yVal = selectedTeam[yKey]

    if (xVal === undefined || xVal === null || yVal === undefined || yVal === null) {
      return null
    }

    // Determine data set for rankings (filtered or all teams)
    const rankingDataSet = filterStats.isFiltered
      ? data.filter(teamMatchesFilter)
      : data

    // Calculate rankings (1 = best) within the current data set
    // For X: higher is usually better (ppg, pace, ortg, total_avg)
    const xSorted = [...rankingDataSet]
      .filter((t) => t[xKey] !== undefined && t[xKey] !== null)
      .sort((a, b) => safeNum(b[xKey] as number) - safeNum(a[xKey] as number))
    const xRank = xSorted.findIndex((t) => t.team_id === selectedTeamId) + 1

    // For Y: depends on scenario (lower opp_ppg/drtg/std_dev is better, higher net_rtg is better)
    const yHigherIsBetter = !scenario.yAxis.inverted
    const ySorted = [...rankingDataSet]
      .filter((t) => t[yKey] !== undefined && t[yKey] !== null)
      .sort((a, b) => {
        const diff = safeNum(b[yKey] as number) - safeNum(a[yKey] as number)
        return yHigherIsBetter ? diff : -diff
      })
    const yRank = ySorted.findIndex((t) => t.team_id === selectedTeamId) + 1

    // Determine quadrant based on comparison to average
    const aboveAvgX = safeNum(xVal as number) > stats.avgX
    const aboveAvgY = safeNum(yVal as number) > stats.avgY

    let quadrant: QuadrantPosition
    if (scenario.yAxis.inverted) {
      // Inverted Y (opp_ppg, drtg, std_dev) - high values at TOP
      quadrant = aboveAvgY
        ? (aboveAvgX ? 'topRight' : 'topLeft')
        : (aboveAvgX ? 'bottomRight' : 'bottomLeft')
    } else {
      // Non-inverted Y (net_rtg) - high values at TOP (after visual flip)
      quadrant = aboveAvgY
        ? (aboveAvgX ? 'topRight' : 'topLeft')
        : (aboveAvgX ? 'bottomRight' : 'bottomLeft')
    }

    // Build filter context label
    let filterContext = ''
    if (filterStats.isFiltered) {
      if (activeDivision !== 'all') {
        filterContext = ` in ${activeDivision}`
      } else if (activeConference !== 'all') {
        filterContext = ` in ${activeConference} Conference`
      }
    }

    // Check if selected team is in the filtered set
    const selectedTeamInFilter = teamMatchesFilter(selectedTeam)

    return {
      team: selectedTeam,
      quadrant,
      xRank: selectedTeamInFilter ? xRank : 0,
      yRank: selectedTeamInFilter ? yRank : 0,
      totalInSet: rankingDataSet.length,
      insight: selectedTeamInFilter
        ? scenario.insights[quadrant](selectedTeam.abbreviation, { x: xRank, y: yRank })
        : `${selectedTeam.abbreviation} is not in the current filter selection.`,
      filterContext,
      isInFilter: selectedTeamInFilter,
    }
  }, [data, selectedTeamId, scenario, stats, filterStats.isFiltered, teamMatchesFilter, activeConference, activeDivision])

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
      {/* Cinematic Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          QUADRANT
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base tracking-[0.2em] uppercase mt-2">
          Analyse des Équipes
        </p>
      </div>

      {/* Pill Tabs - Scenario Selector */}
      <div className="flex justify-center mb-3 sm:mb-4">
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

      {/* Filter Bar - Collapsible on mobile */}
      <div className="mb-3 sm:mb-4 px-1">
        {/* Mobile: Collapsible header */}
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="sm:hidden w-full flex items-center justify-between py-2 px-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-zinc-400 text-sm">
              Filters
              {filterStats.isFiltered && (
                <span className="ml-2 text-white">
                  ({filterStats.matchingCount}/{filterStats.totalCount})
                </span>
              )}
            </span>
          </div>
          <svg
            className={cn(
              'w-4 h-4 text-zinc-500 transition-transform',
              filtersExpanded && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Filter content - always visible on desktop, collapsible on mobile */}
        <div className={cn(
          'sm:block',
          filtersExpanded ? 'block mt-2' : 'hidden'
        )}>
          <div className="p-3 sm:p-0 bg-zinc-800/30 sm:bg-transparent rounded-lg sm:rounded-none border border-zinc-700/50 sm:border-0">
            {/* Conference Filter */}
            <div className="mb-3 sm:mb-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500">Conference</span>
                {filterStats.isFiltered && (
                  <button
                    onClick={() => {
                      setActiveConference('all')
                      setActiveDivision('all')
                    }}
                    className="text-[10px] text-zinc-500 hover:text-white underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {(['all', 'Eastern', 'Western'] as const).map((conf) => (
                  <button
                    key={conf}
                    onClick={() => setActiveConference(conf)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-full transition-all min-w-[44px]',
                      activeConference === conf
                        ? 'bg-white text-black'
                        : 'bg-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-600/50'
                    )}
                  >
                    {conf === 'all' ? 'All' : conf === 'Eastern' ? 'East' : 'West'}
                  </button>
                ))}
              </div>
            </div>

            {/* Division Filter */}
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 block mb-2">Division</span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => setActiveDivision('all')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-full transition-all min-w-[44px]',
                    activeDivision === 'all'
                      ? 'bg-white text-black'
                      : 'bg-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-600/50'
                  )}
                >
                  All
                </button>
                {availableDivisions.map((div) => (
                  <button
                    key={div}
                    onClick={() => setActiveDivision(div)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-full transition-all min-w-[44px]',
                      activeDivision === div
                        ? 'bg-white text-black'
                        : 'bg-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-600/50'
                    )}
                  >
                    {DIVISION_ABBREVS[div]}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter stats on desktop */}
            {filterStats.isFiltered && (
              <div className="hidden sm:block mt-2 text-[10px] text-zinc-500">
                Showing {filterStats.matchingCount} of {filterStats.totalCount} teams
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Description */}
      <div className="mb-3 sm:mb-4 px-1">
        <h3 className="text-white text-sm sm:text-base font-medium mb-1 text-center">
          {scenario.title}
        </h3>
        <p className="text-zinc-500 text-[10px] sm:text-xs mb-1 text-center leading-relaxed">
          {scenario.description.axes}
        </p>
        <p className="text-zinc-400 text-[10px] sm:text-xs text-center">
          {scenario.description.zones}
        </p>
      </div>

      {/* Dynamic Team Insight */}
      {selectedTeamInfo && (
        <div className={cn(
          'mb-3 sm:mb-4 px-2 py-2 rounded-lg border',
          selectedTeamInfo.isInFilter
            ? 'bg-zinc-800/30 border-zinc-700/50'
            : 'bg-amber-900/20 border-amber-700/30'
        )}>
          {/* Filter context badge */}
          {filterStats.isFiltered && selectedTeamInfo.isInFilter && (
            <div className="flex justify-center mb-1">
              <span className="text-[10px] px-2 py-0.5 bg-zinc-700/50 rounded-full text-zinc-400">
                Ranking{selectedTeamInfo.filterContext} ({selectedTeamInfo.totalInSet} teams)
              </span>
            </div>
          )}
          <p className={cn(
            'text-xs sm:text-sm text-center leading-relaxed',
            selectedTeamInfo.isInFilter ? 'text-white' : 'text-amber-200/80'
          )}>
            {selectedTeamInfo.insight}
          </p>
        </div>
      )}

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
            {/* Mobile axis edge labels - compact indicators at chart edges */}
            <div className="sm:hidden">
              {/* Top edge - Y high label */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30">
                <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800/90 rounded text-zinc-400 whitespace-nowrap">
                  ↑ {scenario.yAxis.labelHigh}
                </span>
              </div>
              {/* Bottom edge - Y low label */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-30">
                <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800/90 rounded text-zinc-400 whitespace-nowrap">
                  ↓ {scenario.yAxis.labelLow}
                </span>
              </div>
              {/* Left edge - X low label */}
              <div className="absolute left-1 top-1/2 -translate-y-1/2 z-30">
                <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800/90 rounded text-zinc-400 whitespace-nowrap">
                  ← {scenario.xAxis.labelLow.split(' ')[0]}
                </span>
              </div>
              {/* Right edge - X high label */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 z-30">
                <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800/90 rounded text-zinc-400 whitespace-nowrap">
                  {scenario.xAxis.labelHigh.split(' ')[0]} →
                </span>
              </div>
            </div>

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

            {/* Quadrant labels - visible on all sizes, compact on mobile */}
            <div
              className={cn(
                'absolute text-[8px] sm:text-xs pointer-events-none',
                scenario.quadrants.eliteCorner === 'topLeft' ? 'text-emerald-500 font-medium' : 'text-zinc-600'
              )}
              style={{ left: '4px', top: '20px' }}
            >
{scenario.quadrants.topLeft}
            </div>
            <div
              className={cn(
                'absolute text-[8px] sm:text-xs pointer-events-none',
                scenario.quadrants.eliteCorner === 'topRight' ? 'text-emerald-500 font-medium' : 'text-zinc-600'
              )}
              style={{ right: '4px', top: '20px' }}
            >
{scenario.quadrants.topRight}
            </div>
            <div
              className={cn(
                'absolute text-[8px] sm:text-xs pointer-events-none',
                scenario.quadrants.eliteCorner === 'bottomLeft' ? 'text-emerald-500 font-medium' : 'text-zinc-600'
              )}
              style={{ left: '4px', bottom: '20px' }}
            >
{scenario.quadrants.bottomLeft}
            </div>
            <div
              className={cn(
                'absolute text-[8px] sm:text-xs pointer-events-none',
                scenario.quadrants.eliteCorner === 'bottomRight' ? 'text-emerald-500 font-medium' : 'text-zinc-600'
              )}
              style={{ right: '4px', bottom: '20px' }}
            >
{scenario.quadrants.bottomRight}
            </div>

            {/* Team logos */}
            {validTeams.map((team) => {
              const pos = getPosition(team)
              const isSelected = team.team_id === selectedTeamId
              const matchesFilter = teamMatchesFilter(team)
              const isDimmed = filterStats.isFiltered && !matchesFilter

              return (
                <div
                  key={team.team_id}
                  className={cn(
                    'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
                    'flex items-center justify-center',
                    isSelected ? 'z-20' : isDimmed ? 'z-5' : 'z-10 hover:z-20'
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
                      'rounded-full bg-zinc-800 transition-all duration-300 overflow-hidden',
                      isSelected
                        ? 'w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-white/50'
                        : isDimmed
                          ? 'w-4 h-4 sm:w-5 sm:h-5 opacity-25 grayscale hover:opacity-50 hover:grayscale-0'
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

    </div>
  )
}
