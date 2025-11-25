'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { PlayerSplitsWithTeammate } from '@/lib/queries'

/**
 * PlayerPerformanceWithoutTeammate Component
 *
 * Comparaison visuelle de la performance individuelle d'un joueur avec et sans un coéquipier spécifique.
 * Permet d'analyser les synergies et dépendances entre joueurs.
 *
 * Philosophy: Identifier les combinaisons de joueurs qui maximisent la performance.
 * Design minimaliste avec focus sur les métriques avancées (Usage%, TS%).
 *
 * @param splits - Données de splits avec/sans coéquipier
 * @param variant - Layout: 'side-by-side' (2 colonnes) | 'stacked' (empilé)
 * @param highlightDifferences - Mettre en évidence les différences significatives
 * @param showAdvancedStats - Afficher les stats avancées (Usage%, TS%)
 *
 * @example
 * <PlayerPerformanceWithoutTeammate
 *   splits={splitsData}
 *   variant="side-by-side"
 *   highlightDifferences={true}
 *   showAdvancedStats={true}
 * />
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
  highlightDifferences?: boolean
  showAdvancedStats?: boolean
}

/**
 * Indicateur de différence avec direction (plus élevé = meilleur)
 */
function PerformanceDelta({ value, higherIsBetter = true }: { value: number; higherIsBetter?: boolean }) {
  if (value === 0) {
    return (
      <span className="text-[var(--color-gray-600)] text-[var(--text-xs)]">
        —
      </span>
    )
  }

  const isPositive = value > 0
  const isBetter = higherIsBetter ? isPositive : !isPositive
  const arrow = isPositive ? '↑' : '↓'
  const colorClass = isBetter ? 'text-green-400' : 'text-red-400'

  return (
    <span className={cn('font-[family-name:var(--font-mono)] text-[var(--text-xs)] font-[var(--font-semibold)]', colorClass)}>
      {arrow} {Math.abs(value).toFixed(1)}
    </span>
  )
}

/**
 * Row de statistique pour comparaison side-by-side
 */
