'use client'

import { TrendingUp, Activity } from 'lucide-react'

interface Game {
  game_date: string
  points: number
  rebounds: number
  assists: number
}

interface PerformanceTrendsProps {
  games: Game[]
  playerAvg: {
    points_avg: number
    rebounds_avg: number
    assists_avg: number
  }
}

export function PerformanceTrends({ games, playerAvg }: PerformanceTrendsProps) {
  if (games.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Performance Trends</h2>
        <p className="text-gray-400 text-center py-8">
          No game data available yet
        </p>
      </div>
    )
  }

  // Take last 10 games for trends (most recent first in array, so reverse for chronological)
  const trendGames = games.slice(0, 10).reverse()

  const StatTrend = ({
    label,
    data,
    average,
    color
  }: {
    label: string
    data: number[]
    average: number
    color: string
  }) => {
    const maxValue = Math.max(...data, average * 1.2)
    const minValue = 0

    // Calculate points for line chart (0-100 scale)
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - minValue) / (maxValue - minValue)) * 100
      return `${x},${y}`
    }).join(' ')

    // Average line position
    const avgY = 100 - ((average - minValue) / (maxValue - minValue)) * 100

    // Calculate trend (last 3 vs previous 3)
    const recent3 = data.slice(-3).reduce((a, b) => a + b, 0) / 3
    const previous3 = data.slice(-6, -3).reduce((a, b) => a + b, 0) / 3
    const trendDirection = recent3 > previous3 ? 'up' : recent3 < previous3 ? 'down' : 'stable'
    const trendPercent = previous3 > 0 ? ((recent3 - previous3) / previous3 * 100).toFixed(1) : '0'

    return (
      <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-white">{label}</h4>
            <p className="text-xs text-gray-500">Last 10 games</p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${color}`}>
              {recent3.toFixed(1)}
            </div>
            <div className={`text-xs flex items-center gap-1 justify-end ${
              trendDirection === 'up' ? 'text-green-400' :
              trendDirection === 'down' ? 'text-red-400' :
              'text-gray-400'
            }`}>
              {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→'}
              {trendPercent}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            {/* Average line */}
            <line
              x1="0"
              y1={avgY}
              x2="100"
              y2={avgY}
              stroke="rgba(156, 163, 175, 0.3)"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />

            {/* Trend line */}
            <polyline
              points={points}
              fill="none"
              stroke={color.includes('blue') ? '#60a5fa' :
                     color.includes('green') ? '#34d399' :
                     '#f59e0b'}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />

            {/* Data points */}
            {data.map((value, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 100 - ((value - minValue) / (maxValue - minValue)) * 100
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={color.includes('blue') ? '#60a5fa' :
                       color.includes('green') ? '#34d399' :
                       '#f59e0b'}
                />
              )
            })}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute top-0 -left-8 text-xs text-gray-600">
            {maxValue.toFixed(0)}
          </div>
          <div className="absolute bottom-0 -left-8 text-xs text-gray-600">
            0
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-800">
          <div className="text-center">
            <div className="text-xs text-gray-500">Avg</div>
            <div className="text-sm font-medium text-white">
              {average.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">High</div>
            <div className="text-sm font-medium text-white">
              {Math.max(...data).toFixed(0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Low</div>
            <div className="text-sm font-medium text-white">
              {Math.min(...data).toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-950 px-4 py-3 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Performance Trends
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Statistical trends over last 10 games
        </p>
      </div>

      {/* Trends */}
      <div className="p-4 md:p-6 space-y-4">
        <StatTrend
          label="Points Per Game"
          data={trendGames.map(g => g.points)}
          average={playerAvg.points_avg}
          color="text-blue-400"
        />

        <StatTrend
          label="Rebounds Per Game"
          data={trendGames.map(g => g.rebounds)}
          average={playerAvg.rebounds_avg}
          color="text-green-400"
        />

        <StatTrend
          label="Assists Per Game"
          data={trendGames.map(g => g.assists)}
          average={playerAvg.assists_avg}
          color="text-yellow-400"
        />

        {/* Legend */}
        <div className="mt-6 p-3 bg-gray-950 rounded-lg border border-gray-800">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Trend Indicators
          </h4>
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="text-green-400">↗</div>
              <span>Trending up (recent 3 games vs previous 3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-red-400">↘</div>
              <span>Trending down (recent 3 games vs previous 3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-gray-400">→</div>
              <span>Stable (no significant change)</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-8 h-0.5 bg-gray-600 opacity-30"></div>
              <span>Season average line</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
