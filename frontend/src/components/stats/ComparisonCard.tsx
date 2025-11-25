'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

/**
 * ComparisonCard Component
 *
 * Comparaison visuelle entre 2 joueurs ou 2 équipes.
 * Layout 3 colonnes (EntityA | StatLabel | EntityB) avec bars visuelles.
 *
 * Philosophy: Encourage la comparaison analytique, pas l'impulsivité.
 * Design minimaliste pour focus sur les données.
 *
 * @param entityA - Première entité à comparer
 * @param entityB - Deuxième entité à comparer
 * @param statKeys - Statistiques à comparer avec labels
 * @param variant - Layout: 'horizontal' (3 cols) | 'vertical' (2 cols stacked)
 *
 * @example
 * <ComparisonCard
 *   entityA={{
 *     id: '1',
 *     name: 'LeBron James',
 *     photoUrl: '/lebron.jpg',
 *     stats: { ppg: 28.5, rpg: 7.2, apg: 8.1 }
 *   }}
 *   entityB={{
 *     id: '2',
 *     name: 'Kevin Durant',
 *     photoUrl: '/durant.jpg',
 *     stats: { ppg: 29.1, rpg: 6.7, apg: 5.0 }
 *   }}
 *   statKeys={[
 *     { key: 'ppg', label: 'Points' },
 *     { key: 'rpg', label: 'Rebounds' },
 *     { key: 'apg', label: 'Assists' }
 *   ]}
 * />
 */

export interface ComparisonItem {
  id: string
  name: string
  photoUrl?: string
  stats: Record<string, number>
}

export interface StatKey {
  key: string
  label: string
}

const comparisonCardVariants = cva('', {
  variants: {
    variant: {
      horizontal: '',
      vertical: '',
    },
  },
  defaultVariants: {
    variant: 'horizontal',
  },
})

export interface ComparisonCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof comparisonCardVariants> {
  entityA: ComparisonItem
  entityB: ComparisonItem
  statKeys: StatKey[]
  variant?: 'horizontal' | 'vertical'
}

/**
 * Photo d'entité avec fallback initiales
 */
function EntityPhoto({ name, photoUrl }: { name: string; photoUrl?: string }) {
  const [imageError, setImageError] = React.useState(false)

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (!photoUrl || imageError) {
    return (
      <div className="w-12 h-12 rounded-full bg-[var(--color-gray-900)] flex items-center justify-center text-[var(--color-gray-500)] font-[var(--font-bold)] text-sm">
        {initials}
      </div>
    )
  }

  return (
    <img
      src={photoUrl}
      alt={`Photo de ${name}`}
      className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-gray-800)]"
      onError={() => setImageError(true)}
    />
  )
}

/**
 * Header d'entité (photo + nom)
 */
function EntityHeader({ entity }: { entity: ComparisonItem }) {
  return (
    <div className="flex items-center gap-[var(--space-3)]">
      <EntityPhoto name={entity.name} photoUrl={entity.photoUrl} />
      <div className="text-[var(--text-base)] text-white font-[var(--font-semibold)] truncate">
        {entity.name}
      </div>
    </div>
  )
}

/**
 * Bar visuelle de comparaison
 */
