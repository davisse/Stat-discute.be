'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { TeamSplitsWithPlayer } from '@/lib/queries'

/**
 * TeamPerformanceWithoutPlayer Component
 *
 * Comparaison visuelle de la performance d'une équipe avec et sans un joueur spécifique.
 * Permet d'évaluer l'impact réel d'un joueur sur les résultats de son équipe.
 *
 * Philosophy: Quantifier la valeur d'un joueur via l'analyse de son absence.
 * Design minimaliste avec focus sur les différentiels de performance.
 *
 * @param splits - Données de splits avec/sans joueur
 * @param variant - Layout: 'side-by-side' (2 colonnes) | 'stacked' (empilé)
 * @param highlightDifferences - Mettre en évidence les différences significatives
 *
 * @example
 * <TeamPerformanceWithoutPlayer
 *   splits={splitsData}
 *   variant="side-by-side"
 *   highlightDifferences={true}
 * />
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
  highlightDifferences?: boolean
}

/**
 * Indicateur de différence (flèche + valeur)
 */
function DifferenceIndicator({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="text-[var(--color-gray-600)] text-[var(--text-xs)]">
        —
      </span>
    )
  }

  const isPositive = value > 0
  const arrow = isPositive ? '↑' : '↓'
  const colorClass = isPositive ? 'text-green-400' : 'text-red-400'

  return (
    <span className={cn('font-[family-name:var(--font-mono)] text-[var(--text-xs)] font-[var(--font-semibold)]', colorClass)}>
      {arrow} {Math.abs(value).toFixed(1)}
    </span>
  )
}

/**
 * Row de statistique pour comparaison side-by-side
 */
function StatRow({
  label,
  withValue,
  withoutValue,
  difference,
  highlightDifferences,
}: {
  label: string
  withValue: number
  withoutValue: number
  difference: number
  highlightDifferences?: boolean
}) {
  const isSignificant = highlightDifferences && Math.abs(difference) > 5

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-[var(--space-4)] items-center py-[var(--space-3)] border-b border-[var(--color-gray-800)] last:border-b-0">
      {/* Label */}
      <div className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
        {label}
      </div>

      {/* With Player Value */}
      <div
        className={cn(
          'font-[family-name:var(--font-mono)] text-[var(--text-base)] text-white font-[var(--font-semibold)] text-right min-w-[60px]',
          isSignificant && difference > 0 && 'text-green-400'
        )}
      >
        {withValue.toFixed(1)}
      </div>

      {/* Without Player Value */}
      <div
        className={cn(
          'font-[family-name:var(--font-mono)] text-[var(--text-base)] text-[var(--color-gray-500)] text-right min-w-[60px]',
          isSignificant && difference < 0 && 'text-red-400'
        )}
      >
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
 * Card de statistiques pour une colonne (avec ou sans joueur)
 */
function StatsColumn({
  title,
  stats,
  isPrimary,
}: {
  title: string
  stats: {
    games: number
    wins: number
    losses: number
    win_pct: number
    points_avg: number
    points_allowed_avg: number
    net_rating: number
    fg_pct: number
    fg3_pct: number
    ft_pct: number
    rebounds_avg: number
    assists_avg: number
    turnovers_avg: number
  }
  isPrimary: boolean
}) {
  return (
    <div className="space-y-[var(--space-4)]">
      {/* Header */}
      <div className="text-center pb-[var(--space-3)] border-b border-[var(--color-gray-800)]">
        <div className={cn(
          'text-[var(--text-sm)] uppercase tracking-wider mb-[var(--space-2)]',
          isPrimary ? 'text-white' : 'text-[var(--color-gray-400)]'
        )}>
          {title}
        </div>
        <div className="flex items-center justify-center gap-[var(--space-2)]">
          <span className={cn(
            'font-[family-name:var(--font-mono)] text-[var(--text-2xl)] font-[var(--font-bold)]',
            isPrimary ? 'text-white' : 'text-[var(--color-gray-500)]'
          )}>
            {stats.wins}-{stats.losses}
          </span>
          <span className={cn(
            'text-[var(--text-sm)]',
            isPrimary ? 'text-[var(--color-gray-400)]' : 'text-[var(--color-gray-600)]'
          )}>
            ({stats.win_pct.toFixed(1)}%)
          </span>
        </div>
        <div className={cn(
          'text-[var(--text-xs)] mt-[var(--space-1)]',
          isPrimary ? 'text-[var(--color-gray-500)]' : 'text-[var(--color-gray-600)]'
        )}>
          {stats.games} games
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-[var(--space-3)]">
        <StatItem label="Net Rating" value={stats.net_rating} isPrimary={isPrimary} />
        <StatItem label="Points" value={stats.points_avg} isPrimary={isPrimary} />
        <StatItem label="Points Allowed" value={stats.points_allowed_avg} isPrimary={isPrimary} />
        <StatItem label="FG%" value={stats.fg_pct} isPrimary={isPrimary} suffix="%" />
        <StatItem label="3P%" value={stats.fg3_pct} isPrimary={isPrimary} suffix="%" />
        <StatItem label="FT%" value={stats.ft_pct} isPrimary={isPrimary} suffix="%" />
        <StatItem label="Rebounds" value={stats.rebounds_avg} isPrimary={isPrimary} />
        <StatItem label="Assists" value={stats.assists_avg} isPrimary={isPrimary} />
        <StatItem label="Turnovers" value={stats.turnovers_avg} isPrimary={isPrimary} />
      </div>
    </div>
  )
}

/**
 * Item de statistique dans une colonne
 */
function StatItem({
  label,
  value,
  isPrimary,
  suffix,
}: {
  label: string
  value: number
  isPrimary: boolean
  suffix?: string
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn(
        'text-[var(--text-sm)]',
        isPrimary ? 'text-[var(--color-gray-400)]' : 'text-[var(--color-gray-600)]'
      )}>
        {label}
      </span>
      <span className={cn(
        'font-[family-name:var(--font-mono)] text-[var(--text-base)] font-[var(--font-semibold)]',
        isPrimary ? 'text-white' : 'text-[var(--color-gray-500)]'
      )}>
        {value.toFixed(1)}
        {suffix}
      </span>
    </div>
  )
}

