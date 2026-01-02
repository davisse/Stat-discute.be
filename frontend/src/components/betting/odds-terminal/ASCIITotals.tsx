'use client'

interface GameData {
  gameId: string
  game: string
  gameDate: string
  gameTime: string | null
  gameStatus: string
  total: {
    openLine: number | null
    currentLine: number | null
    movement: number
    overOdds: number | null
    underOdds: number | null
  } | null
  hasOdds: boolean
}

interface ASCIITotalsProps {
  data: GameData[]
}

export function ASCIITotals({ data }: ASCIITotalsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 font-mono text-center py-8">
        No games available
      </div>
    )
  }

  // Filter games with totals data for stats calculation
  const gamesWithTotals = data.filter(g => g.total !== null)
  const gamesWithoutTotals = data.filter(g => g.total === null)

  // Calculate summary stats (only for games with totals)
  const underMoves = gamesWithTotals.filter(t => t.total!.movement < 0).length
  const overMoves = gamesWithTotals.filter(t => t.total!.movement > 0).length
  const noMoves = gamesWithTotals.filter(t => t.total!.movement === 0).length
  const totalDropped = gamesWithTotals.reduce((sum, t) => sum + t.total!.movement, 0)

  // Max movement for bar scaling
  const maxMovement = Math.max(...gamesWithTotals.map(t => Math.abs(t.total!.movement)), 1)

  return (
    <div className="font-mono text-sm">
      {/* Summary Panel */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">{underMoves}</div>
            <div className="text-xs text-gray-500">UNDER MOVES</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{overMoves}</div>
            <div className="text-xs text-gray-500">OVER MOVES</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-400">{noMoves}</div>
            <div className="text-xs text-gray-500">NO CHANGE</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${totalDropped < 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalDropped > 0 ? '+' : ''}{totalDropped.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">TOTAL PTS MOVED</div>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="text-gray-500 border-b border-gray-800 pb-2 mb-2">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-2">GAME</div>
          <div className="col-span-1 text-right">OPEN</div>
          <div className="col-span-5 text-center">LINE MOVEMENT</div>
          <div className="col-span-1 text-right">CURR</div>
          <div className="col-span-1 text-right">OVER</div>
          <div className="col-span-1 text-right">UNDER</div>
          <div className="col-span-1 text-right">LEAN</div>
        </div>
      </div>

      {/* Games without totals first (pending) */}
      {gamesWithoutTotals.map((game) => (
        <div key={game.gameId} className="grid grid-cols-12 gap-2 items-center py-1 border-b border-gray-800/30 opacity-60">
          <div className="col-span-2 text-gray-400">
            {game.game}
            <span className="ml-2 text-xs text-yellow-600">(pas de ligne)</span>
          </div>
          <div className="col-span-1 text-right text-gray-600">—</div>
          <div className="col-span-5 text-gray-600 text-xs">En attente des totaux...</div>
          <div className="col-span-1 text-right text-gray-600">—</div>
          <div className="col-span-1 text-right text-gray-600">—</div>
          <div className="col-span-1 text-right text-gray-600">—</div>
          <div className="col-span-1 text-right text-gray-600">—</div>
        </div>
      ))}

      {/* Rows sorted by movement (most dropped first) */}
      {gamesWithTotals
        .sort((a, b) => a.total!.movement - b.total!.movement)
        .map((game) => {
          const total = game.total!
          const barWidth = 20
          const movement = total.movement
          const barFill = Math.round((Math.abs(movement) / maxMovement) * (barWidth / 2))

          // Build ASCII bar centered at midpoint
          let bar = ''
          for (let i = 0; i < barWidth; i++) {
            const mid = Math.floor(barWidth / 2)
            if (i === mid) {
              bar += '│'
            } else if (movement < 0 && i >= mid - barFill && i < mid) {
              bar += '█'
            } else if (movement > 0 && i > mid && i <= mid + barFill) {
              bar += '█'
            } else {
              bar += '░'
            }
          }

          // Determine lean based on juice
          const juiceDiff = (total.overOdds || 0) - (total.underOdds || 0)
          const lean = juiceDiff < -0.03 ? 'OVER' : juiceDiff > 0.03 ? 'UNDER' : '—'

          return (
            <div key={game.gameId} className="grid grid-cols-12 gap-2 items-center py-1 border-b border-gray-800/30">
              <div className="col-span-2 text-gray-400">{game.game}</div>
              <div className="col-span-1 text-right text-gray-400">{total.openLine ?? '—'}</div>
              <div className="col-span-5">
                <span className={movement < 0 ? 'text-green-500' : movement > 0 ? 'text-red-500' : 'text-gray-500'}>
                  {bar}
                </span>
                <span className={`ml-2 ${movement < 0 ? 'text-green-500' : movement > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {movement > 0 ? '+' : ''}{movement.toFixed(1)}
                </span>
              </div>
              <div className="col-span-1 text-right text-white font-bold">{total.currentLine ?? '—'}</div>
              <div className="col-span-1 text-right text-gray-300">{total.overOdds?.toFixed(2) ?? '—'}</div>
              <div className="col-span-1 text-right text-gray-300">{total.underOdds?.toFixed(2) ?? '—'}</div>
              <div className={`col-span-1 text-right text-xs ${
                lean === 'UNDER' ? 'text-green-500' : lean === 'OVER' ? 'text-red-500' : 'text-gray-600'
              }`}>
                {lean}
              </div>
            </div>
          )
        })}

      {/* Legend */}
      <div className="pt-4 text-xs text-gray-600 flex gap-6">
        <span><span className="text-green-500">◀ LEFT</span> = Line dropped (UNDER action)</span>
        <span><span className="text-red-500">RIGHT ▶</span> = Line increased (OVER action)</span>
      </div>
    </div>
  )
}
