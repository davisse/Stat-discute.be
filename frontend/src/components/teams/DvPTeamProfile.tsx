'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { DvPRadarChart, type DvPRadarData } from './DvPRadarChart'
import { DvPPositionBars, type DvPBarData } from './DvPPositionBars'

/**
 * DvPTeamProfile - Container component for Defense vs Position visualizations
 *
 * Layout:
 * - Desktop (lg+): Side-by-side (Radar left, Bars right)
 * - Mobile: Stacked (Radar top, Bars bottom)
 *
 * Features:
 * - Fetches DvP data for single team
 * - Transforms data for both child components
 * - Shared title and consistent styling
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

interface DvPApiResponse {
  cells: DvPHeatmapCell[]
  league_averages: { position: string; avg_points: number }[]
  positions: string[]
}

export interface DvPTeamProfileProps {
  teamId: number
  teamAbbreviation: string
  className?: string
}

// Position full names
const POSITION_NAMES: Record<string, string> = {
  PG: 'Point Guard',
  SG: 'Shooting Guard',
  SF: 'Small Forward',
  PF: 'Power Forward',
  C: 'Center',
}

// Get tier from rank
function getTierFromRank(rank: number): 'elite' | 'good' | 'average' | 'below' | 'weak' {
  if (rank <= 6) return 'elite'
  if (rank <= 12) return 'good'
  if (rank <= 18) return 'average'
  if (rank <= 24) return 'below'
  return 'weak'
}

// Transform API data to component format
function transformData(
  cells: DvPHeatmapCell[],
  leagueAverages: { position: string; avg_points: number }[]
): { radar: DvPRadarData[]; bars: DvPBarData[] } {
  const avgMap = new Map(leagueAverages.map(la => [la.position, la.avg_points]))

  const transformed = cells.map(cell => ({
    position: cell.position,
    positionFull: POSITION_NAMES[cell.position] || cell.position,
    pointsAllowed: cell.points_allowed_per_game,
    rank: cell.points_allowed_rank,
    leagueAvg: avgMap.get(cell.position) ?? cell.league_avg,
    diffFromAvg: cell.diff_from_avg,
    tier: getTierFromRank(cell.points_allowed_rank),
  }))

  return {
    radar: transformed,
    bars: transformed,
  }
}

export function DvPTeamProfile({ teamId, teamAbbreviation, className }: DvPTeamProfileProps) {
  const [data, setData] = React.useState<{ radar: DvPRadarData[]; bars: DvPBarData[] } | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch('/api/teams/dvp')
        if (!res.ok) throw new Error('Failed to fetch DvP data')

        const apiData: DvPApiResponse = await res.json()

        // Filter for this team only (use Number() for type-safe comparison)
        const teamCells = apiData.cells.filter(c => Number(c.team_id) === Number(teamId))

        if (teamCells.length === 0) {
          throw new Error('No DvP data available for this team')
        }

        const transformed = transformData(teamCells, apiData.league_averages)
        setData(transformed)
      } catch (err) {
        console.error('Error fetching DvP data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-lg p-6', className)}>
        <div className="flex items-center justify-center gap-3 text-zinc-500 py-12">
          <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
          <span>Loading defensive profile...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-lg p-6', className)}>
        <p className="text-red-400 text-center py-8">{error}</p>
      </div>
    )
  }

  // No data state
  if (!data) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-lg p-6', className)}>
        <p className="text-zinc-500 text-center py-8">No defensive profile data available</p>
      </div>
    )
  }

  return (
    <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-8', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          DEFENSIVE PROFILE
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base tracking-[0.2em] uppercase mt-2">
          Points Allowed by Position
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {/* Left: Radar Chart */}
        <div className="lg:border-r lg:border-zinc-700/50 lg:pr-8">
          <DvPRadarChart
            data={data.radar}
            teamAbbreviation={teamAbbreviation}
          />
        </div>

        {/* Right: Position Bars */}
        <div className="lg:pl-4">
          <DvPPositionBars
            data={data.bars}
            teamAbbreviation={teamAbbreviation}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-5 border-t border-zinc-700/50 text-center">
        <p className="text-xs text-zinc-500">
          Lower rank = better defense at that position. Data based on opponent position scoring.
        </p>
      </div>
    </div>
  )
}
