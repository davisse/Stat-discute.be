'use client'

import { useState } from 'react'

export interface GamelogEntry {
  game_id: string
  game_date: string
  opponent: string
  is_home: boolean
  result: 'W' | 'L' | null
  team_score: number | null
  opponent_score: number | null
  played: boolean
  minutes: number | null
  points: number | null
  rebounds: number | null
  assists: number | null
  steals: number | null
  blocks: number | null
  turnovers: number | null
  fg_made: number | null
  fg_attempted: number | null
  three_made: number | null
  three_attempted: number | null
  ft_made: number | null
  ft_attempted: number | null
  plus_minus: number | null
}

interface PlayerGamelogsTableProps {
  gamelogs: GamelogEntry[]
  initialLimit?: number
  showAllDefault?: boolean
  season?: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.toLocaleDateString('en-US', { month: 'short' }).charAt(0)
  const day = date.getDate()
  return `${month}${day}`
}

export default function PlayerGamelogsTable({
  gamelogs,
  initialLimit = 10,
  showAllDefault = false,
  season = '2025-26'
}: PlayerGamelogsTableProps) {
  const [showAll, setShowAll] = useState(showAllDefault)

  const displayedGames = showAll ? gamelogs : gamelogs.slice(0, initialLimit)
  const totalGames = gamelogs.length
  const hasMore = totalGames > initialLimit

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase" style={{ letterSpacing: '-0.05em' }}>
            Game
          </h2>
          <span className="text-2xl md:text-4xl font-light text-zinc-600 uppercase" style={{ letterSpacing: '-0.05em' }}>
            Log
          </span>
        </div>
        <span className="text-xs text-zinc-500">
          Season {season}
        </span>
      </div>

      {/* Table Container with horizontal scroll */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            {/* Header */}
            <thead>
              <tr className="bg-zinc-900 text-zinc-400 text-xs uppercase">
                <th className="sticky left-0 bg-zinc-900 px-3 py-3 text-left font-medium z-10">Date</th>
                <th className="sticky left-[72px] bg-zinc-900 px-3 py-3 text-left font-medium z-10">Opp</th>
                <th className="px-3 py-3 text-center font-medium">Result</th>
                <th className="px-3 py-3 text-center font-medium">Min</th>
                <th className="px-3 py-3 text-center font-medium">Pts</th>
                <th className="px-3 py-3 text-center font-medium">Reb</th>
                <th className="px-3 py-3 text-center font-medium">Ast</th>
                <th className="px-3 py-3 text-center font-medium">Stl</th>
                <th className="px-3 py-3 text-center font-medium">Blk</th>
                <th className="px-3 py-3 text-center font-medium">Tov</th>
                <th className="px-3 py-3 text-center font-medium">FG</th>
                <th className="px-3 py-3 text-center font-medium">3P</th>
                <th className="px-3 py-3 text-center font-medium">FT</th>
                <th className="px-3 py-3 text-center font-medium">+/-</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {displayedGames.map((game) => {
                const resultColor = game.result === 'W'
                  ? 'text-emerald-400'
                  : game.result === 'L'
                    ? 'text-red-400'
                    : 'text-zinc-500'

                const plusMinusColor = game.plus_minus !== null
                  ? game.plus_minus > 0
                    ? 'text-emerald-400'
                    : game.plus_minus < 0
                      ? 'text-red-400'
                      : 'text-zinc-400'
                  : 'text-zinc-600'

                const rowClass = !game.played
                  ? 'bg-zinc-950 text-zinc-600 italic'
                  : 'bg-zinc-950 hover:bg-zinc-900/50'

                return (
                  <tr key={game.game_id} className={`${rowClass} border-b border-zinc-800/50 last:border-b-0`}>
                    {/* Date - Sticky */}
                    <td className="sticky left-0 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-300 font-mono z-10">
                      {formatDate(game.game_date)}
                    </td>

                    {/* Opponent - Sticky */}
                    <td className="sticky left-[72px] bg-zinc-950 px-3 py-2.5 text-sm font-medium z-10">
                      <span className="text-zinc-500">{game.is_home ? 'vs' : '@'}</span>
                      <span className="text-white ml-1">{game.opponent}</span>
                    </td>

                    {/* Result */}
                    <td className={`px-3 py-2.5 text-sm text-center font-mono ${resultColor}`}>
                      {game.played && game.result ? (
                        <>
                          {game.result} {game.team_score}-{game.opponent_score}
                        </>
                      ) : (
                        <span className="text-zinc-600">DNP</span>
                      )}
                    </td>

                    {/* Stats */}
                    <td className="px-3 py-2.5 text-sm text-center font-mono text-zinc-300">
                      {game.played ? (game.minutes ?? '-') : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-center font-mono text-white font-medium">
                      {game.played ? (game.points ?? '-') : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-center font-mono text-zinc-300">
                      {game.played ? (game.rebounds ?? '-') : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-center font-mono text-zinc-300">
                      {game.played ? (game.assists ?? '-') : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-center font-mono text-zinc-300">
                      {game.played ? (game.steals ?? '-') : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-center font-mono text-zinc-300">
                      {game.played ? (game.blocks ?? '-') : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-center font-mono text-zinc-300">
                      {game.played ? (game.turnovers ?? '-') : '-'}
                    </td>

                    {/* FG */}
                    <td className="px-3 py-2.5 text-sm text-center font-mono text-zinc-300">
                      {game.played && game.fg_made !== null && game.fg_attempted !== null
                        ? `${game.fg_made}-${game.fg_attempted}`
                        : '-'}
                    </td>

                    {/* 3P */}
                    <td className="px-3 py-2.5 text-sm text-center font-mono text-zinc-300">
                      {game.played && game.three_made !== null && game.three_attempted !== null
                        ? `${game.three_made}-${game.three_attempted}`
                        : '-'}
                    </td>

                    {/* FT */}
                    <td className="px-3 py-2.5 text-sm text-center font-mono text-zinc-300">
                      {game.played && game.ft_made !== null && game.ft_attempted !== null
                        ? `${game.ft_made}-${game.ft_attempted}`
                        : '-'}
                    </td>

                    {/* +/- */}
                    <td className={`px-3 py-2.5 text-sm text-center font-mono font-medium ${plusMinusColor}`}>
                      {game.played && game.plus_minus !== null
                        ? (game.plus_minus > 0 ? `+${game.plus_minus}` : game.plus_minus)
                        : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer with View All toggle */}
        {hasMore && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
            <span className="text-xs text-zinc-500">
              Showing {displayedGames.length} of {totalGames} games
            </span>
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              {showAll ? 'Show Less' : 'View All'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
