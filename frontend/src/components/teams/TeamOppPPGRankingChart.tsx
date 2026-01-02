'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * TeamOppPPGRankingChart Component
 *
 * Horizontal bar chart showing 30 NBA teams ranked by OPP PPG (defense).
 * Best defense (lowest OPP PPG) at top (#1), worst defense at bottom (#30).
 *
 * CRITICAL: Bar length represents the actual OPP PPG VALUE:
 * - Best defense = SHORT bar (low OPP PPG like 102.1)
 * - Worst defense = LONG bar (high OPP PPG like 123.3)
 *
 * Features:
 * - Horizontal bars growing from left to right
 * - Selected team highlighted with white bar
 * - Other teams in zinc-600
 * - Clean, production-ready design
 */

export interface TeamRankingData {
  team_id: number
  abbreviation: string
  ppg: number
  opp_ppg: number
}

export interface TeamOppPPGRankingChartProps {
  data: TeamRankingData[]
  selectedTeamId?: number
  className?: string
}

export function TeamOppPPGRankingChart({
  data,
  selectedTeamId,
  className,
}: TeamOppPPGRankingChartProps) {
  // Sort by OPP PPG ascending (best defense = lowest OPP PPG first)
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => a.opp_ppg - b.opp_ppg)
  }, [data])

  // Calculate max OPP PPG for bar width calculation
  const maxOppPpg = React.useMemo(() => {
    if (sortedData.length === 0) return 130
    return Math.max(...sortedData.map((team) => team.opp_ppg))
  }, [sortedData])

  if (sortedData.length === 0) {
    return (
      <div
        className={cn(
          'bg-zinc-900/50 border border-zinc-800 rounded-lg p-4',
          className
        )}
      >
        <p className="text-zinc-500 text-sm">No team data available</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-zinc-900/50 border border-zinc-800 rounded-lg p-4',
        className
      )}
    >
      {/* Header */}
      <h3 className="text-white text-sm font-medium mb-4">
        Team OPP PPG Ranking
      </h3>

      <div className="flex flex-col gap-0.5">
        {sortedData.map((team, index) => {
          const rank = index + 1
          const isSelected = team.team_id === selectedTeamId
          const barWidthPercent = (team.opp_ppg / maxOppPpg) * 100

          return (
            <div
              key={team.team_id}
              className="flex items-center h-6 gap-2"
            >
              {/* OPP PPG Value (left) */}
              <span
                className={cn(
                  'text-xs font-mono w-12 text-right shrink-0',
                  isSelected ? 'text-white font-medium' : 'text-zinc-500'
                )}
              >
                {team.opp_ppg.toFixed(1)}
              </span>

              {/* Bar Container - bars grow from right to left */}
              <div className="flex-1 h-4 relative flex justify-end">
                <div
                  className={cn(
                    'h-full rounded-sm transition-all duration-200',
                    isSelected ? 'bg-white' : 'bg-zinc-600'
                  )}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>

              {/* Team Abbreviation */}
              <span
                className={cn(
                  'text-xs font-medium w-8 shrink-0',
                  isSelected ? 'text-white' : 'text-zinc-500'
                )}
              >
                {team.abbreviation}
              </span>

              {/* Rank */}
              <span
                className={cn(
                  'text-xs font-mono w-6 text-right shrink-0',
                  isSelected ? 'text-white' : 'text-zinc-500'
                )}
              >
                #{rank}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
