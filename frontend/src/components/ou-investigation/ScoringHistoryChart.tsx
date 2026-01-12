'use client'

import { useMemo, useState } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList
} from 'recharts'

// ============================================================================
// TYPES
// ============================================================================

interface GameData {
  gameId: string
  date: string
  opponent: string
  isHome: boolean
  teamScore: number
  oppScore: number
  total: number
}

interface TeamInfo {
  abbreviation: string
  name: string
}

interface ScoringHistoryChartProps {
  homeTeam: TeamInfo
  awayTeam: TeamInfo
  homeGames: GameData[]
  awayGames: GameData[]
  referenceLine?: number  // O/U line to show as reference
}

interface ChartDataPoint {
  game: number
  date: string
  opponent: string
  isHome: boolean
  teamScore: number
  oppScore: number
  total: number
  isOver: boolean
  ma3: number | null  // 3-game moving average
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ScoringHistoryChart({
  homeTeam,
  awayTeam,
  homeGames,
  awayGames,
  referenceLine = 220.5
}: ScoringHistoryChartProps) {
  const [selectedTeam, setSelectedTeam] = useState<'away' | 'home'>('away')

  const currentTeam = selectedTeam === 'home' ? homeTeam : awayTeam
  const currentGames = selectedTeam === 'home' ? homeGames : awayGames

  // Calculate global Y-axis domain from both teams to prevent resize on switch
  // Y-axis starts at 0 for accurate visual representation
  const globalYDomain = useMemo(() => {
    const allTotals = [...homeGames, ...awayGames].map(g => g.total)
    if (allTotals.length === 0) return { min: 0, max: 280 }
    const maxTotal = Math.max(...allTotals)
    return {
      min: 0,
      max: Math.ceil(Math.max(maxTotal, referenceLine + 10) / 10) * 10
    }
  }, [homeGames, awayGames, referenceLine])

  // Transform games into chart data with 3-game moving average
  // Reverse to show oldest games on the left, newest on the right (chronological order)
  const chartData = useMemo((): ChartDataPoint[] => {
    const chronologicalGames = [...currentGames].reverse()
    return chronologicalGames.map((g, i) => {
      // Calculate 3-game moving average (need at least 3 games)
      let ma3: number | null = null
      if (i >= 2) {
        const sum = chronologicalGames[i].total + chronologicalGames[i - 1].total + chronologicalGames[i - 2].total
        ma3 = sum / 3
      }

      return {
        game: i + 1,
        date: new Date(g.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit'
        }),
        opponent: g.opponent,
        isHome: g.isHome,
        teamScore: g.teamScore,
        oppScore: g.oppScore,
        total: g.total,
        isOver: g.total > referenceLine,
        ma3
      }
    })
  }, [currentGames, referenceLine])

  // Calculate stats
  const stats = useMemo(() => {
    if (chartData.length === 0) return null
    const avgTotal = chartData.reduce((sum, g) => sum + g.total, 0) / chartData.length
    const overCount = chartData.filter(g => g.isOver).length
    const underCount = chartData.length - overCount
    const overPct = (overCount / chartData.length) * 100
    const minTotal = Math.min(...chartData.map(g => g.total))
    const maxTotal = Math.max(...chartData.map(g => g.total))
    return { avgTotal, overCount, underCount, overPct, minTotal, maxTotal }
  }, [chartData])

