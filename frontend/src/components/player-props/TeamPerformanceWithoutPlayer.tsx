'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { TeamSplitsWithPlayer } from '@/lib/queries'

/**
 * TeamPerformanceWithoutPlayer Component
 *
 * Visual comparison of a team's performance with and without a specific player.
 * Helps evaluate the real impact of a player on their team's results.
 *
 * @param splits - Team splits data with/without player
 * @param variant - Layout: 'side-by-side' (2 columns) | 'stacked' (stacked)
 * @param playerName - Name of the player (optional display)
 * @param teamName - Name of the team (optional display)
 */

const teamPerformanceVariants = cva('', {
  variants: {
    variant: {
      'side-by-side': '',
      'stacked': '',
    },
  },
  defaultVariants: {
    variant: 'side-by-side',
  },
})

export interface TeamPerformanceWithoutPlayerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof teamPerformanceVariants> {
  splits: TeamSplitsWithPlayer | null
  variant?: 'side-by-side' | 'stacked'
  playerName?: string
  teamName?: string
}

/**
 * Difference indicator (arrow + value)
 */
function DifferenceIndicator({ value }: { value: number }) {
  if (Math.abs(value) < 0.1) {
    return (
      <span className="text-gray-600 text-xs">
        —
      </span>
    )
  }

  const isPositive = value > 0
  const arrow = isPositive ? '↑' : '↓'
  const colorClass = isPositive ? 'text-green-400' : 'text-red-400'

  return (
    <span className={cn('font-mono text-xs font-semibold', colorClass)}>
      {arrow} {Math.abs(value).toFixed(1)}
    </span>
  )
}

/**
 * Stat row for side-by-side comparison
 */
function StatRow({
  label,
  withValue,
  withoutValue,
}: {
  label: string
  withValue: number
  withoutValue: number
}) {
  const difference = withValue - withoutValue

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center py-3 border-b border-gray-800 last:border-b-0">
      {/* Label */}
      <div className="text-sm text-gray-400">
        {label}
      </div>

      {/* With Player Value */}
      <div className="font-mono text-base text-white font-semibold text-right min-w-[60px]">
        {withValue.toFixed(1)}
      </div>

      {/* Without Player Value */}
      <div className="font-mono text-base text-gray-500 text-right min-w-[60px]">
        {withoutValue.toFixed(1)}
      </div>

      {/* Difference */}
      <div className="text-right min-w-[50px]">
        <DifferenceIndicator value={difference} />
      </div>
    </div>
  )
}

/**
 * Stat card for a single scenario (with/without)
 */
