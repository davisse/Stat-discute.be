'use client'

import { Calendar } from 'lucide-react'

interface Game {
  game_id: string
  game_date: string
  home_team: string
  away_team: string
  home_team_score: number | null
  away_team_score: number | null
  location: 'home' | 'away'
  result: 'W' | 'L'
  minutes: number
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fg_made: number
  fg_attempted: number
  fg3_made: number
  fg3_attempted: number
  ft_made: number
  ft_attempted: number
}

interface GameLogTableProps {
  games: Game[]
  playerTeam: string
}

export function GameLogTable({ games, playerTeam }: GameLogTableProps) {
  if (games.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Recent Games
        </h2>
        <p className="text-gray-400 text-center py-8">
          No game data available yet
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-950 px-4 py-3 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Recent Games (Last 10)
        </h2>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden">
        {games.map((game) => {
          const gameDate = new Date(game.game_date)
          const formattedDate = gameDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })

          const opponent = game.location === 'home' ? game.away_team : game.home_team
          const fg_pct = game.fg_attempted > 0
            ? ((game.fg_made / game.fg_attempted) * 100).toFixed(1)
            : '0.0'

          return (
            <div
              key={game.game_id}
              className="p-4 border-b border-gray-800 last:border-0"
            >
              {/* Game Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded ${
                      game.result === 'W'
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}
                  >
                    {game.result}
                  </span>
                  <span className="text-sm text-gray-400">{formattedDate}</span>
                  <span className="text-xs text-gray-500">
                    {game.location === 'home' ? 'vs' : '@'} {opponent}
                  </span>
                </div>
                {game.home_team_score !== null && game.away_team_score !== null && (
                  <div className="text-xs text-gray-500">
                    {game.home_team_score}-{game.away_team_score}
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{game.points}</div>
                  <div className="text-xs text-gray-500">PTS</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{game.rebounds}</div>
                  <div className="text-xs text-gray-500">REB</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{game.assists}</div>
                  <div className="text-xs text-gray-500">AST</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{game.minutes}'</div>
                  <div className="text-xs text-gray-500">MIN</div>
                </div>
              </div>

              {/* Shooting */}
              <div className="mt-3 pt-3 border-t border-gray-800">
                <div className="flex items-center justify-around text-xs">
                  <div>
                    <span className="text-gray-500">FG:</span>{' '}
                    <span className="text-white font-medium">
                      {game.fg_made}/{game.fg_attempted} ({fg_pct}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">3P:</span>{' '}
                    <span className="text-white font-medium">
                      {game.fg3_made}/{game.fg3_attempted}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">FT:</span>{' '}
                    <span className="text-white font-medium">
                      {game.ft_made}/{game.ft_attempted}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-950 border-b border-gray-800">
            <tr className="text-xs text-gray-400 uppercase">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Opponent</th>
              <th className="px-4 py-3 text-center">Result</th>
              <th className="px-4 py-3 text-center">MIN</th>
              <th className="px-4 py-3 text-center">PTS</th>
              <th className="px-4 py-3 text-center">REB</th>
              <th className="px-4 py-3 text-center">AST</th>
              <th className="px-4 py-3 text-center">FG</th>
              <th className="px-4 py-3 text-center">3P</th>
              <th className="px-4 py-3 text-center">FT</th>
              <th className="px-4 py-3 text-center">+/-</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => {
              const gameDate = new Date(game.game_date)
              const formattedDate = gameDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })

              const opponent = game.location === 'home' ? game.away_team : game.home_team
              const fg_pct = game.fg_attempted > 0
                ? ((game.fg_made / game.fg_attempted) * 100).toFixed(1)
                : '0.0'
              const three_pct = game.fg3_attempted > 0
                ? ((game.fg3_made / game.fg3_attempted) * 100).toFixed(1)
                : '0.0'
              const ft_pct = game.ft_attempted > 0
                ? ((game.ft_made / game.ft_attempted) * 100).toFixed(1)
                : '0.0'

              return (
                <tr
                  key={game.game_id}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-300">{formattedDate}</td>
                  <td className="px-4 py-3 text-sm text-white">
                    {game.location === 'home' ? 'vs' : '@'} {opponent}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded ${
                        game.result === 'W'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {game.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-white">{game.minutes}</td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-white">
                    {game.points}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-white">{game.rebounds}</td>
                  <td className="px-4 py-3 text-center text-sm text-white">{game.assists}</td>
                  <td className="px-4 py-3 text-center text-sm text-white">
                    {game.fg_made}/{game.fg_attempted}
                    <span className="text-xs text-gray-500 ml-1">({fg_pct}%)</span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-white">
                    {game.fg3_made}/{game.fg3_attempted}
                    <span className="text-xs text-gray-500 ml-1">({three_pct}%)</span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-white">
                    {game.ft_made}/{game.ft_attempted}
                    <span className="text-xs text-gray-500 ml-1">({ft_pct}%)</span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">-</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
