import { Trophy } from 'lucide-react'

interface PlayerCardProps {
  title: string
  player: {
    full_name: string
    team_abbreviation: string
    value: number
    games_played: number
  }
  unit?: string
}

export function PlayerCard({ title, player, unit }: PlayerCardProps) {
  return (
    <div
      className="border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-all duration-300"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          {title}
        </span>
      </div>

      {/* Player Name */}
      <p className="text-2xl font-bold text-white mb-3">{player.full_name}</p>

      {/* Team & Value */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-mono text-zinc-400">{player.team_abbreviation}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-white font-mono">
            {player.value.toFixed(1)}
          </span>
          {unit && (
            <span className="text-sm font-medium text-zinc-500 uppercase">{unit}</span>
          )}
        </div>
      </div>

      {/* Games Played */}
      <p className="text-xs text-zinc-500">{player.games_played} matchs joués</p>
    </div>
  )
}
