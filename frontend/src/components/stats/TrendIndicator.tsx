'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * TrendIndicator Component
 *
 * Indicateur visuel compact de tendance (haussière/baissière/neutre).
 * Suit la philosophie anti-impulsivité : pas d'animations flashy, couleurs subtiles.
 *
 * @param trend - Direction de la tendance: 'up' | 'down' | 'neutral'
 * @param value - Valeur de changement (optionnel): "+5.2" ou 5.2
 * @param size - Taille de l'indicateur: 'sm' | 'md' | 'lg'
 * @param showIcon - Afficher l'icône flèche (défaut: true)
 * @param showValue - Afficher la valeur (défaut: true si value fourni)
 * @param inline - Mode inline (flex-row) vs default (flex-col)
 *
 * @example
 * // Tendance haussière avec valeur
 * <TrendIndicator trend="up" value="+5.2" size="md" />
 *
 * @example
 * // Tendance baissière inline
 * <TrendIndicator trend="down" value="-3%" inline showIcon showValue />
 *
 * @example
 * // Neutre sans valeur
 * <TrendIndicator trend="neutral" size="sm" />
 */

const trendVariants = cva(
  'flex items-center gap-[var(--space-1)] transition-colors duration-[var(--transition-fast)]',
  {
    variants: {
      trend: {
        up: 'text-[var(--color-positive)]',
        down: 'text-[var(--color-negative)]',
        neutral: 'text-[var(--color-gray-500)]',
      },
      size: {
        sm: 'text-[var(--text-xs)]', // 12px
        md: 'text-[var(--text-sm)]', // 14px
        lg: 'text-[var(--text-base)]', // 16px
      },
      inline: {
        true: 'flex-row',
        false: 'flex-col',
      },
    },
    defaultVariants: {
      trend: 'neutral',
      size: 'md',
      inline: false,
    },
  }
)

const iconSizes = {
  sm: '12px',
  md: '16px',
  lg: '20px',
} as const

export interface TrendIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'size'>,
    VariantProps<typeof trendVariants> {
  trend: 'up' | 'down' | 'neutral'
  value?: string | number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showValue?: boolean
  inline?: boolean
}

/**
 * Icône de tendance (triangle ou cercle)
 */
function TrendIcon({
  trend,
  size = 'md'
}: {
  trend: 'up' | 'down' | 'neutral'
  size: 'sm' | 'md' | 'lg'
}) {
  const iconSize = iconSizes[size]

  if (trend === 'up') {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M8 4 L12 10 L4 10 Z" />
      </svg>
    )
  }

  if (trend === 'down') {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M8 12 L12 6 L4 6 Z" />
      </svg>
    )
  }

  // Neutral: circle
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="3" />
    </svg>
  )
}

/**
 * Formate la valeur pour affichage
 */
function formatValue(value: string | number): string {
  if (typeof value === 'string') {
    return value
  }

  // Si nombre, ajouter + si positif
  if (value > 0) {
    return `+${value}`
  }
  return String(value)
}

export const TrendIndicator = React.forwardRef<HTMLDivElement, TrendIndicatorProps>(
  (
    {
      className,
      trend,
      value,
      size = 'md',
      showIcon = true,
      showValue = value !== undefined,
      inline = false,
      ...props
    },
    ref
  ) => {
    // Labels pour accessibilité
    const trendLabels = {
      up: 'Tendance haussière',
      down: 'Tendance baissière',
      neutral: 'Tendance neutre',
    }

    const formattedValue = value !== undefined ? formatValue(value) : null

    return (
      <div
        ref={ref}
        className={cn(
          trendVariants({ trend, size, inline, className })
        )}
        role="status"
        aria-label={`${trendLabels[trend]}${formattedValue ? `: ${formattedValue}` : ''}`}
        {...props}
      >
        {showIcon && <TrendIcon trend={trend} size={size} />}
        {showValue && formattedValue && (
          <span className="font-[var(--font-medium)]">
            {formattedValue}
          </span>
        )}
      </div>
    )
  }
)

TrendIndicator.displayName = 'TrendIndicator'