/**
 * Header du composant avec info joueur/équipe
 */
function PerformanceHeader({ splits }: { splits: TeamSplitsWithPlayer }) {
  return (
    <div className="mb-[var(--space-6)] pb-[var(--space-4)] border-b border-[var(--color-gray-800)]">
      <h3 className="text-[var(--text-lg)] text-white font-[var(--font-semibold)]">
        Team Performance Analysis
      </h3>
      <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-gray-400)]">
        <span className="text-white font-[var(--font-semibold)]">
          {splits.player_name}
        </span>
        <span className="text-[var(--color-gray-600)]">•</span>
        <span>{splits.team_abbreviation}</span>
      </div>
      <p className="text-[var(--text-sm)] text-[var(--color-gray-500)] mt-[var(--space-2)]">
        Impact of player presence/absence on team performance
      </p>
    </div>
  )
}

/**
 * Layout side-by-side (2 colonnes)
 */
function SideBySideLayout({
  splits,
  highlightDifferences,
}: {
  splits: TeamSplitsWithPlayer
  highlightDifferences?: boolean
}) {
  return (
    <div className="space-y-[var(--space-6)]">
      {/* Column Headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-[var(--space-4)] items-center pb-[var(--space-2)] border-b border-[var(--color-gray-700)]">
        <div className="text-[var(--text-sm)] text-[var(--color-gray-500)] uppercase tracking-wider">
          Metric
        </div>
        <div className="text-[var(--text-sm)] text-white uppercase tracking-wider text-right min-w-[60px]">
          With
        </div>
        <div className="text-[var(--text-sm)] text-[var(--color-gray-500)] uppercase tracking-wider text-right min-w-[60px]">
          Without
        </div>
        <div className="text-[var(--text-sm)] text-[var(--color-gray-500)] uppercase tracking-wider text-right min-w-[50px]">
          Diff
        </div>
      </div>

      {/* Stats Rows */}
      <div>
        <StatRow
          label="Win%"
          withValue={splits.with_player.win_pct}
          withoutValue={splits.without_player.win_pct}
          difference={splits.difference.win_pct_diff}
          highlightDifferences={highlightDifferences}
        />
        <StatRow
          label="Net Rating"
          withValue={splits.with_player.net_rating}
          withoutValue={splits.without_player.net_rating}
          difference={splits.difference.net_rating_diff}
          highlightDifferences={highlightDifferences}
        />
        <StatRow
          label="Points"
          withValue={splits.with_player.points_avg}
          withoutValue={splits.without_player.points_avg}
          difference={splits.difference.points_diff}
          highlightDifferences={highlightDifferences}
        />
        <StatRow
          label="Points Allowed"
          withValue={splits.with_player.points_allowed_avg}
          withoutValue={splits.without_player.points_allowed_avg}
          difference={splits.with_player.points_allowed_avg - splits.without_player.points_allowed_avg}
          highlightDifferences={highlightDifferences}
        />
        <StatRow
          label="FG%"
          withValue={splits.with_player.fg_pct}
          withoutValue={splits.without_player.fg_pct}
          difference={splits.with_player.fg_pct - splits.without_player.fg_pct}
          highlightDifferences={highlightDifferences}
        />
        <StatRow
          label="3P%"
          withValue={splits.with_player.fg3_pct}
          withoutValue={splits.without_player.fg3_pct}
          difference={splits.with_player.fg3_pct - splits.without_player.fg3_pct}
          highlightDifferences={highlightDifferences}
        />
        <StatRow
          label="Rebounds"
          withValue={splits.with_player.rebounds_avg}
          withoutValue={splits.without_player.rebounds_avg}
          difference={splits.with_player.rebounds_avg - splits.without_player.rebounds_avg}
          highlightDifferences={highlightDifferences}
        />
        <StatRow
          label="Assists"
          withValue={splits.with_player.assists_avg}
          withoutValue={splits.without_player.assists_avg}
          difference={splits.with_player.assists_avg - splits.without_player.assists_avg}
          highlightDifferences={highlightDifferences}
        />
        <StatRow
          label="Turnovers"
          withValue={splits.with_player.turnovers_avg}
          withoutValue={splits.without_player.turnovers_avg}
          difference={splits.with_player.turnovers_avg - splits.without_player.turnovers_avg}
          highlightDifferences={highlightDifferences}
        />
      </div>

      {/* Summary */}
      <div className="pt-[var(--space-4)] border-t border-[var(--color-gray-800)]">
        <div className="grid grid-cols-3 gap-[var(--space-4)] text-center">
          <div>
            <div className="text-[var(--text-xs)] uppercase tracking-wider text-[var(--color-gray-400)] mb-[var(--space-1)]">
              Games With
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[var(--text-lg)] text-white font-[var(--font-bold)]">
              {splits.with_player.games}
            </div>
          </div>
          <div>
            <div className="text-[var(--text-xs)] uppercase tracking-wider text-[var(--color-gray-400)] mb-[var(--space-1)]">
              Win% Impact
            </div>
            <div className={cn(
              'font-[family-name:var(--font-mono)] text-[var(--text-lg)] font-[var(--font-bold)]',
              splits.difference.win_pct_diff > 0 ? 'text-green-400' : splits.difference.win_pct_diff < 0 ? 'text-red-400' : 'text-[var(--color-gray-500)]'
            )}>
              {splits.difference.win_pct_diff > 0 ? '+' : ''}
              {splits.difference.win_pct_diff.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-[var(--text-xs)] uppercase tracking-wider text-[var(--color-gray-400)] mb-[var(--space-1)]">
              Games Without
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[var(--text-lg)] text-white font-[var(--font-bold)]">
              {splits.without_player.games}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Layout stacked (colonnes empilées)
 */
function StackedLayout({ splits }: { splits: TeamSplitsWithPlayer }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-6)]">
      <Card variant="anthracite">
        <StatsColumn
          title="With Player"
          stats={splits.with_player}
          isPrimary={true}
        />
      </Card>

      <Card variant="anthracite">
        <StatsColumn
          title="Without Player"
          stats={splits.without_player}
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
      highlightDifferences = true,
      ...props
    },
    ref
  ) => {
    // Null state
    if (!splits) {
      return (
        <Card ref={ref} variant="default" className={cn(className)} {...props}>
          <div className="text-center py-[var(--space-8)]">
            <p className="text-[var(--color-gray-400)] text-[var(--text-base)]">
              No team performance data available
            </p>
            <p className="text-[var(--color-gray-600)] text-[var(--text-sm)] mt-[var(--space-2)]">
              Select a player to see team performance splits
            </p>
          </div>
        </Card>
      )
    }

    // Insufficient data state
    if (splits.with_player.games < 3 || splits.without_player.games < 3) {
      return (
        <Card ref={ref} variant="default" className={cn(className)} {...props}>
          <PerformanceHeader splits={splits} />
          <div className="text-center py-[var(--space-6)]">
            <p className="text-[var(--color-gray-400)] text-[var(--text-base)]">
              Insufficient data for meaningful comparison
            </p>
            <p className="text-[var(--color-gray-600)] text-[var(--text-sm)] mt-[var(--space-2)]">
              Need at least 3 games in each scenario for analysis
            </p>
            <div className="mt-[var(--space-4)] flex items-center justify-center gap-[var(--space-6)] text-[var(--text-sm)]">
              <div>
                <span className="text-[var(--color-gray-500)]">With: </span>
                <span className="font-[family-name:var(--font-mono)] text-white">
                  {splits.with_player.games} games
                </span>
              </div>
              <div>
                <span className="text-[var(--color-gray-500)]">Without: </span>
                <span className="font-[family-name:var(--font-mono)] text-white">
                  {splits.without_player.games} games
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
        <PerformanceHeader splits={splits} />

        {variant === 'side-by-side' ? (
          <SideBySideLayout
            splits={splits}
            highlightDifferences={highlightDifferences}
          />
        ) : (
          <StackedLayout splits={splits} />
        )}
      </Card>
    )
  }
)

TeamPerformanceWithoutPlayer.displayName = 'TeamPerformanceWithoutPlayer'