  // ============================================================================
  // EMPTY STATE
  // ============================================================================
  if (chartData.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            SCORING
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base tracking-[0.2em] uppercase mt-2">
            Historique des Totaux Combinés
          </p>
        </div>
        <p className="text-zinc-500 text-sm text-center py-8">Aucune donnée disponible</p>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-8">
      {/* Cinematic Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          SCORING
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base tracking-[0.2em] uppercase mt-2">
          Historique des Totaux Combinés
        </p>

        {/* Team Toggle - Above Stats */}
        <div className="flex justify-center mt-4 mb-3">
          <div className="inline-flex bg-zinc-800/50 rounded-full p-0.5 sm:p-1">
            <button
              onClick={() => setSelectedTeam('away')}
              className={`
                px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider
                transition-all duration-200
                ${selectedTeam === 'away'
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                }
              `}
            >
              {awayTeam.abbreviation}
            </button>
            <button
              onClick={() => setSelectedTeam('home')}
              className={`
                px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider
                transition-all duration-200
                ${selectedTeam === 'home'
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                }
              `}
            >
              {homeTeam.abbreviation}
            </button>
          </div>
        </div>

        {/* Stats Pills */}
        {stats && (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <div className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-full">
              <span className="text-zinc-300 text-sm font-bold font-mono">
                Moy: {stats.avgTotal.toFixed(1)}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <span className="text-emerald-400 text-sm font-bold font-mono">
                {stats.overCount} Over ({stats.overPct.toFixed(0)}%)
              </span>
            </div>
            <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
              <span className="text-red-400 text-sm font-bold font-mono">
                {stats.underCount} Under ({(100 - stats.overPct).toFixed(0)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div className="h-56 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#3f3f46"
              vertical={false}
            />
            <XAxis
              dataKey="opponent"
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 8 }}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
              domain={[globalYDomain.min, globalYDomain.max]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null
                const data = payload[0].payload as ChartDataPoint
                return (
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs">
                    <p className="text-zinc-400 mb-1">Match #{label} • {data.date}</p>
                    <p className="text-white">
                      {data.isHome ? 'vs' : '@'} {data.opponent}
                    </p>
                    <p className="text-white font-mono">
                      {data.teamScore} - {data.oppScore}
                    </p>
                    <p className={`font-bold mt-1 ${data.isOver ? 'text-emerald-400' : 'text-red-400'}`}>
                      Total: {data.total} ({data.isOver ? 'OVER' : 'UNDER'})
                    </p>
                    {data.ma3 !== null && (
                      <p className="text-white font-mono mt-1">
                        Moy. L3: {data.ma3.toFixed(1)}
                      </p>
                    )}
                  </div>
                )
              }}
            />
            {/* O/U Reference Line */}
            <ReferenceLine
              y={referenceLine}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="8 4"
              label={{
                value: `O/U ${referenceLine}`,
                position: 'right',
                fill: '#f59e0b',
                fontSize: 10
              }}
            />
            {/* Average Line */}
            {stats && (
              <ReferenceLine
                y={stats.avgTotal}
                stroke="#71717a"
                strokeDasharray="5 5"
                strokeWidth={1}
              />
            )}
            <Bar
              dataKey="total"
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isOver ? '#22c55e' : '#ef4444'}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
            {/* 3-Game Moving Average Line */}
            <Line
              type="monotone"
              dataKey="ma3"
              stroke="#ffffff"
              strokeWidth={2}
              dot={{ fill: '#ffffff', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: '#ffffff', strokeWidth: 2, stroke: '#000', r: 5 }}
              connectNulls={false}
            >
              <LabelList
                dataKey="ma3"
                position="top"
                fill="#ffffff"
                fontSize={9}
                content={({ x, y, index, value }) => {
                  // Only show "L3" label on the last point with a valid value
                  if (index === chartData.length - 1 && value !== null && value !== undefined) {
                    return (
                      <text x={x} y={(y as number) - 8} fill="#ffffff" fontSize={9} textAnchor="middle">
                        L3
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* O/U Progress Bar */}
      {stats && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
            <span className="text-emerald-400 font-mono">
              Over: {stats.overCount}/{chartData.length}
            </span>
            <span className="text-red-400 font-mono">
              Under: {stats.underCount}/{chartData.length}
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{ width: `${stats.overPct}%` }}
            />
            <div
              className="bg-red-500 transition-all duration-300"
              style={{ width: `${100 - stats.overPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Legend */}
      <div className="mt-6 pt-5 border-t border-zinc-700/50">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>Over</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>Under</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-amber-500" style={{ borderStyle: 'dashed', borderWidth: '2px 0 0 0' }} />
            <span>Ligne O/U</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-white rounded-full" />
            <span>Moy. L3</span>
          </div>
        </div>
        {stats && (
          <p className="text-xs text-zinc-500 text-center mt-3">
            Min: <span className="text-white font-mono">{stats.minTotal}</span>
            {' '}&bull;{' '}
            Max: <span className="text-white font-mono">{stats.maxTotal}</span>
            {' '}&bull;{' '}
            Écart: <span className="text-white font-mono">{stats.maxTotal - stats.minTotal}</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default ScoringHistoryChart
