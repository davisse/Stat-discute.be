'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/Skeleton'
import { TrendIndicator } from './TrendIndicator'

/**
 * StatCard Component
 *
 * Affiche une statistique clé avec valeur, label, et tendance optionnelle.
 * Suit le design system STAT-DISCUTE:
 * - Base: Card variant="anthracite" (#1F1F1F)
 * - Monochrome strict pour UI (noir/blanc/gris)
 * - Couleurs uniquement pour données (vert/rouge pour tendances)
 * - Police mono (JetBrains Mono) pour valeurs numériques
 *
 * @param label - Label de la statistique (ex: "Points par match")
 * @param value - Valeur à afficher (string ou number)
 * @param subtitle - Sous-titre optionnel (ex: "Sur les 10 derniers matchs")
 * @param trend - Direction de tendance: 'up' | 'down' | 'neutral'
 * @param trendValue - Valeur de changement (ex: "+2.3" ou "-5%")
 * @param variant - Taille du card: 'default' | 'large'
 * @param onClick - Handler de clic (rend le card cliquable)
 * @param loading - État de chargement (affiche Skeleton)
 *
 * @example
 * // StatCard simple
 * <StatCard
 *   label="Points par match"
 *   value={28.5}
 * />
 *
 * @example
 * // StatCard avec tendance et drill-down
 * <StatCard
 *   label="Points par match"
 *   value={28.5}
 *   subtitle="Moyenne sur 10 matchs"
 *   trend="up"
 *   trendValue="+2.3"
 *   onClick={() => showDetails()}
 * />
 *
 * @example
 * // StatCard large en loading
 * <StatCard
 *   label="Rebonds par match"
 *   value={0}
 *   variant="large"
 *   loading
 * />
 */

const statCardVariants = cva('relative', {
  variants: {
    variant: {
      default: '',
      large: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface StatCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>,
    VariantProps<typeof statCardVariants> {
  label: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string | number
  variant?: 'default' | 'large'
  onClick?: () => void
  loading?: boolean
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      label,
      value,
      subtitle,
      trend,
      trendValue,
      variant = 'default',
      onClick,
      loading = false,
      ...props
    },
    ref
  ) => {
    const isLarge = variant === 'large'
    const isClickable = !!onClick

    // Déterminer le padding selon variant
    const padding = isLarge ? 'lg' : 'md'

    // Déterminer la taille du texte de valeur
    const valueSize = isLarge ? 'text-[var(--text-4xl)]' : 'text-[var(--text-3xl)]'

    return (
      <Card
        ref={ref}
        variant="anthracite"
        padding={padding}
        onClick={onClick}
        className={cn(statCardVariants({ variant }), className)}
        {...props}
      >
        {loading ? (
          // Loading state avec Skeleton
          <div className="space-y-[var(--space-3)]">
            <Skeleton variant="text" width="60%" height="14px" />
            <Skeleton variant="rectangular" width="80%" height="30px" />
            {subtitle && <Skeleton variant="text" width="50%" height="12px" />}
          </div>
        ) : (
          <>
            {/* Label */}
            <div className="text-[var(--text-sm)] text-[var(--color-gray-400)] uppercase tracking-[0.05em] font-[var(--font-medium)] mb-[var(--space-2)]">
              {label}
            </div>

            {/* Value + Trend Container */}
            <div className="flex items-start justify-between gap-[var(--space-3)]">
              {/* Value */}
              <div
                className={cn(
                  valueSize,
                  'font-[var(--font-bold)] text-white font-[family-name:var(--font-mono)] leading-[var(--leading-tight)]'
                )}
              >
                {typeof value === 'number' ? value.toFixed(1) : value}
              </div>

              {/* Trend Indicator (coin supérieur droit) */}
              {trend && (
                <div className="flex-shrink-0">
                  <TrendIndicator
                    trend={trend}
                    value={trendValue}
                    size="sm"
                    inline
                  />
                </div>
              )}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <div className="text-[var(--text-xs)] text-[var(--color-gray-500)] mt-[var(--space-2)]">
                {subtitle}
              </div>
            )}

            {/* Hover hint si cliquable */}
            {isClickable && (
              <div className="text-[var(--text-xs)] text-[var(--color-gray-600)] mt-[var(--space-3)] opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-fast)]">
                Cliquer pour plus de détails →
              </div>
            )}
          </>
        )}
      </Card>
    )
  }
)

StatCard.displayName = 'StatCard'
