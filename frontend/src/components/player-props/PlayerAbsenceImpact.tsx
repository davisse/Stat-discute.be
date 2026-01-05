'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { ImpactfulAbsence } from '@/lib/queries'

/**
 * PlayerAbsenceImpact Component
 *
 * Displays a ranked list of impactful player absences affecting team performance.
 * Helps identify key players whose absence significantly affects team results.
 *
 * @param absences - List of impactful absences to display
 * @param variant - Style: 'list' (detailed list) | 'compact' (condensed version)
 * @param onPlayerClick - Callback when clicking on a player
 */

const playerAbsenceImpactVariants = cva('', {
  variants: {
    variant: {
      list: 'space-y-3',
      compact: 'space-y-2',
    },
  },
  defaultVariants: {
    variant: 'list',
  },
})

export interface PlayerAbsenceImpactProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof playerAbsenceImpactVariants> {
  absences: ImpactfulAbsence[]
  variant?: 'list' | 'compact'
  onPlayerClick?: (playerId: number) => void
}

/**
 * Impact badge (positive or negative)
 */
function ImpactBadge({ value, label }: { value: number; label: string }) {
  const isNegative = value < 0
  const isNeutral = value === 0

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'text-xs uppercase tracking-wider mb-1',
          isNeutral ? 'text-gray-500' : 'text-gray-400'
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          'font-mono text-lg font-bold',
          isNegative
            ? 'text-red-400'
            : isNeutral
            ? 'text-gray-500'
            : 'text-green-400'
        )}
      >
        {value > 0 ? '+' : ''}
        {value.toFixed(1)}
      </div>
    </div>
  )
}

/**
 * Absence row (list layout)
 */
function AbsenceListRow({
  absence,
  rank,
  onPlayerClick,
}: {
  absence: ImpactfulAbsence
  rank: number
  onPlayerClick?: (playerId: number) => void
}) {
  return (
    <Card
      variant="default"
      className="hover:bg-gray-900 transition-colors cursor-pointer"
      onClick={() => onPlayerClick?.(absence.absent_player_id)}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Rank + Player Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Rank */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
            <span className="font-mono text-sm text-gray-400 font-semibold">
              {rank}
            </span>
          </div>

          {/* Player Name + Games Missed */}
          <div className="flex-1 min-w-0">
            <div className="text-base text-white font-semibold truncate">
              {absence.absent_player_name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 font-mono">
                {absence.games_missed} games missed
              </span>
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="flex items-center gap-8">
          {/* Team Points Difference */}
          <ImpactBadge value={absence.team_pts_diff} label="Pts Δ" />

          {/* Beneficiaries Count */}
          <div className="flex flex-col items-center">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
              Beneficiaries
            </div>
            <div className="font-mono text-lg text-white font-semibold">
              {absence.beneficiaries.length}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

/**
 * Absence row (compact layout)
 */
function AbsenceCompactRow({
  absence,
  rank,
  onPlayerClick,
}: {
  absence: ImpactfulAbsence
  rank: number
  onPlayerClick?: (playerId: number) => void
}) {
  return (
    <div
      className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0 hover:bg-gray-900 px-3 -mx-3 cursor-pointer transition-colors"
      onClick={() => onPlayerClick?.(absence.absent_player_id)}
    >
      {/* Rank + Player */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="font-mono text-xs text-gray-500 w-6 text-right">
          {rank}
        </span>
        <span className="text-sm text-white truncate">
          {absence.absent_player_name}
        </span>
      </div>

      {/* Compact Metrics */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs text-gray-400">
          {absence.games_missed}G
        </span>
        <span
          className={cn(
            'font-mono text-sm font-semibold',
            absence.team_pts_diff < 0 ? 'text-red-400' : 'text-green-400'
          )}
        >
          {absence.team_pts_diff > 0 ? '+' : ''}
          {absence.team_pts_diff.toFixed(1)}
        </span>
      </div>
    </div>
  )
}

export const PlayerAbsenceImpact = React.forwardRef<
  HTMLDivElement,
  PlayerAbsenceImpactProps
>(({ className, absences, variant = 'list', onPlayerClick, ...props }, ref) => {
  // Empty state
  if (absences.length === 0) {
    return (
      <Card ref={ref} variant="default" className={cn(className)} {...props}>
        <div className="text-center py-8">
          <p className="text-gray-400 text-base">
            No player absence data available
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Data will appear once players have missed games this season
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div ref={ref} className={cn(className)} {...props}>
      <div className="mb-4 pb-4 border-b border-gray-800">
        <h3 className="text-lg text-white font-semibold">
          Most Impactful Absences
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Players whose absence significantly affects team performance
        </p>
      </div>

      <div className={playerAbsenceImpactVariants({ variant })}>
        {absences.map((absence, index) => {
          const rank = index + 1

          if (variant === 'compact') {
            return (
              <AbsenceCompactRow
                key={absence.absent_player_id}
                absence={absence}
                rank={rank}
                onPlayerClick={onPlayerClick}
              />
            )
          }

          return (
            <AbsenceListRow
              key={absence.absent_player_id}
              absence={absence}
              rank={rank}
              onPlayerClick={onPlayerClick}
            />
          )
        })}
      </div>
    </div>
  )
})

PlayerAbsenceImpact.displayName = 'PlayerAbsenceImpact'
