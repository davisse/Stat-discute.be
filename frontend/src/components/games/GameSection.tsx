'use client'

import type { GameWithOdds } from '@/lib/queries'
import { GameCard } from './GameCard'

interface GameSectionProps {
  title: string
  subtitle?: string
  games: GameWithOdds[]
  emptyMessage?: string
}

export function GameSection({ title, subtitle, games, emptyMessage = 'Aucun match' }: GameSectionProps) {
  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-lg font-bold text-white uppercase tracking-wide">
          {title}
        </h2>
        <span className="text-sm text-zinc-500">
          {games.length} match{games.length > 1 ? 's' : ''}
        </span>
        {subtitle && (
          <span className="text-xs text-zinc-600 ml-auto">{subtitle}</span>
        )}
      </div>

      {/* Games Grid */}
      {games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {games.map((game) => (
            <GameCard key={game.game_id} game={game} />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 text-center">
          <p className="text-zinc-500 text-sm">{emptyMessage}</p>
        </div>
      )}
    </section>
  )
}