function StatsCard({
  title,
  games,
  ppg,
  total,
  isPrimary,
}: {
  title: string
  games: number
  ppg: number
  total: number
  isPrimary: boolean
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center pb-3 border-b border-gray-800">
        <div className={cn(
          'text-sm uppercase tracking-wider mb-2',
          isPrimary ? 'text-white' : 'text-gray-400'
        )}>
          {title}
        </div>
        <div className={cn(
          'font-mono text-2xl font-bold',
          isPrimary ? 'text-white' : 'text-gray-500'
        )}>
          {ppg.toFixed(1)}
        </div>
        <div className={cn(
          'text-xs mt-1',
          isPrimary ? 'text-gray-400' : 'text-gray-600'
        )}>
          PPG • {games} games
        </div>
      </div>

      {/* Total Points */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className={cn(
            'text-sm',
            isPrimary ? 'text-gray-400' : 'text-gray-600'
          )}>
            Total Points
          </span>
          <span className={cn(
            'font-mono text-base font-semibold',
            isPrimary ? 'text-white' : 'text-gray-500'
          )}>
            {total}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Side-by-side layout
 */
function SideBySideLayout({ splits }: { splits: TeamSplitsWithPlayer }) {
  return (
    <div className="space-y-6">
      {/* Column Headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center pb-2 border-b border-gray-700">
        <div className="text-sm text-gray-500 uppercase tracking-wider">
          Metric
        </div>
        <div className="text-sm text-white uppercase tracking-wider text-right min-w-[60px]">
          With
        </div>
        <div className="text-sm text-gray-500 uppercase tracking-wider text-right min-w-[60px]">
          Without
        </div>
        <div className="text-sm text-gray-500 uppercase tracking-wider text-right min-w-[50px]">
          Diff
        </div>
      </div>

      {/* Stats */}
      <div>
        <StatRow
          label="Points Per Game"
          withValue={splits.with_player_ppg}
          withoutValue={splits.without_player_ppg}
        />
        <StatRow
          label="Total Points"
          withValue={splits.with_player_total}
          withoutValue={splits.without_player_total}
        />
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
              Games With
            </div>
            <div className="font-mono text-lg text-white font-bold">
              {splits.with_player_games}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
              PPG Impact
            </div>
            {(() => {
              const diff = splits.with_player_ppg - splits.without_player_ppg
              return (
                <div className={cn(
                  'font-mono text-lg font-bold',
                  diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'
                )}>
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                </div>
              )
            })()}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
              Games Without
            </div>
            <div className="font-mono text-lg text-white font-bold">
              {splits.without_player_games}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Stacked layout
 */
function StackedLayout({ splits }: { splits: TeamSplitsWithPlayer }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card variant="anthracite">
        <StatsCard
          title="With Player"
          games={splits.with_player_games}
          ppg={splits.with_player_ppg}
          total={splits.with_player_total}
          isPrimary={true}
        />
      </Card>

      <Card variant="anthracite">
        <StatsCard
          title="Without Player"
          games={splits.without_player_games}
          ppg={splits.without_player_ppg}
          total={splits.without_player_total}
          isPrimary={false}
        />
      </Card>
    </div>
  )
}

export const TeamPerformanceWithoutPlayer = React.forwardRef<
  HTMLDivElement,
  TeamPerformanceWithoutPlayerProps
>(
  (
    {
      className,
      splits,
      variant = 'side-by-side',
      playerName,
      teamName,
      ...props
    },
    ref
  ) => {
    // Null state
    if (!splits) {
      return (
        <Card ref={ref} variant="default" className={cn(className)} {...props}>
          <div className="text-center py-8">
            <p className="text-gray-400 text-base">
              No team performance data available
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Select a player to see team performance splits
            </p>
          </div>
        </Card>
      )
    }

    // Insufficient data state
    if (splits.with_player_games < 3 || splits.without_player_games < 3) {
      return (
        <Card ref={ref} variant="default" className={cn(className)} {...props}>
          <div className="mb-6 pb-4 border-b border-gray-800">
            <h3 className="text-lg text-white font-semibold">
              Team Performance Analysis
            </h3>
            {playerName && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <span className="text-white font-semibold">{playerName}</span>
                {teamName && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span>{teamName}</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="text-center py-6">
            <p className="text-gray-400 text-base">
              Insufficient data for meaningful comparison
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Need at least 3 games in each scenario for analysis
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div>
                <span className="text-gray-500">With: </span>
                <span className="font-mono text-white">
                  {splits.with_player_games} games
                </span>
              </div>
              <div>
                <span className="text-gray-500">Without: </span>
                <span className="font-mono text-white">
                  {splits.without_player_games} games
                </span>
              </div>
            </div>
          </div>
        </Card>
      )
    }

    return (
      <Card
        ref={ref}
        variant="default"
        className={cn(teamPerformanceVariants({ variant }), className)}
        {...props}
      >
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-800">
          <h3 className="text-lg text-white font-semibold">
            Team Performance Analysis
          </h3>
          {playerName && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <span className="text-white font-semibold">{playerName}</span>
              {teamName && (
                <>
                  <span className="text-gray-600">•</span>
                  <span>{teamName}</span>
                </>
              )}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Impact of player presence/absence on team performance
          </p>
        </div>

        {variant === 'side-by-side' ? (
          <SideBySideLayout splits={splits} />
        ) : (
          <StackedLayout splits={splits} />
        )}
      </Card>
    )
  }
)

TeamPerformanceWithoutPlayer.displayName = 'TeamPerformanceWithoutPlayer'
