'use client'

import { useMemo } from 'react'
import { cn, safeNum } from '@/lib/utils'

/**
 * TeamPPGRankingChart Component
 *
 * Horizontal bar chart displaying 30 NBA teams ranked by Points Per Game.
 * Highest PPG team at top (#1), lowest at bottom (#30).
 * Bars grow from right to left (longest bar = most points).
 *
 * Features:
 * - Static display (no hover, tooltip, or click navigation)
 * - Selected team highlighted with white solid bar
 * - Other teams displayed with zinc-600 bars
 * - Proportional bar widths based on PPG values
 *
 * @param data - Array of team ranking data
 * @param selectedTeamId - ID of selected team for highlighting
 * @param className - Additional CSS classes
 */

export interface TeamRankingData {
  team_id: number
  abbreviation: string
  ppg: number
  opp_ppg: number
}

export interface TeamPPGRankingChartProps {
  data: TeamRankingData[]
  selectedTeamId?: number
  className?: string
}

export function TeamPPGRankingChart({
  data,
  selectedTeamId,
  className
}: TeamPPGRankingChartProps) {
  // Sort teams by PPG descending (highest first)
  const sortedTeams = useMemo(() => {
    return [...data].sort((a, b) => safeNum(b.ppg) - safeNum(a.ppg))
  }, [data])

  // Calculate max PPG for proportional bar widths
  const maxPPG = useMemo(() => {
    if (sortedTeams.length === 0) return 100
    return Math.max(...sortedTeams.map(t => safeNum(t.ppg)))
  }, [sortedTeams])

  // Calculate bar width as percentage
  const getBarWidth = (ppg: number): number => {
    return (ppg / maxPPG) * 100
  }

  if (data.length === 0) {
    return (
      <div className={cn('', className)}>
        <p className="text-zinc-500 text-sm text-center">No team data available</p>
      </div>
    )
  }

  return (
    <div className={cn('', className)}>
      {/* Team Rows */}
      <div className="flex flex-col gap-0.5">
        {sortedTeams.map((team, index) => {
          const rank = index + 1
          const isSelected = team.team_id === selectedTeamId
          const ppgValue = safeNum(team.ppg)
          const barWidth = getBarWidth(ppgValue)

          return (
            <div
              key={team.team_id}
              className="flex items-center gap-2 h-6"
            >
              {/* Rank */}
              <span className="text-zinc-500 text-xs font-mono w-6 text-right shrink-0">
                #{rank}
              </span>

              {/* Team Abbreviation */}
              <span className={cn(
                'text-xs font-medium w-8 shrink-0',
                isSelected ? 'text-white' : 'text-zinc-500'
              )}>
                {team.abbreviation}
              </span>

              {/* Bar Container */}
              <div className="flex-1 h-4 relative">
                {/* Bar */}
                <div
                  className={cn(
                    'h-full rounded-sm transition-all duration-200',
                    isSelected ? 'bg-white' : 'bg-zinc-600'
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* PPG Value */}
              <span className={cn(
                'text-xs font-mono w-12 text-right shrink-0',
                isSelected ? 'text-white font-medium' : 'text-zinc-500'
              )}>
                {ppgValue.toFixed(1)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
