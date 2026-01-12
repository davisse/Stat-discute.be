'use client'

import { useState, useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts'

interface PaceGame {
  gameId: string
  date: string
  opponent: string
  pace: number
  total: number
  line: number
  isOver: boolean
}

interface PaceCorrelationProps {
  homeTeamAbbr: string
  awayTeamAbbr: string
  homeTeamGames: PaceGame[]
  awayTeamGames: PaceGame[]
  currentLine: number
}

export function PaceCorrelation({
  homeTeamAbbr,
  awayTeamAbbr,
  homeTeamGames,
  awayTeamGames,
  currentLine
}: PaceCorrelationProps) {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | 'both'>('both')
  const [tappedPoint, setTappedPoint] = useState<(PaceGame & { team: 'home' | 'away' }) | null>(null)

  // Combine or filter data based on selection
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

  // Calculate correlation coefficient
  const correlation = useMemo(() => {
    if (displayData.length < 2) return 0

    const n = displayData.length
    const sumX = displayData.reduce((acc, d) => acc + d.pace, 0)
    const sumY = displayData.reduce((acc, d) => acc + d.total, 0)
    const sumXY = displayData.reduce((acc, d) => acc + d.pace * d.total, 0)
    const sumX2 = displayData.reduce((acc, d) => acc + d.pace * d.pace, 0)
    const sumY2 = displayData.reduce((acc, d) => acc + d.total * d.total, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }, [displayData])

  // Calculate domain bounds with padding
  const { xDomain, yDomain, avgPace, avgTotal } = useMemo(() => {
    if (displayData.length === 0) {
      return { xDomain: [90, 110], yDomain: [200, 240], avgPace: 100, avgTotal: 220 }
    }

    const paces = displayData.map(d => d.pace)
    const totals = displayData.map(d => d.total)

    const minPace = Math.min(...paces)
    const maxPace = Math.max(...paces)
    const minTotal = Math.min(...totals)
    const maxTotal = Math.max(...totals)

    const paceRange = maxPace - minPace || 10
    const totalRange = maxTotal - minTotal || 30

    return {
      xDomain: [minPace - paceRange * 0.1, maxPace + paceRange * 0.1],
      yDomain: [minTotal - totalRange * 0.1, maxTotal + totalRange * 0.1],
      avgPace: paces.reduce((a, b) => a + b, 0) / paces.length,
      avgTotal: totals.reduce((a, b) => a + b, 0) / totals.length
    }
  }, [displayData])

  const getPointColor = (game: PaceGame & { team: 'home' | 'away' }) => {
    // Monochrome: Over = white, Under = zinc
    return game.isOver ? '#ffffff' : '#52525b'
  }

  const correlationStrength = Math.abs(correlation)
  const correlationLabel = correlationStrength < 0.3
    ? 'Faible'
    : correlationStrength < 0.6
      ? 'Modérée'
      : 'Forte'

  return (
    <section className="mt-6 sm:mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-600 tracking-widest">04</span>
          <div className="w-8 h-px bg-zinc-700" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
          Corrélation Pace & Total
        </h2>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
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

          {/* Correlation Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">r =</span>
            <span className={`text-sm font-bold tabular-nums ${
              Math.abs(correlation) > 0.3 ? 'text-white' : 'text-zinc-400'
            }`}>
              {correlation.toFixed(2)}
            </span>
            <span className="text-[10px] text-zinc-600">({correlationLabel})</span>
          </div>
        </div>

        {/* Scatter Chart */}
        <div className="h-[220px] sm:h-[300px] relative">

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: 5, bottom: 20 }}>
              <XAxis
                dataKey="pace"
                type="number"
                domain={xDomain}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#52525b', fontSize: 10 }}
                tickFormatter={(v) => v.toFixed(0)}
              />
              <YAxis
                dataKey="total"
                type="number"
                domain={yDomain}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#52525b', fontSize: 10 }}
                width={35}
              />
              <Tooltip content={<CustomTooltip currentLine={currentLine} />} />

              {/* Reference line for current O/U line */}
              <ReferenceLine
                y={currentLine}
                stroke="#ffffff"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                strokeOpacity={0.5}
              />

              <Scatter
                data={displayData}
                onClick={(data) => {
                  if (data && data.payload) {
                    const point = data.payload as PaceGame & { team: 'home' | 'away' }
                    setTappedPoint(
                      tappedPoint?.gameId === point.gameId ? null : point
                    )
                  }
                }}
              >
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getPointColor(entry)}
                    fillOpacity={tappedPoint?.gameId === entry.gameId ? 1 : 0.7}
                    stroke={tappedPoint?.gameId === entry.gameId ? '#fff' : 'transparent'}
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          {/* O/U Line Label */}
          <div className="absolute right-2 top-2 bg-white/10 border border-white/30 px-2 py-0.5 rounded text-[9px] font-bold text-white">
            O/U {currentLine}
          </div>

          {/* Axis Label */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-zinc-600 font-medium tracking-wider">
            PACE (poss/match)
          </div>
        </div>

        {/* Selected Point Detail - Mobile Panel */}
        {tappedPoint && (
          <div className="mt-3 p-3 bg-black/40 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-white">
                  {tappedPoint.team === 'home' ? homeTeamAbbr : awayTeamAbbr}
                </span>
                <span className="text-[10px] text-zinc-600">vs</span>
                <span className="text-xs text-zinc-400">{tappedPoint.opponent}</span>
              </div>
              <span className="text-[10px] text-zinc-600">{tappedPoint.date}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="text-zinc-500">Pace {tappedPoint.pace.toFixed(1)}</span>
              <span className={`font-bold ${tappedPoint.isOver ? 'text-white' : 'text-zinc-500'}`}>
                {tappedPoint.isOver ? 'OVER' : 'UNDER'}
              </span>
              <span className="text-zinc-400 tabular-nums">{tappedPoint.total} pts</span>
              <span className="text-zinc-600 tabular-nums">ligne {tappedPoint.line}</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox
              label="Matchs"
              value={displayData.length.toString()}
            />
            <StatBox
              label="Pace moyen"
              value={avgPace.toFixed(1)}
            />
            <StatBox
              label="Total moyen"
              value={avgTotal.toFixed(1)}
              highlight={avgTotal > currentLine ? 'over' : 'under'}
            />
            <StatBox
              label="Corrélation"
              value={correlation.toFixed(2)}
              highlight={Math.abs(correlation) > 0.3 ? 'over' : undefined}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-white/70" />
            Over
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-600/70" />
            Under
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-white font-bold">─ ─</span>
            Ligne O/U
          </span>
        </div>

        {/* Insight Box */}
        <div className="mt-4 p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
              Le pace mesure le nombre de possessions par match.
              <span className="text-zinc-500"> Un pace élevé = plus d'opportunités de marquer.</span>
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

function StatBox({
  label,
  value,
  highlight
}: {
  label: string
  value: string
  highlight?: 'over' | 'under'
}) {
  const getColor = () => {
    if (highlight === 'over') return 'text-white'
    if (highlight === 'under') return 'text-zinc-500'
    return 'text-zinc-300'
  }

  return (
    <div className="bg-black/30 rounded-lg p-3 text-center">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${getColor()}`}>
        {value}
      </div>
    </div>
  )
}

function CustomTooltip({
  active,
  payload,
  currentLine
}: {
  active?: boolean
  payload?: Array<{ payload: PaceGame & { team: 'home' | 'away' } }>
  currentLine: number
}) {
  if (!active || !payload || !payload[0]) return null

  const game = payload[0].payload
  const isOver = game.total > currentLine
  const teamLabel = game.team === 'home' ? 'DOM' : 'EXT'

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-bold text-zinc-500 uppercase">{teamLabel}</span>
        <span className="text-xs text-zinc-400">vs {game.opponent}</span>
      </div>
      <div className="text-sm font-bold text-white mb-2">{game.date}</div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-zinc-500">Pace</span>
          <span className="text-white font-medium tabular-nums">{game.pace.toFixed(1)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-zinc-500">Total</span>
          <span className={`font-medium tabular-nums ${isOver ? 'text-white' : 'text-zinc-500'}`}>
            {game.total}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-zinc-500">Ligne</span>
          <span className="text-white font-medium tabular-nums">{game.line}</span>
        </div>
      </div>
    </div>
  )
}

export default PaceCorrelation
