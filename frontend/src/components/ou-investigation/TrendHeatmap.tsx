'use client'

import { useState, useMemo } from 'react'

interface TrendCategory {
  label: string
  shortLabel: string
  games: TrendGame[]
}

interface TrendGame {
  gameId: string
  date: string
  opponent: string
  isOver: boolean
  total: number
  line: number
  margin: number // How much over/under the line
}

interface TrendHeatmapProps {
  homeTeamAbbr: string
  awayTeamAbbr: string
  homeTeamTrends: TrendCategory[]
  awayTeamTrends: TrendCategory[]
}

export function TrendHeatmap({
  homeTeamAbbr,
  awayTeamAbbr,
  homeTeamTrends,
  awayTeamTrends
}: TrendHeatmapProps) {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | 'both'>('both')
  const [hoveredCell, setHoveredCell] = useState<{ team: 'home' | 'away'; category: number; game: number } | null>(null)
  const [tappedCell, setTappedCell] = useState<{ team: 'home' | 'away'; category: number; game: number } | null>(null)

  // Find max games for consistent columns
  const maxGames = useMemo(() => {
    const homeMax = Math.max(...homeTeamTrends.map(t => t.games.length), 0)
    const awayMax = Math.max(...awayTeamTrends.map(t => t.games.length), 0)
    return Math.max(homeMax, awayMax, 5)
  }, [homeTeamTrends, awayTeamTrends])

  // Calculate max margin for dynamic intensity scaling
  const maxMargin = useMemo(() => {
    const allGames = [...homeTeamTrends, ...awayTeamTrends].flatMap(c => c.games)
    const max = Math.max(...allGames.map(g => Math.abs(g.margin)), 1)
    return Math.max(max, 20) // Minimum 20 for reasonable scaling
  }, [homeTeamTrends, awayTeamTrends])

  const activeCell = tappedCell || hoveredCell

  // Calculate summary stats for displayed team(s)
  const summary = useMemo(() => {
    const trends = selectedTeam === 'home'
      ? homeTeamTrends
      : selectedTeam === 'away'
        ? awayTeamTrends
        : [...homeTeamTrends, ...awayTeamTrends]

    return trends.reduce((acc, category) => {
      const overs = category.games.filter(g => g.isOver).length
      return {
        totalGames: acc.totalGames + category.games.length,
        totalOvers: acc.totalOvers + overs
      }
    }, { totalGames: 0, totalOvers: 0 })
  }, [homeTeamTrends, awayTeamTrends, selectedTeam])

  const overPct = summary.totalGames > 0
    ? Math.round((summary.totalOvers / summary.totalGames) * 100)
    : 50

  const renderTeamGrid = (
    trends: TrendCategory[],
    teamAbbr: string,
    teamKey: 'home' | 'away'
  ) => (
    <div className="mb-4 last:mb-0">
      {/* Team Header for "both" mode */}
      {selectedTeam === 'both' && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white">
            {teamAbbr}
          </span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>
      )}

      {/* Category Rows */}
      {trends.map((category, categoryIdx) => (
        <div key={category.label} className="flex items-center mb-1">
          {/* Category Label */}
          <div className="w-16 sm:w-24 flex-shrink-0 pr-2">
            <span className="text-[9px] sm:text-[11px] text-zinc-500 font-medium truncate block sm:hidden" title={category.label}>
              {category.shortLabel}
            </span>
            <span className="text-[9px] sm:text-[11px] text-zinc-500 font-medium truncate hidden sm:block" title={category.label}>
              {category.label}
            </span>
          </div>

          {/* Heat Cells */}
          <div className="flex-1 flex gap-0.5 sm:gap-1">
            {Array.from({ length: maxGames }, (_, gameIdx) => {
              const reversedIdx = maxGames - 1 - gameIdx
              const game = category.games[reversedIdx]
              const isActive = activeCell?.team === teamKey &&
                               activeCell?.category === categoryIdx &&
                               activeCell?.game === gameIdx

              if (!game) {
                return (
                  <div
                    key={gameIdx}
                    className="flex-1 h-7 sm:h-9 bg-zinc-800/20 rounded-sm"
                  />
                )
              }

              // Dynamic intensity based on actual data range
              const intensity = Math.min(Math.abs(game.margin) / maxMargin, 1)
              const bgColor = game.isOver
                ? `rgba(255, 255, 255, ${0.1 + intensity * 0.25})`  // White with intensity
                : `rgba(82, 82, 91, ${0.3 + intensity * 0.4})`      // Zinc-600 with intensity

              return (
                <button
                  key={gameIdx}
                  type="button"
                  aria-label={`${category.shortLabel} vs ${game.opponent}: ${game.isOver ? 'Over' : 'Under'} de ${Math.abs(game.margin)} points`}
                  className={`flex-1 h-7 sm:h-9 rounded-sm cursor-pointer transition-all flex items-center justify-center ${
                    isActive ? 'ring-2 ring-white scale-110 z-10' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: bgColor }}
                  onMouseEnter={() => setHoveredCell({ team: teamKey, category: categoryIdx, game: gameIdx })}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => setTappedCell(
                    tappedCell?.team === teamKey && tappedCell?.category === categoryIdx && tappedCell?.game === gameIdx
                      ? null
                      : { team: teamKey, category: categoryIdx, game: gameIdx }
                  )}
                >
                  <span className={`text-[9px] sm:text-[10px] font-bold ${game.isOver ? 'text-white' : 'text-zinc-400'}`} aria-hidden="true">
                    {game.isOver ? 'O' : 'U'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <section className="mt-6 sm:mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-600 tracking-widest">03</span>
          <div className="w-8 h-px bg-zinc-700" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
          Heatmap des Tendances
        </h2>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
        {/* Team Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <TeamTab
            label="Les deux"
            isActive={selectedTeam === 'both'}
            onClick={() => setSelectedTeam('both')}
          />
          <TeamTab
            label={awayTeamAbbr}
            isActive={selectedTeam === 'away'}
            onClick={() => setSelectedTeam('away')}
          />
          <TeamTab
            label={homeTeamAbbr}
            isActive={selectedTeam === 'home'}
            onClick={() => setSelectedTeam('home')}
          />

          {/* Summary - Inline on larger screens */}
          <div className="ml-auto text-[10px] sm:text-xs text-zinc-500">
            <span className={`font-bold ${overPct >= 50 ? 'text-white' : 'text-zinc-500'}`}>
              {overPct}%
            </span>
            <span className="ml-1 hidden sm:inline">Over sur {summary.totalGames} matchs</span>
            <span className="ml-1 sm:hidden">O</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[280px]">
            {/* Column indicator - dots instead of numbers */}
            <div className="flex mb-2">
              <div className="w-16 sm:w-24 flex-shrink-0" />
              <div className="flex-1 flex gap-0.5 sm:gap-1 items-center">
                <span className="text-[8px] text-zinc-700">ancien</span>
                <div className="flex-1 flex justify-center gap-1">
                  {Array.from({ length: Math.min(maxGames, 3) }, (_, i) => (
                    <span key={i} className="w-1 h-1 rounded-full bg-zinc-700" />
                  ))}
                </div>
                <span className="text-[8px] text-zinc-700">récent</span>
              </div>
            </div>

            {/* Render grids based on selection */}
            {(selectedTeam === 'away' || selectedTeam === 'both') &&
              renderTeamGrid(awayTeamTrends, awayTeamAbbr, 'away')}
            {(selectedTeam === 'home' || selectedTeam === 'both') &&
              renderTeamGrid(homeTeamTrends, homeTeamAbbr, 'home')}

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-zinc-800/50 text-[9px] text-zinc-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-white/15" />
                <span className="w-3 h-3 rounded-sm bg-white/35" />
                Over
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-zinc-600/40" />
                <span className="w-3 h-3 rounded-sm bg-zinc-600/70" />
                Under
              </span>
              <span className="text-zinc-700">|</span>
              <span>Intensité = marge</span>
            </div>
          </div>
        </div>

        {/* Selected Cell Detail - Mobile Optimized */}
        {activeCell && (() => {
          const trends = activeCell.team === 'home' ? homeTeamTrends : awayTeamTrends
          const abbr = activeCell.team === 'home' ? homeTeamAbbr : awayTeamAbbr
          const category = trends[activeCell.category]
          const reversedIdx = maxGames - 1 - activeCell.game
          const game = category?.games[reversedIdx]

          if (!game) return null

          return (
            <div className="mt-4 p-3 bg-black/40 border border-zinc-800 rounded-lg">
              {/* Row 1: Teams and date */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-white">
                    {abbr}
                  </span>
                  <span className="text-[10px] text-zinc-600">vs</span>
                  <span className="text-xs text-zinc-400">{game.opponent}</span>
                </div>
                <span className="text-[10px] text-zinc-600">{game.date}</span>
              </div>

              {/* Row 2: Category and result */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="text-zinc-500">{category.shortLabel}</span>
                <span className={`font-bold ${game.isOver ? 'text-white' : 'text-zinc-500'}`}>
                  {game.isOver ? 'OVER' : 'UNDER'}
                </span>
                <span className="text-zinc-400 tabular-nums">
                  {game.total} pts
                </span>
                <span className="text-zinc-600 tabular-nums">
                  ligne {game.line}
                </span>
                <span className={`font-medium tabular-nums ${game.isOver ? 'text-white' : 'text-zinc-500'}`}>
                  {game.margin > 0 ? '+' : ''}{game.margin}
                </span>
              </div>
            </div>
          )
        })()}

        {/* Insight Box */}
        <div className="mt-4 p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
              L'intensité des couleurs reflète la marge par rapport à la ligne.
              <span className="text-zinc-500"> Plus c'est foncé, plus le résultat était décisif.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function TeamTab({
  label,
  isActive,
  onClick
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
        isActive
          ? 'bg-white/20 border-white/50 text-white'
          : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
      }`}
    >
      {label}
    </button>
  )
}

export default TrendHeatmap
