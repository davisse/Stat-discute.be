'use client'

import { useState, useMemo } from 'react'

interface HistoricalTotal {
  gameId: string
  date: string
  opponent: string
  total: number
  isOver: boolean
  line: number
}

interface LineSpectrumProps {
  homeTeamAbbr: string
  awayTeamAbbr: string
  homeTeamGames: HistoricalTotal[]
  awayTeamGames: HistoricalTotal[]
  currentLine: number
}

// Jitter function to avoid dot overlap - creates vertical offset based on index
const getJitterOffset = (index: number, total: number): number => {
  // Create a wave pattern within ±6px to stay inside track
  const positions = [-6, -3, 0, 3, 6, 3, 0, -3]
  return positions[index % positions.length]
}

export function LineSpectrum({
  homeTeamAbbr,
  awayTeamAbbr,
  homeTeamGames,
  awayTeamGames,
  currentLine
}: LineSpectrumProps) {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | 'both'>('both')
  const [hoveredGame, setHoveredGame] = useState<(HistoricalTotal & { team: 'home' | 'away' }) | null>(null)

  // Combine data based on selection
  const displayData = useMemo(() => {
    if (selectedTeam === 'home') {
      return homeTeamGames.map(g => ({ ...g, team: 'home' as const }))
    } else if (selectedTeam === 'away') {
      return awayTeamGames.map(g => ({ ...g, team: 'away' as const }))
    }
    return [
      ...awayTeamGames.map(g => ({ ...g, team: 'away' as const })),
      ...homeTeamGames.map(g => ({ ...g, team: 'home' as const }))
    ]
  }, [homeTeamGames, awayTeamGames, selectedTeam])

  // Calculate spectrum bounds and percentiles
  const spectrum = useMemo(() => {
    if (displayData.length === 0) {
      return {
        min: currentLine - 20,
        max: currentLine + 20,
        range: 40,
        p25: currentLine - 10,
        p50: currentLine,
        p75: currentLine + 10,
        avg: currentLine
      }
    }

    const totals = displayData.map(d => d.total).sort((a, b) => a - b)
    // Ensure minimum 20 point range for better visualization
    const dataMin = Math.min(...totals)
    const dataMax = Math.max(...totals)
    const minRange = 20
    const actualRange = dataMax - dataMin
    const padding = Math.max(5, (minRange - actualRange) / 2)

    const min = Math.min(dataMin - padding, currentLine - 10)
    const max = Math.max(dataMax + padding, currentLine + 10)
    const range = max - min

    const p25Index = Math.floor(totals.length * 0.25)
    const p50Index = Math.floor(totals.length * 0.5)
    const p75Index = Math.floor(totals.length * 0.75)

    return {
      min,
      max,
      range,
      p25: totals[p25Index] || min,
      p50: totals[p50Index] || currentLine,
      p75: totals[p75Index] || max,
      avg: totals.reduce((a, b) => a + b, 0) / totals.length
    }
  }, [displayData, currentLine])

  // Calculate line position as percentage
  const linePosition = ((currentLine - spectrum.min) / spectrum.range) * 100

  // Count games above/below line
  const gamesAbove = displayData.filter(g => g.total > currentLine).length
  const gamesBelow = displayData.filter(g => g.total <= currentLine).length
  const totalGames = displayData.length
  const abovePercent = totalGames > 0 ? Math.round((gamesAbove / totalGames) * 100) : 50

  // Determine line position label
  const linePositionLabel = useMemo(() => {
    if (currentLine < spectrum.p25) return 'Très basse'
    if (currentLine < spectrum.p50) return 'Basse'
    if (currentLine <= spectrum.p75) return 'Médiane'
    return 'Haute'
  }, [currentLine, spectrum])

  // Monochrome color scheme: white for Over, zinc for Under
  const getGameColor = (game: HistoricalTotal & { team: 'home' | 'away' }) => {
    return game.isOver ? '#ffffff' : '#52525b'
  }

  return (
    <section className="mt-6 sm:mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-600 tracking-widest">05</span>
          <div className="w-8 h-px bg-zinc-700" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
          Positionnement de la Ligne
        </h2>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Team Selector */}
          <div className="flex gap-2">
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
          </div>

          {/* Line Position Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/30">
            <span className="text-[10px] text-white/70 uppercase tracking-wider">Ligne</span>
            <span className="text-lg font-black text-white tabular-nums">{currentLine}</span>
            <span className="text-[10px] text-zinc-600">({linePositionLabel})</span>
          </div>
        </div>

        {/* Spectrum Visualization */}
        <div className="relative mb-6">
          {/* Spectrum Track */}
          <div className="relative h-16 sm:h-20">
            {/* Background gradient bar */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-zinc-600/30 via-zinc-700/50 to-white/30" />

            {/* Percentile markers */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-px h-6 bg-zinc-600"
              style={{ left: `${((spectrum.p25 - spectrum.min) / spectrum.range) * 100}%` }}
            >
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-zinc-600">
                P25
              </span>
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-px h-6 bg-zinc-600"
              style={{ left: `${((spectrum.p50 - spectrum.min) / spectrum.range) * 100}%` }}
            >
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-zinc-600">
                P50
              </span>
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-px h-6 bg-zinc-600"
              style={{ left: `${((spectrum.p75 - spectrum.min) / spectrum.range) * 100}%` }}
            >
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-zinc-600">
                P75
              </span>
            </div>

            {/* Game dots with jitter to avoid overlap */}
            {displayData.map((game, idx) => {
              const position = ((game.total - spectrum.min) / spectrum.range) * 100
              const isHovered = hoveredGame?.gameId === game.gameId
              const jitter = getJitterOffset(idx, displayData.length)

              return (
                <button
                  key={`${game.gameId}-${idx}`}
                  className={`absolute rounded-full transition-all ${
                    isHovered ? 'z-20 scale-150' : 'z-10 hover:scale-125'
                  }`}
                  style={{
                    left: `${Math.min(Math.max(position, 2), 98)}%`,
                    top: `calc(50% + ${jitter}px)`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: getGameColor(game),
                    width: isHovered ? '14px' : '10px',
                    height: isHovered ? '14px' : '10px',
                    boxShadow: isHovered ? `0 0 12px ${getGameColor(game)}` : 'none',
                    border: isHovered ? '2px solid white' : '1px solid rgba(255,255,255,0.2)'
                  }}
                  onMouseEnter={() => setHoveredGame(game)}
                  onMouseLeave={() => setHoveredGame(null)}
                  onClick={() => setHoveredGame(hoveredGame?.gameId === game.gameId ? null : game)}
                  aria-label={`Match vs ${game.opponent}: ${game.total} points`}
                />
              )
            })}

            {/* Current Line Marker */}
            <div
              className="absolute top-0 bottom-0 flex flex-col items-center z-30"
              style={{ left: `${Math.min(Math.max(linePosition, 3), 97)}%` }}
            >
              <div className="w-0.5 h-full bg-white" />
              <div className="absolute top-0 -translate-y-full px-2 py-1 bg-white rounded text-[10px] font-bold text-black">
                {currentLine}
              </div>
            </div>
          </div>

          {/* Scale labels */}
          <div className="flex justify-between mt-2 text-[10px] text-zinc-600 tabular-nums">
            <span>{Math.round(spectrum.min)}</span>
            <span>{Math.round(spectrum.max)}</span>
          </div>
        </div>

        {/* Hovered Game Detail */}
        {hoveredGame && (
          <div className="mb-4 p-3 bg-black/40 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-white">
                  {hoveredGame.team === 'home' ? homeTeamAbbr : awayTeamAbbr}
                </span>
                <span className="text-[10px] text-zinc-600">vs</span>
                <span className="text-xs text-zinc-400">{hoveredGame.opponent}</span>
              </div>
              <span className="text-[10px] text-zinc-600">{hoveredGame.date}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className={`font-bold ${hoveredGame.isOver ? 'text-white' : 'text-zinc-500'}`}>
                {hoveredGame.total} pts
              </span>
              <span className="text-zinc-600">ligne {hoveredGame.line}</span>
              <span className={`font-bold ${hoveredGame.isOver ? 'text-white' : 'text-zinc-500'}`}>
                {hoveredGame.isOver ? 'OVER' : 'UNDER'} ({hoveredGame.total > hoveredGame.line ? '+' : ''}{hoveredGame.total - hoveredGame.line})
              </span>
            </div>
          </div>
        )}

        {/* Distribution Summary */}
        <div className="grid grid-cols-2 gap-3">
          {/* Games Above Line */}
          <div className="bg-white/10 border border-white/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/70 uppercase tracking-wider">Au-dessus</span>
              <span className="text-lg font-black text-white">{gamesAbove}</span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${abovePercent}%` }}
              />
            </div>
            <div className="mt-1 text-right text-[10px] text-white/70 tabular-nums">
              {abovePercent}%
            </div>
          </div>

          {/* Games Below Line */}
          <div className="bg-zinc-600/10 border border-zinc-600/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">En-dessous</span>
              <span className="text-lg font-black text-zinc-400">{gamesBelow}</span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-500 rounded-full transition-all"
                style={{ width: `${100 - abovePercent}%` }}
              />
            </div>
            <div className="mt-1 text-right text-[10px] text-zinc-500 tabular-nums">
              {100 - abovePercent}%
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/70" />
            Over
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-600/70" />
            Under
          </span>
          <span className="text-zinc-700">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-0.5 h-3 bg-white" />
            Ligne actuelle
          </span>
        </div>

        {/* Insight Box */}
        <div className="mt-4 p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
              Le spectre montre la position de la ligne actuelle par rapport aux totaux historiques.
              <span className="text-zinc-500"> P25/P50/P75 = percentiles des matchs passés.</span>
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

export default LineSpectrum
