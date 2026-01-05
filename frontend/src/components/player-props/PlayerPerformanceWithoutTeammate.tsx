'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { PlayerSplitsWithTeammate } from '@/lib/queries'

/**
 * PlayerPerformanceWithoutTeammate Component
 *
 * Visual comparison of a player's individual performance with and without a specific teammate.
 * Helps analyze synergies and dependencies between players.
 *
 * @param splits - Splits data with/without teammate
 * @param variant - Layout: 'side-by-side' (2 columns) | 'stacked' (stacked)
 * @param playerName - Name of the player being analyzed (optional display)
 * @param teammateName - Name of the teammate (optional display)
 */

const playerPerformanceVariants = cva('', {
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

export interface PlayerPerformanceWithoutTeammateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof playerPerformanceVariants> {
  splits: PlayerSplitsWithTeammate | null
  variant?: 'side-by-side' | 'stacked'
  playerName?: string
  teammateName?: string
}

/**
 * Performance delta indicator
 */
function PerformanceDelta({ value, higherIsBetter = true }: { value: number; higherIsBetter?: boolean }) {
  if (Math.abs(value) < 0.1) {
    return (
      <span className="text-gray-600 text-xs">
        —
      </span>
    )
  }

  const isPositive = value > 0
  const isBetter = higherIsBetter ? isPositive : !isPositive
  const arrow = isPositive ? '↑' : '↓'
  const colorClass = isBetter ? 'text-green-400' : 'text-red-400'

  return (
    <span className={cn('font-mono text-xs font-semibold', colorClass)}>
      {arrow} {Math.abs(value).toFixed(1)}
    </span>
  )
}

/**
 * Stat comparison row for side-by-side layout
 */
function StatComparisonRow({
  label,
  withValue,
  withoutValue,
  higherIsBetter = true,
}: {
  label: string
  withValue: number
  withoutValue: number
  higherIsBetter?: boolean
}) {
  const difference = withValue - withoutValue

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center py-3 border-b border-gray-800 last:border-b-0">
      {/* Label */}
      <div className="text-sm text-gray-400">
        {label}
      </div>

      {/* With Teammate Value */}
      <div className="font-mono text-base text-white font-semibold text-right min-w-[60px]">
        {withValue.toFixed(1)}
      </div>

      {/* Without Teammate Value */}
      <div className="font-mono text-base text-gray-500 text-right min-w-[60px]">
        {withoutValue.toFixed(1)}
      </div>

      {/* Difference */}
      <div className="text-right min-w-[50px]">
        <PerformanceDelta value={difference} higherIsBetter={higherIsBetter} />
      </div>
    </div>
  )
}

/**
 * Stat card for a single scenario (with/without)
 */
function PerformanceCard({
  title,
  games,
  pts,
  usage,
  isPrimary,
}: {
  title: string
  games: number
  pts: number
  usage: number
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
        <div className="space-y-1">
          <div className={cn(
            'font-mono text-2xl font-bold',
            isPrimary ? 'text-white' : 'text-gray-500'
          )}>
            {pts.toFixed(1)}
          </div>
          <div className={cn(
            'text-xs',
            isPrimary ? 'text-gray-400' : 'text-gray-600'
          )}>
            PPG • {games} games
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className={cn(
            'text-sm',
            isPrimary ? 'text-gray-400' : 'text-gray-600'
          )}>
            Usage Rate
          </span>
          <span className={cn(
            'font-mono text-base font-semibold',
            isPrimary ? 'text-white' : 'text-gray-500'
          )}>
            {usage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Side-by-side layout
 */
function SideBySideLayout({ splits }: { splits: PlayerSplitsWithTeammate }) {
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
        <StatComparisonRow
          label="Points"
          withValue={splits.with_teammate_pts}
          withoutValue={splits.without_teammate_pts}
          higherIsBetter={true}
        />
        <StatComparisonRow
          label="Usage Rate"
          withValue={splits.with_teammate_usage}
          withoutValue={splits.without_teammate_usage}
          higherIsBetter={true}
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
              {splits.with_teammate_games}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
              PPG Impact
            </div>
            {(() => {
              const diff = splits.with_teammate_pts - splits.without_teammate_pts
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
              {splits.without_teammate_games}
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
function StackedLayout({ splits }: { splits: PlayerSplitsWithTeammate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card variant="anthracite">
        <PerformanceCard
          title="With Teammate"
          games={splits.with_teammate_games}
          pts={splits.with_teammate_pts}
          usage={splits.with_teammate_usage}
          isPrimary={true}
        />
      </Card>

      <Card variant="anthracite">
        <PerformanceCard
          title="Without Teammate"
          games={splits.without_teammate_games}
          pts={splits.without_teammate_pts}
          usage={splits.without_teammate_usage}
          isPrimary={false}
        />
      </Card>
    </div>
  )
}

export const PlayerPerformanceWithoutTeammate = React.forwardRef<
  HTMLDivElement,
  PlayerPerformanceWithoutTeammateProps
>(
  (
    {
      className,
      splits,
      variant = 'side-by-side',
      playerName,
      teammateName,
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
              No player performance data available
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Select a player and teammate to see performance splits
            </p>
          </div>
        </Card>
      )
    }

    // Insufficient data state
    if (splits.with_teammate_games < 3 || splits.without_teammate_games < 3) {
      return (
        <Card ref={ref} variant="default" className={cn(className)} {...props}>
          <div className="mb-6 pb-4 border-b border-gray-800">
            <h3 className="text-lg text-white font-semibold">
              Player Performance Analysis
            </h3>
            {playerName && teammateName && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-white font-semibold">{playerName}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">With/Without</span>
                <span className="text-white font-semibold">{teammateName}</span>
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
                  {splits.with_teammate_games} games
                </span>
              </div>
              <div>
                <span className="text-gray-500">Without: </span>
                <span className="font-mono text-white">
                  {splits.without_teammate_games} games
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
        className={cn(playerPerformanceVariants({ variant }), className)}
        {...props}
      >
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-800">
          <h3 className="text-lg text-white font-semibold">
            Player Performance Analysis
          </h3>
          {playerName && teammateName && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="text-white font-semibold">{playerName}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">With/Without</span>
              <span className="text-white font-semibold">{teammateName}</span>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-2">
            How player performance changes with/without teammate
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

PlayerPerformanceWithoutTeammate.displayName = 'PlayerPerformanceWithoutTeammate'
