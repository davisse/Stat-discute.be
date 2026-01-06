'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts'
import { TeamGameDay } from './TeamPresenceCalendar'

interface TeamPointDiffChartProps {
  games: TeamGameDay[]
  className?: string
}

interface ChartDataPoint {
  game: number
  date: string
  opponent: string
  diff: number
  result: string
  teamPts: number
  oppPts: number
  isHome: boolean
}

/**
 * TeamPointDiffChart Component
 *
 * Bar chart showing point differential for each game.
 * Green bars = wins (positive), Red bars = losses (negative)
 */
export function TeamPointDiffChart({ games, className = '' }: TeamPointDiffChartProps) {
  const chartData = useMemo(() => {
    return games
      .filter(g => g.game_status === 'Final' && g.point_diff !== null)
      .map((g, i): ChartDataPoint => ({
        game: i + 1,
        date: new Date(g.game_date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit'
        }),
        opponent: g.opponent,
        diff: g.point_diff!,
        result: g.result,
        teamPts: g.team_pts ?? 0,
        oppPts: g.opp_pts ?? 0,
        isHome: g.is_home
      }))
  }, [games])

  // Stats summary
  const stats = useMemo(() => {
    if (chartData.length === 0) return null
    const wins = chartData.filter(g => g.diff > 0).length
    const losses = chartData.filter(g => g.diff < 0).length
    const avgDiff = chartData.reduce((sum, g) => sum + g.diff, 0) / chartData.length
    const maxWin = Math.max(...chartData.map(g => g.diff))
    const maxLoss = Math.min(...chartData.map(g => g.diff))
    return { wins, losses, avgDiff, maxWin, maxLoss }
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
          Écart de points par match
        </h3>
        {stats && (
          <div className="flex gap-3 sm:gap-4 text-[10px] sm:text-xs">
            <span className="text-emerald-400">{stats.wins}W</span>
            <span className="text-red-400">{stats.losses}L</span>
            <span className={stats.avgDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              Moy: {stats.avgDiff >= 0 ? '+' : ''}{stats.avgDiff.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
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
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              labelStyle={{ color: '#a1a1aa', fontSize: 11, marginBottom: '4px' }}
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
                      {data.teamPts} - {data.oppPts}{' '}
                      <span className={data.diff >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        ({data.diff >= 0 ? '+' : ''}{data.diff})
                      </span>
                    </p>
                  </div>
                )
              }}
            />
            <ReferenceLine y={0} stroke="#52525b" strokeWidth={1} />
            <Bar
              dataKey="diff"
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.diff >= 0 ? '#22c55e' : '#ef4444'}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-[10px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span>Victoire</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
          <span>Défaite</span>
        </div>
      </div>
    </div>
  )
}
