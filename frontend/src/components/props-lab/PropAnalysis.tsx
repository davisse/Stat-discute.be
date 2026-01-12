'use client'

import { type PlayerPropAnalysis } from '@/lib/queries'

interface PropAnalysisProps {
  analysis: PlayerPropAnalysis
  propLabel: string
  propName: string
  line: number
}

export function PropAnalysis({ analysis, propLabel, propName, line }: PropAnalysisProps) {
  const { games, seasonAvg, last5Avg, last10Avg, homeAvg, awayAvg, hitRate, last5HitRate, last10HitRate, homeHitRate, awayHitRate, streak, maxValue, minValue } = analysis

  // Determine recommendation based on hit rate and trend
  const getRecommendation = () => {
    if (hitRate >= 70 && last5HitRate >= 60) return { text: 'OVER', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' }
    if (hitRate <= 30 && last5HitRate <= 40) return { text: 'UNDER', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' }
    return { text: 'NEUTRE', color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/30' }
  }

  const recommendation = getRecommendation()

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Season Avg */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Moyenne</p>
          <p className={`text-xl font-mono font-bold ${seasonAvg > line ? 'text-green-400' : 'text-red-400'}`}>
            {seasonAvg.toFixed(1)} <span className="text-sm text-zinc-500">{propLabel}</span>
          </p>
          <p className="text-[10px] text-zinc-600">vs {line.toFixed(1)}</p>
        </div>

        {/* Hit Rate */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Hit Rate</p>
          <p className={`text-xl font-mono font-bold ${hitRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
            {hitRate.toFixed(0)}%
          </p>
          <p className="text-[10px] text-zinc-600">{analysis.gamesPlayed} matchs</p>
        </div>

        {/* Last 5 */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">L5 Avg</p>
          <p className={`text-xl font-mono font-bold ${last5Avg > line ? 'text-green-400' : 'text-red-400'}`}>
            {last5Avg.toFixed(1)} <span className="text-sm text-zinc-500">{propLabel}</span>
          </p>
          <p className="text-[10px] text-zinc-600">{last5HitRate.toFixed(0)}% over</p>
        </div>

        {/* Streak */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Série</p>
          <p className={`text-xl font-mono font-bold ${streak > 0 ? 'text-green-400' : streak < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
            {streak > 0 ? `${streak}O` : streak < 0 ? `${Math.abs(streak)}U` : '-'}
          </p>
          <p className="text-[10px] text-zinc-600">{streak > 0 ? 'over' : streak < 0 ? 'under' : 'neutre'}</p>
        </div>
      </div>

      {/* Recommendation Badge */}
      <div className={`flex items-center justify-between p-3 rounded-lg border ${recommendation.bg}`}>
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wider">Tendance</p>
          <p className={`text-lg font-bold ${recommendation.color}`}>{recommendation.text}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Range: {minValue} - {maxValue} {propLabel}</p>
          <p className="text-xs text-zinc-500">Ligne: {line.toFixed(1)} {propLabel}</p>
        </div>
      </div>

      {/* Home/Away Splits */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Home</span>
            <span className={`text-xs font-mono ${homeHitRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {homeHitRate.toFixed(0)}%
            </span>
          </div>
          <p className={`text-lg font-mono font-bold ${homeAvg > line ? 'text-green-400' : 'text-red-400'}`}>
            {homeAvg.toFixed(1)} <span className="text-sm text-zinc-500">{propLabel}</span>
          </p>
        </div>
        <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase">Away</span>
            <span className={`text-xs font-mono ${awayHitRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {awayHitRate.toFixed(0)}%
            </span>
          </div>
          <p className={`text-lg font-mono font-bold ${awayAvg > line ? 'text-green-400' : 'text-red-400'}`}>
            {awayAvg.toFixed(1)} <span className="text-sm text-zinc-500">{propLabel}</span>
          </p>
        </div>
      </div>

      {/* Game Log */}
      <div>
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
          Derniers matchs
        </h3>
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {games.slice(0, 10).map((game, index) => (
            <div
              key={game.gameId}
              className={`flex items-center justify-between p-2 rounded-lg ${
                game.isOver
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-12">{formatDate(game.gameDate)}</span>
                <span className="text-xs text-zinc-600">{game.isHome ? 'vs' : '@'}</span>
                <span className="text-xs font-mono text-zinc-400">{game.opponent}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-mono font-bold ${game.isOver ? 'text-green-400' : 'text-red-400'}`}>
                  {game.value} <span className="text-xs text-zinc-500">{propLabel}</span>
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  game.isOver ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {game.isOver ? 'O' : 'U'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div>
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
          Distribution
        </h3>
        {(() => {
          const chartGames = games.slice(0, 15).reverse()
          const maxVal = Math.max(...chartGames.map(g => g.value))
          const maxMinutes = Math.max(...chartGames.map(g => g.minutes))
          const chartHeight = 120 // pixels
          const lineY = maxVal > 0 ? (line / maxVal) * chartHeight : 0
          const barWidth = 100 / chartGames.length // percentage width per bar

          return (
            <div>
              <div className="relative" style={{ height: chartHeight + 20 }}>
                {/* Betting line indicator */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-white/40 z-10"
                  style={{ bottom: lineY }}
                >
                  <span className="absolute -top-3 right-0 text-[10px] text-zinc-400 bg-zinc-900 px-1">
                    {line.toFixed(1)}
                  </span>
                </div>

                {/* Minutes line chart */}
                <div className="absolute inset-0 z-20 pointer-events-none flex items-end" style={{ height: chartHeight }}>
                  {chartGames.map((game, i) => {
                    const minutesHeight = maxMinutes > 0 ? (game.minutes / maxMinutes) * 100 : 0
                    const nextGame = chartGames[i + 1]
                    const nextMinutesHeight = nextGame && maxMinutes > 0 ? (nextGame.minutes / maxMinutes) * 100 : 0

                    return (
                      <div key={game.gameId} className="flex-1 relative h-full">
                        {/* Point */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full z-10"
                          style={{ bottom: `${minutesHeight}%` }}
                        />
                        {/* Minutes label */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 text-[8px] text-yellow-400 font-bold"
                          style={{ bottom: `calc(${minutesHeight}% + 8px)` }}
                        >
                          {game.minutes}
                        </div>
                        {/* Line to next point */}
                        {nextGame && (
                          <svg
                            className="absolute top-0 left-1/2 w-full h-full overflow-visible"
                            style={{ zIndex: 5 }}
                          >
                            <line
                              x1="0"
                              y1={`${100 - minutesHeight}%`}
                              x2="100%"
                              y2={`${100 - nextMinutesHeight}%`}
                              stroke="#facc15"
                              strokeWidth="2"
                            />
                          </svg>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Bars */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1" style={{ height: chartHeight }}>
                  {chartGames.map((game) => {
                    const barHeight = maxVal > 0 ? (game.value / maxVal) * chartHeight : 4
                    const isOverLine = game.value > line

                    return (
                      <div key={game.gameId} className="flex-1">
                        <div
                          className={`w-full rounded-t flex items-end justify-center pb-1 ${
                            isOverLine ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ height: barHeight }}
                        >
                          <span className="text-[10px] text-white font-bold">{game.value}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Opponent names */}
              <div className="flex gap-1 mt-1">
                {chartGames.map((game) => (
                  <div key={game.gameId} className="flex-1 text-center">
                    <span className="text-[8px] text-zinc-600">
                      {game.isHome ? 'vs' : '@'}{game.opponent}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-yellow-400" />
                  <span className="text-[10px] text-zinc-500">Minutes</span>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
