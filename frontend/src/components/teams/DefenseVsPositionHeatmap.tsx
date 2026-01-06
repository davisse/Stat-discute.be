'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * DefenseVsPositionHeatmap Component
 *
 * Displays a heatmap matrix showing how each NBA team defends against each position.
 * - Rows: 30 NBA teams (sorted by abbreviation or can be sorted by position performance)
 * - Columns: 5 positions (PG, SG, SF, PF, C)
 * - Cells: Points allowed per game with color coding by rank
 * - Color scale: Red (rank 1-5, best defense) → Orange → Gray → Green → Blue (rank 26-30, worst)
 */

interface DvPHeatmapCell {
  team_id: number
  team_abbreviation: string
  position: string
  points_allowed_per_game: number
  points_allowed_rank: number
  fg_pct_allowed: number
  league_avg: number
  diff_from_avg: number
}

interface DvPHeatmapData {
  cells: DvPHeatmapCell[]
  league_averages: { position: string; avg_points: number }[]
  positions: string[]
}

// Position display names and order
const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const
const POSITION_LABELS: Record<string, string> = {
  PG: 'Point Guard',
  SG: 'Shooting Guard',
  SF: 'Small Forward',
  PF: 'Power Forward',
  C: 'Center',
}

// Color scale based on rank (1 = best defense, 30 = worst)
function getRankColor(rank: number): string {
  // 1-6: Dark red/maroon (excellent)
  if (rank <= 6) return 'bg-red-900/90 text-red-100'
  // 7-12: Red/orange (good)
  if (rank <= 12) return 'bg-orange-700/80 text-orange-100'
  // 13-18: Gray/neutral (average)
  if (rank <= 18) return 'bg-zinc-600/70 text-zinc-200'
  // 19-24: Green (below average)
  if (rank <= 24) return 'bg-emerald-700/70 text-emerald-100'
  // 25-30: Blue/cyan (poor defense = easy matchup)
  return 'bg-cyan-700/80 text-cyan-100'
}

// Get border color for rank indicator
function getRankBorderColor(rank: number): string {
  if (rank <= 6) return 'border-red-500'
  if (rank <= 12) return 'border-orange-500'
  if (rank <= 18) return 'border-zinc-500'
  if (rank <= 24) return 'border-emerald-500'
  return 'border-cyan-500'
}

type SortMode = 'alpha' | 'PG' | 'SG' | 'SF' | 'PF' | 'C'

export interface DefenseVsPositionHeatmapProps {
  selectedTeamId?: number
  className?: string
}

