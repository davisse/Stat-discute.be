'use client'

import { TrendingUp, TrendingDown, Target } from 'lucide-react'

interface PropLine {
  category: string
  line: number
  hitRate: number
  last5: number
  last10: number
  gamesPlayed: number
  icon: string
}

interface PropLinesPanelProps {
  playerId: string
  playerName: string
  stats: {
    points_avg: number
    rebounds_avg: number
    assists_avg: number
    games_played: number
  }
  recentGames: Array<{
    points: number
    rebounds: number
    assists: number
  }>
}

export function PropLinesPanel({ playerId, playerName, stats, recentGames }: PropLinesPanelProps) {
  // Calculer les hit rates pour chaque catégorie
  const calculateHitRate = (games: number[], line: number): number => {
    if (games.length === 0) return 0
    const hits = games.filter(val => val > line).length
    return (hits / games.length) * 100
  }

  // Extraire les stats par catégorie
  const pointsData = recentGames.map(g => g.points)
  const reboundsData = recentGames.map(g => g.rebounds)
  const assistsData = recentGames.map(g => g.assists)

  // Déterminer les lignes de props basées sur les moyennes
  const pointsLine = Math.round(stats.points_avg - 0.5)
  const reboundsLine = Math.round(stats.rebounds_avg - 0.5)
  const assistsLine = Math.round(stats.assists_avg - 0.5)

  const propLines: PropLine[] = [
    {
      category: 'Points',
      line: pointsLine,
      hitRate: calculateHitRate(pointsData, pointsLine),
      last5: calculateHitRate(pointsData.slice(-5), pointsLine),
      last10: calculateHitRate(pointsData.slice(-10), pointsLine),
      gamesPlayed: pointsData.length,
      icon: '🏀'
    },
    {
      category: 'Rebounds',
      line: reboundsLine,
      hitRate: calculateHitRate(reboundsData, reboundsLine),
      last5: calculateHitRate(reboundsData.slice(-5), reboundsLine),
      last10: calculateHitRate(reboundsData.slice(-10), reboundsLine),
      gamesPlayed: reboundsData.length,
      icon: '📊'
    },
    {
      category: 'Assists',
      line: assistsLine,
      hitRate: calculateHitRate(assistsData, assistsLine),
      last5: calculateHitRate(assistsData.slice(-5), assistsLine),
      last10: calculateHitRate(assistsData.slice(-10), assistsLine),
      gamesPlayed: assistsData.length,
      icon: '🎯'
    }
  ]

  const getHitRateColor = (rate: number): string => {
    if (rate >= 70) return 'text-green-400'
    if (rate >= 55) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getHitRateBg = (rate: number): string => {
    if (rate >= 70) return 'bg-green-600/20 border-green-600/30'
    if (rate >= 55) return 'bg-yellow-600/20 border-yellow-600/30'
    return 'bg-red-600/20 border-red-600/30'
  }

  const getTrendIcon = (last5: number, last10: number) => {
    if (last5 > last10 + 10) return <TrendingUp className="w-4 h-4 text-green-400" />
    if (last5 < last10 - 10) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Target className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-950 px-4 py-3 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          Prop Lines & Hit Rates
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Historical success rate for common prop bets
        </p>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {propLines.map((prop) => (
          <div
            key={prop.category}
            className={`rounded-lg border p-4 ${getHitRateBg(prop.hitRate)}`}
          >
            {/* Prop Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{prop.icon}</span>
                <div>
                  <h3 className="text-white font-bold">{prop.category}</h3>
                  <p className="text-sm text-gray-400">
                    Over {prop.line}.5
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getHitRateColor(prop.hitRate)}`}>
                  {prop.hitRate.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">
                  Hit Rate
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-700">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Season</div>
                <div className={`text-lg font-bold ${getHitRateColor(prop.hitRate)}`}>
                  {prop.hitRate.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">
                  {prop.gamesPlayed} games
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Last 10</div>
                <div className={`text-lg font-bold ${getHitRateColor(prop.last10)}`}>
                  {prop.last10.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">
                  {Math.min(10, prop.gamesPlayed)} games
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1 flex items-center justify-center gap-1">
                  Last 5 {getTrendIcon(prop.last5, prop.last10)}
                </div>
                <div className={`text-lg font-bold ${getHitRateColor(prop.last5)}`}>
                  {prop.last5.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">
                  {Math.min(5, prop.gamesPlayed)} games
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                {prop.hitRate >= 70 ? (
                  <span className="text-green-400">
                    ✅ Strong Over trend - Hits consistently
                  </span>
                ) : prop.hitRate <= 30 ? (
                  <span className="text-red-400">
                    ❌ Strong Under trend - Rarely hits
                  </span>
                ) : prop.hitRate >= 55 ? (
                  <span className="text-yellow-400">
                    ⚠️ Moderate Over lean - Slightly above 50%
                  </span>
                ) : (
                  <span className="text-gray-400">
                    ⚖️ Neutral - Close to 50/50
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="mt-6 p-3 bg-gray-950 rounded-lg border border-gray-800">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Hit Rate Guide
          </h4>
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>70%+ = Strong Over (consistent hits)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span>55-70% = Moderate Over (above average)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span>45-55% = Neutral (50/50 range)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span>30% or less = Strong Under (rarely hits)</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-600 text-center pt-2">
          Based on {stats.games_played} games this season. Past performance does not guarantee future results.
        </div>
      </div>
    </div>
  )
}