function ComparisonBar({
  valueA,
  valueB,
}: {
  valueA: number
  valueB: number
}) {
  const max = Math.max(valueA, valueB)
  const percentA = max > 0 ? (valueA / max) * 100 : 0
  const percentB = max > 0 ? (valueB / max) * 100 : 0

  return (
    <div className="flex items-center gap-[var(--space-2)] h-1">
      {/* Bar A (depuis la droite) */}
      <div className="flex-1 h-full bg-[var(--color-gray-800)] rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-300"
          style={{
            width: `${percentA}%`,
            marginLeft: `${100 - percentA}%`,
          }}
        />
      </div>

      {/* Bar B (depuis la gauche) */}
      <div className="flex-1 h-full bg-[var(--color-gray-800)] rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-300"
          style={{ width: `${percentB}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Row de comparaison (horizontal layout)
 */
function HorizontalStatRow({
  statKey,
  entityA,
  entityB,
}: {
  statKey: StatKey
  entityA: ComparisonItem
  entityB: ComparisonItem
}) {
  const valueA = entityA.stats[statKey.key] ?? 0
  const valueB = entityB.stats[statKey.key] ?? 0

  const isAHigher = valueA > valueB
  const isBHigher = valueB > valueA

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-[var(--space-4)] items-center py-[var(--space-3)] border-b border-[var(--color-gray-800)] last:border-b-0">
      {/* Value A */}
      <div
        className={cn(
          'text-right font-[family-name:var(--font-mono)] text-[var(--text-base)]',
          isAHigher ? 'text-white font-[var(--font-semibold)]' : 'text-[var(--color-gray-500)]'
        )}
      >
        {valueA.toFixed(1)}
      </div>

      {/* Stat Label + Bar */}
      <div className="min-w-[120px] text-center">
        <div className="text-[var(--text-sm)] text-[var(--color-gray-400)] mb-[var(--space-2)]">
          {statKey.label}
        </div>
        <ComparisonBar valueA={valueA} valueB={valueB} />
      </div>

      {/* Value B */}
      <div
        className={cn(
          'text-left font-[family-name:var(--font-mono)] text-[var(--text-base)]',
          isBHigher ? 'text-white font-[var(--font-semibold)]' : 'text-[var(--color-gray-500)]'
        )}
      >
        {valueB.toFixed(1)}
      </div>
    </div>
  )
}

/**
 * Layout horizontal (3 colonnes)
 */
function HorizontalLayout({
  entityA,
  entityB,
  statKeys,
}: {
  entityA: ComparisonItem
  entityB: ComparisonItem
  statKeys: StatKey[]
}) {
  return (
    <div className="space-y-[var(--space-6)]">
      {/* Headers */}
      <div className="grid grid-cols-2 gap-[var(--space-8)]">
        <EntityHeader entity={entityA} />
        <EntityHeader entity={entityB} />
      </div>

      {/* Stats Rows */}
      <div>
        {statKeys.map((statKey) => (
          <HorizontalStatRow
            key={statKey.key}
            statKey={statKey}
            entityA={entityA}
            entityB={entityB}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Layout vertical (2 colonnes stacked)
 */
function VerticalLayout({
  entityA,
  entityB,
  statKeys,
}: {
  entityA: ComparisonItem
  entityB: ComparisonItem
  statKeys: StatKey[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-6)]">
      {/* Entity A */}
      <div className="space-y-[var(--space-4)]">
        <EntityHeader entity={entityA} />
        <div className="space-y-[var(--space-3)]">
          {statKeys.map((statKey) => {
            const value = entityA.stats[statKey.key] ?? 0
            return (
              <div
                key={statKey.key}
                className="flex justify-between items-center"
              >
                <span className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
                  {statKey.label}
                </span>
                <span className="text-[var(--text-base)] text-white font-[var(--font-semibold)] font-[family-name:var(--font-mono)]">
                  {value.toFixed(1)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Entity B */}
      <div className="space-y-[var(--space-4)]">
        <EntityHeader entity={entityB} />
        <div className="space-y-[var(--space-3)]">
          {statKeys.map((statKey) => {
            const value = entityB.stats[statKey.key] ?? 0
            return (
              <div
                key={statKey.key}
                className="flex justify-between items-center"
              >
                <span className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
                  {statKey.label}
                </span>
                <span className="text-[var(--text-base)] text-white font-[var(--font-semibold)] font-[family-name:var(--font-mono)]">
                  {value.toFixed(1)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const ComparisonCard = React.forwardRef<HTMLDivElement, ComparisonCardProps>(
  (
    {
      className,
      entityA,
      entityB,
      statKeys,
      variant = 'horizontal',
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant="default"
        className={cn(comparisonCardVariants({ variant }), className)}
        {...props}
      >
        {variant === 'horizontal' ? (
          <HorizontalLayout
            entityA={entityA}
            entityB={entityB}
            statKeys={statKeys}
          />
        ) : (
          <VerticalLayout
            entityA={entityA}
            entityB={entityB}
            statKeys={statKeys}
          />
        )}
      </Card>
    )
  }
)

ComparisonCard.displayName = 'ComparisonCard'
