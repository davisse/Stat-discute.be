'use client'

interface Insights {
  biggestMLMovers: { team: string; movement: number; direction: 'steam' | 'drift' }[]
  totalsTrend: 'all_under' | 'all_over' | 'mixed'
  totalPointsDropped: number
  propsWithMovement: number
}

interface ASCIIInsightsProps {
  insights: Insights
  gamesCount: number
  marketsCount: number
  propsCount: number
  fetchedAt: string
  gamesWithOdds?: number
}

export function ASCIIInsights({
  insights,
  gamesCount,
  marketsCount,
  propsCount,
  fetchedAt,
  gamesWithOdds
}: ASCIIInsightsProps) {
  const { biggestMLMovers, totalsTrend, totalPointsDropped, propsWithMovement } = insights

  // Format time
  const fetchedTime = new Date(fetchedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  return (
    <div className="font-mono text-sm space-y-6">
      {/* ASCII Art Header */}
      <pre className="text-green-500 text-xs leading-tight">
{`
  ╔══════════════════════════════════════════════════════════════╗
  ║   ███████╗██╗ ██████╗ ███╗   ██╗ █████╗ ██╗     ███████╗     ║
  ║   ██╔════╝██║██╔════╝ ████╗  ██║██╔══██╗██║     ██╔════╝     ║
  ║   ███████╗██║██║  ███╗██╔██╗ ██║███████║██║     ███████╗     ║
  ║   ╚════██║██║██║   ██║██║╚██╗██║██╔══██║██║     ╚════██║     ║
  ║   ███████║██║╚██████╔╝██║ ╚████║██║  ██║███████╗███████║     ║
  ║   ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚══════╝     ║
  ╚══════════════════════════════════════════════════════════════╝
`}
      </pre>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-white">{gamesCount}</div>
          <div className="text-xs text-gray-500 mt-1">GAMES TODAY</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{marketsCount}</div>
          <div className="text-xs text-gray-500 mt-1">MARKETS TRACKED</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{propsCount}</div>
          <div className="text-xs text-gray-500 mt-1">PLAYER PROPS</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-amber-400">{propsWithMovement}</div>
          <div className="text-xs text-gray-500 mt-1">PROPS MOVING</div>
        </div>
      </div>

      {/* Key Signals */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <span>⚡</span> KEY SIGNALS
        </h3>

        <div className="space-y-4">
          {/* Totals Trend */}
          <div className="border-l-4 border-l-green-500 pl-4">
            <div className="text-gray-400 text-xs">TOTALS TREND</div>
            <div className={`text-lg font-bold ${
              totalsTrend === 'all_under' ? 'text-green-500' :
              totalsTrend === 'all_over' ? 'text-red-500' :
              'text-amber-500'
            }`}>
              {totalsTrend === 'all_under' ? '🔽 ALL GAMES MOVED UNDER' :
               totalsTrend === 'all_over' ? '🔼 ALL GAMES MOVED OVER' :
               '↔️ MIXED MOVEMENT'}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              Total points {totalPointsDropped < 0 ? 'dropped' : 'added'}: {' '}
              <span className={totalPointsDropped < 0 ? 'text-green-400' : 'text-red-400'}>
                {totalPointsDropped > 0 ? '+' : ''}{totalPointsDropped}
              </span>
            </div>
          </div>

          {/* Biggest ML Movers */}
          {biggestMLMovers.length > 0 && (
            <div className="border-l-4 border-l-blue-500 pl-4">
              <div className="text-gray-400 text-xs">BIGGEST MONEYLINE MOVERS</div>
              <div className="mt-2 space-y-1">
                {biggestMLMovers.slice(0, 5).map((mover, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className={`text-lg ${
                      mover.direction === 'steam' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {mover.direction === 'steam' ? '↘' : '↗'}
                    </span>
                    <span className="text-white font-bold">{mover.team}</span>
                    <span className={`${
                      mover.direction === 'steam' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {mover.movement > 0 ? '+' : ''}{mover.movement.toFixed(2)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      mover.direction === 'steam'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {mover.direction.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-3">📖 SIGNAL INTERPRETATION</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-green-500 font-bold">↘ STEAM (Shortening)</div>
            <div className="text-gray-400 text-xs">Sharp money on this side. Line getting shorter = more bets/money pushing it.</div>
          </div>
          <div>
            <div className="text-red-500 font-bold">↗ DRIFT (Lengthening)</div>
            <div className="text-gray-400 text-xs">Line drifting out. Could indicate injury news or lack of action.</div>
          </div>
          <div>
            <div className="text-green-500 font-bold">🔽 UNDER MOVE</div>
            <div className="text-gray-400 text-xs">Total line dropped. Sharps betting under or expecting lower scoring game.</div>
          </div>
          <div>
            <div className="text-amber-500 font-bold">🔥 LINE DROP</div>
            <div className="text-gray-400 text-xs">Player prop line lowered significantly. Sharp action on under.</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 text-xs">
        Last updated: {fetchedTime} | Data source: Pinnacle
      </div>
    </div>
  )
}
