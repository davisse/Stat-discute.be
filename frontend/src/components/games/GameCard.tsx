'use client'

import { useRouter } from 'next/navigation'
import { Trophy } from 'lucide-react'
import type { GameWithOdds } from '@/lib/queries'

interface GameCardProps {
  game: GameWithOdds
}

function formatTime(gameTime: string | null): string {
  // game_time is already in HH:MM format from the query
  if (gameTime && gameTime.includes(':')) {
    return gameTime
  }
  return 'TBD'
}

export function GameCard({ game }: GameCardProps) {
  const router = useRouter()
  const isCompleted = game.status === 'Final'
  const homeWon = isCompleted && (game.home_score ?? 0) > (game.away_score ?? 0)
  const awayWon = isCompleted && (game.away_score ?? 0) > (game.home_score ?? 0)

  const handleClick = () => {
    router.push(`/games/${game.game_id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="
        group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-4
        cursor-pointer transition-all duration-200
        hover:border-zinc-600 hover:bg-zinc-900/70
      "
    >
      {/* Time / Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          isCompleted
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {isCompleted ? 'Final' : formatTime(game.game_time)}
        </span>
        <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
      </div>

      {/* Teams */}
      <div className="space-y-2">
        {/* Away Team */}
        <div className={`flex items-center justify-between ${awayWon ? 'text-white' : 'text-zinc-400'}`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-600 w-6">VIS</span>
            <span className="font-bold">{game.away_team_abbr}</span>
            <span className="text-xs text-zinc-500 hidden sm:inline truncate max-w-[100px]">
              {game.away_team_name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {isCompleted ? (
              <>
                <span className={`font-mono text-lg ${awayWon ? 'font-bold' : ''}`}>
                  {game.away_score}
                </span>
                {awayWon && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
              </>
            ) : (
              <span className="text-zinc-600 text-sm">-</span>
            )}
          </div>
        </div>

        {/* Home Team */}
        <div className={`flex items-center justify-between ${homeWon ? 'text-white' : 'text-zinc-400'}`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-600 w-6">DOM</span>
            <span className="font-bold">{game.home_team_abbr}</span>
            <span className="text-xs text-zinc-500 hidden sm:inline truncate max-w-[100px]">
              {game.home_team_name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {isCompleted ? (
              <>
                <span className={`font-mono text-lg ${homeWon ? 'font-bold' : ''}`}>
                  {game.home_score}
                </span>
                {homeWon && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
              </>
            ) : (
              <span className="text-zinc-600 text-sm">-</span>
            )}
          </div>
        </div>
      </div>

      {/* Odds Line (if available) */}
      {(game.spread_home || game.total) && (
        <div className="mt-3 pt-2 border-t border-zinc-800/50 flex items-center gap-3 text-xs text-zinc-500">
          {game.spread_home && (
            <span className="font-mono">
              {game.home_team_abbr} {game.spread_home > 0 ? '+' : ''}{game.spread_home}
            </span>
          )}
          {game.spread_home && game.total && <span className="text-zinc-700">|</span>}
          {game.total && (
            <span className="font-mono">O/U {game.total}</span>
          )}
        </div>
      )}
    </div>
  )
}