function StatComparisonRow({
  label,
  withValue,
  withoutValue,
  difference,
  highlightDifferences,
  higherIsBetter,
}: {
  label: string
  withValue: number
  withoutValue: number
  difference: number
  highlightDifferences?: boolean
  higherIsBetter?: boolean
}) {
  const threshold = label.includes('%') ? 3 : 2
  const isSignificant = highlightDifferences && Math.abs(difference) > threshold
  const isBetter = higherIsBetter ? difference > 0 : difference < 0

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-[var(--space-4)] items-center py-[var(--space-3)] border-b border-[var(--color-gray-800)] last:border-b-0">
      {/* Label */}
      <div className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
        {label}
      </div>

      {/* With Teammate Value */}
      <div
        className={cn(
          'font-[family-name:var(--font-mono)] text-[var(--text-base)] text-white font-[var(--font-semibold)] text-right min-w-[60px]',
          isSignificant && isBetter && 'text-green-400'
        )}
      >
        {withValue.toFixed(1)}
      </div>

      {/* Without Teammate Value */}
      <div
        className={cn(
          'font-[family-name:var(--font-mono)] text-[var(--text-base)] text-[var(--color-gray-500)] text-right min-w-[60px]',
          isSignificant && !isBetter && 'text-red-400'
        )}
      >
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
 * Card de statistiques pour une colonne (avec ou sans coéquipier)
 */
function PerformanceColumn({
  title,
  stats,
  isPrimary,
  showAdvancedStats,
}: {
  title: string
  stats: {
    games: number
    minutes_avg: number
    points_avg: number
    rebounds_avg: number
    assists_avg: number
    fg_pct: number
    fg3_pct: number
    ft_pct: number
    usage_rate: number
    true_shooting_pct: number
  }
  isPrimary: boolean
  showAdvancedStats?: boolean
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
        <div className="space-y-[var(--space-1)]">
          <div className={cn(
            'font-[family-name:var(--font-mono)] text-[var(--text-2xl)] font-[var(--font-bold)]',
            isPrimary ? 'text-white' : 'text-[var(--color-gray-500)]'
          )}>
            {stats.points_avg.toFixed(1)}
          </div>
          <div className={cn(
            'text-[var(--text-xs)]',
            isPrimary ? 'text-[var(--color-gray-400)]' : 'text-[var(--color-gray-600)]'
          )}>
            PPG • {stats.games} games
          </div>
        </div>
      </div>

      {/* Basic Stats */}
      <div className="space-y-[var(--space-3)]">
        <ColumnStatItem label="Minutes" value={stats.minutes_avg} isPrimary={isPrimary} />
        <ColumnStatItem label="Rebounds" value={stats.rebounds_avg} isPrimary={isPrimary} />
        <ColumnStatItem label="Assists" value={stats.assists_avg} isPrimary={isPrimary} />
        <ColumnStatItem label="FG%" value={stats.fg_pct} isPrimary={isPrimary} suffix="%" />
        <ColumnStatItem label="3P%" value={stats.fg3_pct} isPrimary={isPrimary} suffix="%" />
        <ColumnStatItem label="FT%" value={stats.ft_pct} isPrimary={isPrimary} suffix="%" />
      </div>

      {/* Advanced Stats */}
      {showAdvancedStats && (
        <div className="pt-[var(--space-3)] border-t border-[var(--color-gray-800)] space-y-[var(--space-3)]">
          <ColumnStatItem label="Usage%" value={stats.usage_rate} isPrimary={isPrimary} suffix="%" />
          <ColumnStatItem label="True Shooting%" value={stats.true_shooting_pct} isPrimary={isPrimary} suffix="%" />
        </div>
      )}
    </div>
  )
}

/**
 * Item de statistique dans une colonne
 */
function ColumnStatItem({
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
 * Header du composant avec info joueur/coéquipier
 */
function SplitsHeader({ splits }: { splits: PlayerSplitsWithTeammate }) {
  return (
    <div className="mb-[var(--space-6)] pb-[var(--space-4)] border-b border-[var(--color-gray-800)]">
      <h3 className="text-[var(--text-lg)] text-white font-[var(--font-semibold)]">
        Player Performance Analysis
      </h3>
      <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-2)] text-[var(--text-sm)]">
        <span className="text-white font-[var(--font-semibold)]">
          {splits.player_name}
        </span>
        <span className="text-[var(--color-gray-600)]">•</span>
        <span className="text-[var(--color-gray-400)]">With/Without</span>
        <span className="text-white font-[var(--font-semibold)]">
          {splits.teammate_name}
        </span>
        <span className="text-[var(--color-gray-600)]">•</span>
        <span className="text-[var(--color-gray-400)]">{splits.team_abbreviation}</span>
      </div>
      <p className="text-[var(--text-sm)] text-[var(--color-gray-500)] mt-[var(--space-2)]">
        How player performance changes with/without teammate
      </p>
    </div>
  )
}

/**
 * Layout side-by-side (table format)
 */
function SideBySideLayout({
  splits,
  highlightDifferences,
  showAdvancedStats,
}: {
  splits: PlayerSplitsWithTeammate
  highlightDifferences?: boolean
  showAdvancedStats?: boolean
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

      {/* Basic Stats */}
      <div>
        <StatComparisonRow
          label="Points"
          withValue={splits.with_teammate.points_avg}
          withoutValue={splits.without_teammate.points_avg}
          difference={splits.difference.points_diff}
          highlightDifferences={highlightDifferences}
          higherIsBetter={true}
        />
        <StatComparisonRow
          label="Minutes"
          withValue={splits.with_teammate.minutes_avg}
          withoutValue={splits.without_teammate.minutes_avg}
          difference={splits.with_teammate.minutes_avg - splits.without_teammate.minutes_avg}
          highlightDifferences={highlightDifferences}
          higherIsBetter={true}
        />
        <StatComparisonRow
          label="Rebounds"
          withValue={splits.with_teammate.rebounds_avg}
          withoutValue={splits.without_teammate.rebounds_avg}
          difference={splits.with_teammate.rebounds_avg - splits.without_teammate.rebounds_avg}
          highlightDifferences={highlightDifferences}
          higherIsBetter={true}
        />
        <StatComparisonRow
          label="Assists"
          withValue={splits.with_teammate.assists_avg}
          withoutValue={splits.without_teammate.assists_avg}
          difference={splits.difference.assists_diff}
          highlightDifferences={highlightDifferences}
          higherIsBetter={true}
        />
        <StatComparisonRow
          label="FG%"
          withValue={splits.with_teammate.fg_pct}
          withoutValue={splits.without_teammate.fg_pct}
          difference={splits.with_teammate.fg_pct - splits.without_teammate.fg_pct}
          highlightDifferences={highlightDifferences}
          higherIsBetter={true}
        />
        <StatComparisonRow
          label="3P%"
          withValue={splits.with_teammate.fg3_pct}
          withoutValue={splits.without_teammate.fg3_pct}
          difference={splits.with_teammate.fg3_pct - splits.without_teammate.fg3_pct}
          highlightDifferences={highlightDifferences}
          higherIsBetter={true}
        />
        <StatComparisonRow
          label="FT%"
          withValue={splits.with_teammate.ft_pct}
          withoutValue={splits.without_teammate.ft_pct}
          difference={splits.with_teammate.ft_pct - splits.without_teammate.ft_pct}
          highlightDifferences={highlightDifferences}
          higherIsBetter={true}
        />
      </div>

      {/* Advanced Stats */}
      {showAdvancedStats && (
        <div className="pt-[var(--space-4)] border-t border-[var(--color-gray-800)]">
          <StatComparisonRow
            label="Usage Rate"
            withValue={splits.with_teammate.usage_rate}
            withoutValue={splits.without_teammate.usage_rate}
            difference={splits.difference.usage_diff}
            highlightDifferences={highlightDifferences}
            higherIsBetter={true}
          />
          <StatComparisonRow
            label="True Shooting%"
            withValue={splits.with_teammate.true_shooting_pct}
            withoutValue={splits.without_teammate.true_shooting_pct}
            difference={splits.with_teammate.true_shooting_pct - splits.without_teammate.true_shooting_pct}
            highlightDifferences={highlightDifferences}
            higherIsBetter={true}
          />
        </div>
      )}

      {/* Summary */}
      <div className="pt-[var(--space-4)] border-t border-[var(--color-gray-800)]">
        <div className="grid grid-cols-3 gap-[var(--space-4)] text-center">
          <div>
            <div className="text-[var(--text-xs)] uppercase tracking-wider text-[var(--color-gray-400)] mb-[var(--space-1)]">
              Games With
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[var(--text-lg)] text-white font-[var(--font-bold)]">
              {splits.with_teammate.games}
            </div>
          </div>
          <div>
            <div className="text-[var(--text-xs)] uppercase tracking-wider text-[var(--color-gray-400)] mb-[var(--space-1)]">
              PPG Impact
            </div>
            <div className={cn(
              'font-[family-name:var(--font-mono)] text-[var(--text-lg)] font-[var(--font-bold)]',
              splits.difference.points_diff > 0 ? 'text-green-400' : splits.difference.points_diff < 0 ? 'text-red-400' : 'text-[var(--color-gray-500)]'
            )}>
              {splits.difference.points_diff > 0 ? '+' : ''}
              {splits.difference.points_diff.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-[var(--text-xs)] uppercase tracking-wider text-[var(--color-gray-400)] mb-[var(--space-1)]">
              Games Without
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[var(--text-lg)] text-white font-[var(--font-bold)]">
              {splits.without_teammate.games}
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
function StackedLayout({
  splits,
  showAdvancedStats,
}: {
  splits: PlayerSplitsWithTeammate
  showAdvancedStats?: boolean
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-6)]">
      <Card variant="anthracite">
        <PerformanceColumn
          title="With Teammate"
          stats={splits.with_teammate}
          isPrimary={true}
          showAdvancedStats={showAdvancedStats}
        />
      </Card>

      <Card variant="anthracite">
        <PerformanceColumn
          title="Without Teammate"
          stats={splits.without_teammate}
          isPrimary={false}
          showAdvancedStats={showAdvancedStats}
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
      highlightDifferences = true,
      showAdvancedStats = true,
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
              No player performance data available
            </p>
            <p className="text-[var(--color-gray-600)] text-[var(--text-sm)] mt-[var(--space-2)]">
              Select a player and teammate to see performance splits
            </p>
          </div>
        </Card>
      )
    }

    // Insufficient data state
    if (splits.with_teammate.games < 3 || splits.without_teammate.games < 3) {
      return (
        <Card ref={ref} variant="default" className={cn(className)} {...props}>
          <SplitsHeader splits={splits} />
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
                  {splits.with_teammate.games} games
                </span>
              </div>
              <div>
                <span className="text-[var(--color-gray-500)]">Without: </span>
                <span className="font-[family-name:var(--font-mono)] text-white">
                  {splits.without_teammate.games} games
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
        <SplitsHeader splits={splits} />

        {variant === 'side-by-side' ? (
          <SideBySideLayout
            splits={splits}
            highlightDifferences={highlightDifferences}
            showAdvancedStats={showAdvancedStats}
          />
        ) : (
          <StackedLayout
            splits={splits}
            showAdvancedStats={showAdvancedStats}
          />
        )}
      </Card>
    )
  }
)

PlayerPerformanceWithoutTeammate.displayName = 'PlayerPerformanceWithoutTeammate'
