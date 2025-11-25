'use client'

import { Home, Plane } from 'lucide-react'

interface Split {
  location: 'home' | 'away'
  games: number
  points_avg: number
  rebounds_avg: number
  assists_avg: number
  minutes_avg: number
  fg_pct: number
}

interface PlayerSplitsProps {
  splits: {
    home: Split | null
    away: Split | null
  }
}

export function PlayerSplits({ splits }: PlayerSplitsProps) {
  const renderSplitRow = (label: string, homeValue: number | null, awayValue: number | null, suffix = '') => {
    const hasData = homeValue !== null || awayValue !== null

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
        <div className="text-sm text-gray-400 w-20 flex-shrink-0">{label}</div>
        <div className="flex-1 flex items-center justify-around gap-4">
          <div className="text-center flex-1">
            <span className="text-white font-medium">
              {hasData && homeValue !== null ? `${homeValue.toFixed(1)}${suffix}` : '-'}
            </span>
          </div>
          <div className="w-px h-6 bg-gray-800" />
          <div className="text-center flex-1">
            <span className="text-white font-medium">
              {hasData && awayValue !== null ? `${awayValue.toFixed(1)}${suffix}` : '-'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-950 px-4 py-3 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white">Home/Away Splits</h2>
      </div>

      <div className="p-4 md:p-6">
        {/* Column Headers */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
          <div className="w-20 flex-shrink-0" />
          <div className="flex-1 flex items-center justify-around gap-4">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Home className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">HOME</span>
              </div>
              <div className="text-xs text-gray-500">
                {splits.home?.games || 0} games
              </div>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Plane className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">AWAY</span>
              </div>
              <div className="text-xs text-gray-500">
                {splits.away?.games || 0} games
              </div>
            </div>
          </div>
        </div>

        {/* Stats Rows */}
        <div>
          {renderSplitRow('PPG', splits.home?.points_avg || null, splits.away?.points_avg || null)}
          {renderSplitRow('RPG', splits.home?.rebounds_avg || null, splits.away?.rebounds_avg || null)}
          {renderSplitRow('APG', splits.home?.assists_avg || null, splits.away?.assists_avg || null)}
          {renderSplitRow('MPG', splits.home?.minutes_avg || null, splits.away?.minutes_avg || null)}
          {renderSplitRow('FG%', splits.home?.fg_pct || null, splits.away?.fg_pct || null, '%')}
        </div>

        {/* No Data Message */}
        {!splits.home && !splits.away && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No split data available yet
          </div>
        )}
      </div>
    </div>
  )
}
