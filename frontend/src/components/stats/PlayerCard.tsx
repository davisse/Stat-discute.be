'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

/**
 * PlayerCard Component
 *
 * Carte joueur avec photo, nom, équipe, et statistiques clés.
 * Design minimaliste monochrome avec mise en valeur des stats numériques.
 *
 * @param player - Objet joueur avec id, name, team, number, position, photoUrl, stats
 * @param variant - Taille du card: 'compact' | 'detailed'
 * @param onClick - Handler de clic (rend le card cliquable)
 * @param showStats - Afficher les statistiques (défaut: true)
 *
 * @example
 * // PlayerCard compact sans stats
 * <PlayerCard
 *   player={{
 *     id: '123',
 *     name: 'LeBron James',
 *     team: 'LAL',
 *     number: 23,
 *     position: 'SF'
 *   }}
 *   variant="compact"
 *   showStats={false}
 * />
 *
 * @example
 * // PlayerCard detailed cliquable avec stats
 * <PlayerCard
 *   player={{
 *     id: '123',
 *     name: 'LeBron James',
 *     team: 'LAL',
 *     number: 23,
 *     position: 'SF',
 *     photoUrl: '/players/lebron.jpg',
 *     stats: { ppg: 28.5, rpg: 7.2, apg: 8.1 }
 *   }}
 *   variant="detailed"
 *   onClick={() => navigate(`/players/123`)}
 * />
 */

export interface Player {
  id: string
  name: string
  team: string
  number: number
  position: string
  photoUrl?: string
  stats?: {
    ppg?: number
    rpg?: number
    apg?: number
  }
}

const playerCardVariants = cva('', {
  variants: {
    variant: {
      compact: 'max-w-[320px]',
      detailed: 'max-w-[400px]',
    },
  },
  defaultVariants: {
    variant: 'detailed',
  },
})

export interface PlayerCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>,
    VariantProps<typeof playerCardVariants> {
  player: Player
  variant?: 'compact' | 'detailed'
  onClick?: () => void
  showStats?: boolean
}

/**
 * Badge pour position du joueur
 */
function PositionBadge({ position }: { position: string }) {
  return (
    <span className="inline-flex items-center px-[var(--space-2)] py-[4px] bg-[var(--color-gray-800)] text-[var(--text-xs)] text-[var(--color-gray-400)] rounded-[var(--radius-sm)] font-[var(--font-medium)]">
      {position}
    </span>
  )
}

/**
 * Photo du joueur avec fallback initiales
 */
function PlayerPhoto({
  name,
  photoUrl,
  size,
}: {
  name: string
  photoUrl?: string
  size: number
}) {
  const [imageError, setImageError] = React.useState(false)

  // Extraire initiales du nom
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (!photoUrl || imageError) {
    return (
      <div
        className="flex items-center justify-center bg-[var(--color-gray-900)] rounded-[var(--radius-lg)] text-[var(--color-gray-500)] font-[var(--font-bold)]"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${size / 3}px`,
        }}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={photoUrl}
      alt={`Photo de ${name}`}
      className="rounded-[var(--radius-lg)] object-cover border-2 border-[var(--color-gray-800)]"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      onError={() => setImageError(true)}
    />
  )
}

/**
 * Grid de statistiques
 */
function StatsGrid({ stats }: { stats: Player['stats'] }) {
  if (!stats) return null

  const statItems = [
    { label: 'PPG', value: stats.ppg },
    { label: 'RPG', value: stats.rpg },
    { label: 'APG', value: stats.apg },
  ].filter((item) => item.value !== undefined)

  if (statItems.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-[var(--space-4)] mt-[var(--space-4)] pt-[var(--space-4)] border-t border-[var(--color-gray-800)]">
      {statItems.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-[var(--text-base)] text-white font-[var(--font-semibold)] font-[family-name:var(--font-mono)]">
            {stat.value?.toFixed(1)}
          </div>
          <div className="text-[var(--text-xs)] text-[var(--color-gray-500)] mt-[var(--space-1)]">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}

export const PlayerCard = React.forwardRef<HTMLDivElement, PlayerCardProps>(
  (
    {
      className,
      player,
      variant = 'detailed',
      onClick,
      showStats = true,
      ...props
    },
    ref
  ) => {
    const isCompact = variant === 'compact'
    const photoSize = isCompact ? 64 : 80
    const padding = isCompact ? 'sm' : 'md'

    return (
      <Card
        ref={ref}
        variant="anthracite"
        padding={padding}
        onClick={onClick}
        className={cn(playerCardVariants({ variant }), className)}
        {...props}
      >
        {/* Header: Photo + Infos */}
        <div className="flex items-center gap-[var(--space-4)]">
          <PlayerPhoto
            name={player.name}
            photoUrl={player.photoUrl}
            size={photoSize}
          />

          <div className="flex-1 min-w-0">
            {/* Nom */}
            <h3 className="text-[var(--text-lg)] text-white font-[var(--font-semibold)] truncate">
              {player.name}
            </h3>

            {/* Équipe + Numéro */}
            <p className="text-[var(--text-sm)] text-[var(--color-gray-400)] mt-[var(--space-1)]">
              {player.team} #{player.number}
            </p>

            {/* Position Badge */}
            <div className="mt-[var(--space-2)]">
              <PositionBadge position={player.position} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {showStats && !isCompact && <StatsGrid stats={player.stats} />}
      </Card>
    )
  }
)

PlayerCard.displayName = 'PlayerCard'