export function DefenseVsPositionHeatmap({
  selectedTeamId,
  className,
}: DefenseVsPositionHeatmapProps) {
  const [data, setData] = React.useState<DvPHeatmapData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [sortMode, setSortMode] = React.useState<SortMode>('alpha')
  const [hoveredCell, setHoveredCell] = React.useState<{ teamId: number; position: string } | null>(null)

  // Fetch data on mount
  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/teams/dvp')
        if (!res.ok) throw new Error('Failed to fetch DvP data')
        const dvpData = await res.json()
        setData(dvpData)
      } catch (err) {
        console.error('Error fetching DvP data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Organize data by team
  const teamData = React.useMemo(() => {
    if (!data?.cells) return []

    // Group cells by team
    const teamsMap = new Map<number, { team_id: number; abbreviation: string; cells: Map<string, DvPHeatmapCell> }>()

    for (const cell of data.cells) {
      if (!teamsMap.has(cell.team_id)) {
        teamsMap.set(cell.team_id, {
          team_id: cell.team_id,
          abbreviation: cell.team_abbreviation,
          cells: new Map(),
        })
      }
      teamsMap.get(cell.team_id)!.cells.set(cell.position, cell)
    }

    // Convert to array and sort
    let teams = Array.from(teamsMap.values())

    if (sortMode === 'alpha') {
      teams.sort((a, b) => a.abbreviation.localeCompare(b.abbreviation))
    } else {
      // Sort by position rank (ascending = best defense first)
      teams.sort((a, b) => {
        const aCell = a.cells.get(sortMode)
        const bCell = b.cells.get(sortMode)
        if (!aCell && !bCell) return 0
        if (!aCell) return 1
        if (!bCell) return -1
        return aCell.points_allowed_rank - bCell.points_allowed_rank
      })
    }

    return teams
  }, [data, sortMode])

  // League averages by position
  const leagueAvgMap = React.useMemo(() => {
    if (!data?.league_averages) return new Map<string, number>()
    return new Map(data.league_averages.map(la => [la.position, la.avg_points]))
  }, [data])

  if (isLoading) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-lg p-6', className)}>
        <div className="flex items-center justify-center gap-3 text-zinc-500">
          <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
          <span>Loading Defense vs Position data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-lg p-6', className)}>
        <p className="text-red-400 text-center">{error}</p>
      </div>
    )
  }

  if (!data || teamData.length === 0) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-lg p-6', className)}>
        <p className="text-zinc-500 text-center">No Defense vs Position data available</p>
      </div>
    )
  }

  return (
    <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 sm:p-6', className)}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          DEFENSE VS POSITION
        </h2>
        <p className="text-zinc-500 text-xs sm:text-sm tracking-[0.2em] uppercase mt-1">
          Points Allowed by Position
        </p>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-red-900/90" />
          <span className="text-zinc-400">Elite (1-6)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-orange-700/80" />
          <span className="text-zinc-400">Good (7-12)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-zinc-600/70" />
          <span className="text-zinc-400">Average (13-18)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-700/70" />
          <span className="text-zinc-400">Below Avg (19-24)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-cyan-700/80" />
          <span className="text-zinc-400">Weak (25-30)</span>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-zinc-500 uppercase tracking-wider mr-2">Sort by:</span>
        <div className="inline-flex bg-zinc-800/50 rounded-full p-0.5">
          <button
            onClick={() => setSortMode('alpha')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full transition-all',
              sortMode === 'alpha'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
            )}
          >
            A-Z
          </button>
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setSortMode(pos)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-all',
                sortMode === pos
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
              )}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse">
          {/* Header Row */}
          <thead>
            <tr>
              <th className="sticky left-0 bg-zinc-900 z-10 p-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-700">
                Team
              </th>
              {POSITIONS.map((pos) => (
                <th
                  key={pos}
                  className="p-2 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider border-b border-zinc-700"
                  title={POSITION_LABELS[pos]}
                >
                  <div>{pos}</div>
                  <div className="text-[10px] text-zinc-600 font-normal">
                    Avg: {(leagueAvgMap.get(pos) ?? 0).toFixed(1)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Data Rows */}
          <tbody>
            {teamData.map((team) => {
              const isSelected = team.team_id === selectedTeamId
              return (
                <tr
                  key={team.team_id}
                  className={cn(
                    'transition-colors',
                    isSelected ? 'bg-white/5' : 'hover:bg-zinc-800/30'
                  )}
                >
                  {/* Team Name */}
                  <td className={cn(
                    'sticky left-0 z-10 p-2 border-b border-zinc-800',
                    isSelected ? 'bg-zinc-800' : 'bg-zinc-900'
                  )}>
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://cdn.nba.com/logos/nba/${team.team_id}/primary/L/logo.svg`}
                        alt={team.abbreviation}
                        className="w-6 h-6 object-contain"
                      />
                      <span className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-white' : 'text-zinc-300'
                      )}>
                        {team.abbreviation}
                      </span>
                    </div>
                  </td>

                  {/* Position Cells */}
                  {POSITIONS.map((pos) => {
                    const cell = team.cells.get(pos)
                    if (!cell) {
                      return (
                        <td key={pos} className="p-1 border-b border-zinc-800 text-center">
                          <div className="text-zinc-600 text-xs">-</div>
                        </td>
                      )
                    }

                    const isHovered = hoveredCell?.teamId === team.team_id && hoveredCell?.position === pos
                    const diffFromAvg = cell.diff_from_avg

                    return (
                      <td
                        key={pos}
                        className="p-1 border-b border-zinc-800"
                        onMouseEnter={() => setHoveredCell({ teamId: team.team_id, position: pos })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div
                          className={cn(
                            'relative rounded px-2 py-2 text-center transition-all cursor-default',
                            getRankColor(cell.points_allowed_rank),
                            isHovered && 'ring-2 ring-white/50 scale-105'
                          )}
                        >
                          {/* Main PPG value */}
                          <div className="text-sm font-bold">
                            {cell.points_allowed_per_game.toFixed(1)}
                          </div>
                          {/* Rank badge */}
                          <div className={cn(
                            'absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border',
                            'bg-zinc-900',
                            getRankBorderColor(cell.points_allowed_rank)
                          )}>
                            {cell.points_allowed_rank}
                          </div>
                          {/* Diff from average (shown on hover) */}
                          {isHovered && (
                            <div className={cn(
                              'absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono whitespace-nowrap',
                              diffFromAvg < 0 ? 'text-red-400' : diffFromAvg > 0 ? 'text-cyan-400' : 'text-zinc-400'
                            )}>
                              {diffFromAvg > 0 ? '+' : ''}{diffFromAvg.toFixed(1)} vs avg
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-600">
          Lower points allowed = better defense. Rank #1 = allows fewest points at position.
        </p>
      </div>
    </div>
  )
}
