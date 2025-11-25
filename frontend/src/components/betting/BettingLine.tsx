'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/Tooltip'
import { TrendIndicator } from '@/components/stats/TrendIndicator'

/**
 * BettingLine Component
 *
 * Affiche une ligne de cote avec évolution (spread, total, moneyline).
 * Design anti-impulsif: pas de CTA, focus sur l'information et l'analyse.
 *
 * @param type - Type de pari: 'spread' | 'total' | 'moneyline'
 * @param homeTeam - Nom de l'équipe à domicile
 * @param awayTeam - Nom de l'équipe à l'extérieur
 * @param line - Ligne actuelle, opening, mouvement
 * @param odds - Cotes américaines pour home et away
 * @param onClick - Handler de clic (pour historique des mouvements)
 *
 * @example
 * <BettingLine
 *   type="spread"
 *   homeTeam="Lakers"
 *   awayTeam="Warriors"
 *   line={{
 *     current: -5.5,
 *     opening: -6.0,
 *     movement: 'down'
 *   }}
 *   odds={{ home: -110, away: -110 }}
 *   onClick={() => showLineHistory()}
 * />
 *
 * @example
 * <BettingLine
 *   type="total"
 *   homeTeam="Lakers"
 *   awayTeam="Warriors"
 *   line={{
 *     current: 225.5,
 *     opening: 226.0,
 *     movement: 'down'
 *   }}
 *   odds={{ home: -110, away: -110 }}
 * />
 */

export interface BettingLineProps {
  type: 'spread' | 'total' | 'moneyline'
  homeTeam: string
  awayTeam: string
  line: {
    current: number
    opening?: number
    movement?: 'up' | 'down' | 'none'
  }
  odds: {
    home: number // American odds: -110, +150
    away: number
  }
  onClick?: () => void
  className?: string
}

/**
 * Badge de type de pari
 */
function TypeBadge({ type }: { type: BettingLineProps['type'] }) {
  const labels = {
    spread: 'SPREAD',
    total: 'TOTAL',
    moneyline: 'ML',
  }

  return (
    <span className="inline-flex items-center px-[var(--space-2)] py-[4px] bg-[var(--color-gray-700)] text-[var(--text-xs)] text-[var(--color-gray-300)] rounded-[var(--radius-sm)] font-[var(--font-semibold)] uppercase tracking-wide">
      {labels[type]}
    </span>
  )
}

/**
 * Formate les cotes américaines
 */
function formatOdds(odds: number): string {
  if (odds > 0) {
    return `+${odds}`
  }
  return String(odds)
}

/**
 * Affiche la ligne avec opening (si différent) et mouvement
 */
function LineDisplay({
  current,
  opening,
  movement,
  type,
}: {
  current: number
  opening?: number
  movement?: 'up' | 'down' | 'none'
  type: BettingLineProps['type']
}) {
  const hasChanged = opening !== undefined && opening !== current

  // Format avec signe pour spread
  const formatLine = (value: number) => {
    if (type === 'spread') {
      return value > 0 ? `+${value}` : String(value)
    }
    return String(value)
  }

  return (
    <div className="flex items-center gap-[var(--space-2)]">
      {/* Current Line */}
      <div className="text-[var(--text-lg)] text-white font-[var(--font-semibold)] font-[family-name:var(--font-mono)]">
        {formatLine(current)}
      </div>

      {/* Opening Line (si différent) */}
      {hasChanged && (
        <div className="text-[var(--text-xs)] text-[var(--color-gray-500)] line-through font-[family-name:var(--font-mono)]">
          {formatLine(opening!)}
        </div>
      )}

      {/* Movement Indicator */}
      {movement && movement !== 'none' && (
        <TrendIndicator trend={movement} size="sm" showIcon showValue={false} />
      )}
    </div>
  )
}

/**
 * Affiche les cotes
 */
function OddsDisplay({ odds }: { odds: number }) {
  return (
    <div className="text-[var(--text-base)] text-white font-[family-name:var(--font-mono)]">
      {formatOdds(odds)}
    </div>
  )
}

export function BettingLine({
  type,
  homeTeam,
  awayTeam,
  line,
  odds,
  onClick,
  className,
}: BettingLineProps) {
  const isClickable = !!onClick

  return (
    <Card
      variant="anthracite"
      padding="md"
      onClick={onClick}
      className={cn('relative', className)}
    >
      {/* Header: Type Badge */}
      <div className="mb-[var(--space-4)]">
        <TypeBadge type={type} />
      </div>

      {/* Main Content: 2 colonnes (Teams + Line | Odds) */}
      <div className="grid grid-cols-[1fr_auto] gap-[var(--space-6)] items-start">
        {/* Left: Teams + Line */}
        <div className="space-y-[var(--space-3)]">
          {/* Away Team */}
          <div className="flex items-center justify-between gap-[var(--space-4)]">
            <span className="text-[var(--text-sm)] text-white font-[var(--font-medium)]">
              {awayTeam}
            </span>
            {type !== 'total' && (
              <LineDisplay
                current={line.current}
                opening={line.opening}
                movement={line.movement}
                type={type}
              />
            )}
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between gap-[var(--space-4)]">
            <span className="text-[var(--text-sm)] text-white font-[var(--font-medium)]">
              {homeTeam}
            </span>
            {type === 'total' && (
              <LineDisplay
                current={line.current}
                opening={line.opening}
                movement={line.movement}
                type={type}
              />
            )}
          </div>
        </div>

        {/* Right: Odds */}
        <div className="flex flex-col items-end gap-[var(--space-3)]">
          <OddsDisplay odds={odds.away} />
          <OddsDisplay odds={odds.home} />
        </div>
      </div>

      {/* Click Hint (si cliquable) */}
      {isClickable && (
        <Tooltip content="Cliquer pour voir l'historique des mouvements">
          <div className="absolute top-[var(--space-3)] right-[var(--space-3)] text-[var(--color-gray-600)] hover:text-[var(--color-gray-400)] transition-colors">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8 10a.75.75 0 01-.75-.75v-3.5a.75.75 0 011.5 0v3.5A.75.75 0 018 10z" />
            </svg>
          </div>
        </Tooltip>
      )}
    </Card>
  )
}
