'use client'

import { useState } from 'react'

interface H2HGame {
  gameId: string
  date: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  total: number
  line: number
  isOver: boolean
  venue: string
}

interface H2HHistoryProps {
  homeTeamAbbr: string
  awayTeamAbbr: string
  games: H2HGame[]
  currentLine: number
}

export function H2HHistory({
  homeTeamAbbr,
  awayTeamAbbr,
  games,
  currentLine
}: H2HHistoryProps) {
  const [expandedGame, setExpandedGame] = useState<string | null>(null)

  // Calculate summary stats
  const totalGames = games.length
  const overGames = games.filter(g => g.isOver).length
  const underGames = totalGames - overGames
  const overPct = totalGames > 0 ? Math.round((overGames / totalGames) * 100) : 50
  const avgTotal = totalGames > 0
    ? (games.reduce((sum, g) => sum + g.total, 0) / totalGames).toFixed(1)
    : '0'

  // Home wins when homeTeamAbbr is home team
  const homeWins = games.filter(g => {
    if (g.homeTeam === homeTeamAbbr) {
      return g.homeScore > g.awayScore
    } else {
      return g.awayScore > g.homeScore
    }
  }).length

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    })
  }

  return (
    <section className="mt-6 sm:mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-600 tracking-widest">07</span>
          <div className="w-8 h-px bg-zinc-700" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
          Historique H2H
        </h2>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Total Games */}
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Matchs</div>
            <div className="text-xl font-bold text-white tabular-nums">{totalGames}</div>
          </div>

          {/* Average Total */}
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Moy. Total</div>
            <div className="text-xl font-bold text-white tabular-nums">{avgTotal}</div>
          </div>

          {/* Over/Under Record */}
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Over/Under</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg font-bold text-white tabular-nums">{overGames}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-lg font-bold text-zinc-500 tabular-nums">{underGames}</span>
            </div>
          </div>

          {/* Series Record */}
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Série</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg font-bold text-white tabular-nums">
                {homeWins}
              </span>
              <span className="text-zinc-600">-</span>
              <span className="text-lg font-bold text-zinc-400 tabular-nums">
                {totalGames - homeWins}
              </span>
            </div>
          </div>
        </div>

        {/* Games List - Mobile Optimized */}
        <div className="space-y-2">
          {games.map((game) => {
            const isExpanded = expandedGame === game.gameId
            const winner = game.homeScore > game.awayScore ? game.homeTeam : game.awayTeam
            const margin = game.total - game.line

            return (
              <button
                key={game.gameId}
                onClick={() => setExpandedGame(isExpanded ? null : game.gameId)}
                className="w-full text-left"
              >
                <div
                  className={`bg-black/20 border rounded-lg p-3 transition-all ${
                    isExpanded
                      ? 'border-zinc-600 bg-black/40'
                      : 'border-zinc-800/50 hover:border-zinc-700 active:bg-black/30'
                  }`}
                >
                  {/* Main Row */}
                  <div className="flex items-center justify-between">
                    {/* Date & Teams */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-600 w-16 sm:w-20 flex-shrink-0">
                        {formatDate(game.date)}
                      </span>

                      {/* Teams with scores */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white">
                            {game.awayTeam}
                          </span>
                          <span className="text-xs text-zinc-400 tabular-nums">{game.awayScore}</span>
                        </div>
                        <span className="text-[10px] text-zinc-600">@</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-zinc-300">
                            {game.homeTeam}
                          </span>
                          <span className="text-xs text-zinc-400 tabular-nums">{game.homeScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Total & O/U */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-white tabular-nums">{game.total}</div>
                        <div className="text-[9px] text-zinc-600 tabular-nums">L: {game.line}</div>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          game.isOver
                            ? 'bg-white/15 text-white'
                            : 'bg-zinc-600/30 text-zinc-500'
                        }`}
                      >
                        {game.isOver ? 'O' : 'U'}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/50">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-zinc-600">Gagnant: </span>
                          <span className="font-bold text-white">
                            {winner}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-600">Marge O/U: </span>
                          <span
                            className={`font-bold tabular-nums ${
                              margin > 0 ? 'text-white' : 'text-zinc-400'
                            }`}
                          >
                            {margin > 0 ? '+' : ''}{margin.toFixed(1)}
                          </span>
                        </div>
                        <div className="col-span-2 sm:col-span-2">
                          <span className="text-zinc-600">Lieu: </span>
                          <span className="text-zinc-400">{game.venue}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Empty State */}
        {games.length === 0 && (
          <div className="text-center py-8">
            <div className="text-zinc-600 text-sm">Aucun historique H2H disponible</div>
          </div>
        )}

        {/* Comparison to Current Line */}
        {games.length > 0 && (
          <div className="mt-4 p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-xs text-zinc-400">
                  Ligne actuelle: <span className="text-white font-bold">{currentLine}</span>
                </span>
              </div>
              <div className="text-xs">
                <span className="text-zinc-500">Historique H2H: </span>
                <span
                  className={`font-bold ${
                    parseFloat(avgTotal) > currentLine ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  {parseFloat(avgTotal) > currentLine ? 'Favorise OVER' : 'Favorise UNDER'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Insight Box */}
        <div className="mt-4 p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
              Historique des {totalGames} dernières confrontations entre {homeTeamAbbr} et {awayTeamAbbr}.
              <span className="text-zinc-500"> Cliquez sur un match pour voir les détails.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default H2HHistory
