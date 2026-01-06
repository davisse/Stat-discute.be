'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart
} from 'recharts'
import { TeamGameDay } from './TeamPresenceCalendar'

interface TeamScoringTrendChartProps {
  games: TeamGameDay[]
  className?: string
}

interface ChartDataPoint {
  game: number
  date: string
  opponent: string
  teamPts: number
  oppPts: number
  total: number
  result: string
  isHome: boolean
  rollingAvg: number | null
  rollingOppAvg: number | null
}

/**
 * TeamScoringTrendChart Component
 *
 * Area chart showing team scoring over the season with 5-game rolling average.
 * - Green area: Team points
 * - Red line: Opponent points
 * - Dashed lines: 5-game rolling averages
 */
export function TeamScoringTrendChart({ games, className = '' }: TeamScoringTrendChartProps) {
  const chartData = useMemo(() => {
    const finishedGames = games.filter(g => g.game_status === 'Final' && g.team_pts !== null)

    return finishedGames.map((g, i, arr): ChartDataPoint => {
      // Calculate 5-game rolling average
      const windowSize = 5
      let rollingAvg: number | null = null
      let rollingOppAvg: number | null = null

      if (i >= windowSize - 1) {
        const window = arr.slice(i - windowSize + 1, i + 1)
        rollingAvg = window.reduce((sum, game) => sum + (game.team_pts ?? 0), 0) / windowSize
        rollingOppAvg = window.reduce((sum, game) => sum + (game.opp_pts ?? 0), 0) / windowSize
      }

      return {
        game: i + 1,
        date: new Date(g.game_date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit'
        }),
        opponent: g.opponent,
        teamPts: g.team_pts ?? 0,
        oppPts: g.opp_pts ?? 0,
        total: (g.team_pts ?? 0) + (g.opp_pts ?? 0),
        result: g.result,
        isHome: g.is_home,
        rollingAvg,
        rollingOppAvg
      }
    })
  }, [games])

  // Season averages
  const seasonStats = useMemo(() => {
    if (chartData.length === 0) return null
    const avgPts = chartData.reduce((sum, g) => sum + g.teamPts, 0) / chartData.length
    const avgOppPts = chartData.reduce((sum, g) => sum + g.oppPts, 0) / chartData.length
    const avgTotal = chartData.reduce((sum, g) => sum + g.total, 0) / chartData.length
    return { avgPts, avgOppPts, avgTotal }
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div className={`p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg ${className}`}>
        <p className="text-zinc-500 text-sm text-center">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <div className={`p-3 sm:p-4 bg-zinc-900/50 sm:border sm:border-zinc-800 sm:rounded-lg ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500">
          Évolution des scores (Moy. mobile 5 matchs)
        </h3>
        {seasonStats && (
          <div className="flex gap-3 sm:gap-4 text-[10px] sm:text-xs font-mono">
            <span className="text-emerald-400">PPG: {seasonStats.avgPts.toFixed(1)}</span>
            <span className="text-red-400">OPP: {seasonStats.avgOppPts.toFixed(1)}</span>
            <span className="text-zinc-400">TOT: {seasonStats.avgTotal.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="h-56 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="teamPtsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="oppPtsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#3f3f46"
              vertical={false}
            />
            <XAxis
              dataKey="game"
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
              domain={[80, 150]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null
                const data = payload[0].payload as ChartDataPoint
                return (
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs min-w-[140px]">
                    <p className="text-zinc-400 mb-1">
                      Match #{label} • {data.date}
                    </p>
                    <p className="text-white mb-2">
                      {data.isHome ? 'vs' : '@'} {data.opponent}{' '}
                      <span className={data.result === 'W' ? 'text-emerald-400' : 'text-red-400'}>
                        ({data.result})
                      </span>
                    </p>
                    <div className="space-y-0.5">
                      <p className="text-emerald-400">Points: {data.teamPts}</p>
                      <p className="text-red-400">Adversaire: {data.oppPts}</p>
                      {data.rollingAvg && (
                        <p className="text-emerald-300 opacity-80">Moy. 5: {data.rollingAvg.toFixed(1)}</p>
                      )}
                    </div>
                  </div>
                )
              }}
            />

            {/* Season average reference line */}
            {seasonStats && (
              <ReferenceLine
                y={seasonStats.avgPts}
                stroke="#71717a"
                strokeDasharray="5 5"
                strokeWidth={1}
              />
            )}

            {/* Team points area */}
            <Area
              type="monotone"
              dataKey="teamPts"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#teamPtsGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#22c55e' }}
            />

            {/* Opponent points line */}
            <Line
              type="monotone"
              dataKey="oppPts"
              stroke="#ef4444"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: '#ef4444' }}
            />

            {/* Rolling average - Team */}
            <Line
              type="monotone"
              dataKey="rollingAvg"
              stroke="#86efac"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls={false}
            />

            {/* Rolling average - Opponent */}
            <Line
              type="monotone"
              dataKey="rollingOppAvg"
              stroke="#fca5a5"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2 text-[10px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-emerald-500" />
          <span>Points</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-red-500" />
          <span>Adversaire</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-emerald-300 opacity-70" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0' }} />
          <span>Moy. 5 matchs</span>
        </div>
      </div>
    </div>
  )
}
