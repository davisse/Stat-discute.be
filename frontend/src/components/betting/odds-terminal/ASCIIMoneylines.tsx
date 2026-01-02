'use client'

import { ASCIIBar } from './ASCIIBar'

interface GameData {
  gameId: string
  game: string
  gameDate: string
  gameTime: string | null
  gameStatus: string
  awayScore: number | null
  homeScore: number | null
  awayTeam: {
    abbr: string
    name: string
    openOdds: number | null
    currentOdds: number | null
    movement: number | null
  }
  homeTeam: {
    abbr: string
    name: string
    openOdds: number | null
    currentOdds: number | null
    movement: number | null
  }
  hasOdds: boolean
  readings: number
}

interface ASCIIMoneylinesProps {
  data: GameData[]
}

export function ASCIIMoneylines({ data }: ASCIIMoneylinesProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 font-mono text-center py-8">
        No moneyline data available
      </div>
    )
  }

  return (
    <div className="font-mono text-sm space-y-1">
      {/* Header */}
      <div className="text-gray-500 border-b border-gray-800 pb-2 mb-2">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-2">GAME</div>
          <div className="col-span-1">TEAM</div>
          <div className="col-span-1 text-right">OPEN</div>
          <div className="col-span-5 text-center">EVOLUTION</div>
          <div className="col-span-1 text-right">CURR</div>
          <div className="col-span-1 text-right">MOV</div>
          <div className="col-span-1 text-right">SIG</div>
        </div>
      </div>

      {/* Games */}
      {data.map((game) => (
        <div key={game.gameId} className={`border-b border-gray-800/50 pb-2 mb-2 ${!game.hasOdds ? 'opacity-60' : ''}`}>
          {/* Away Team Row */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2 text-gray-400">
              {game.game}
              {!game.hasOdds && <span className="ml-2 text-xs text-yellow-600">(pas de cotes)</span>}
            </div>
            <div className="col-span-1 text-white">{game.awayTeam.abbr}</div>
            <div className="col-span-1 text-right text-gray-400">
              {game.awayTeam.openOdds !== null ? game.awayTeam.openOdds.toFixed(2) : '—'}
            </div>
            <div className="col-span-5">
              {game.awayTeam.openOdds !== null && game.awayTeam.currentOdds !== null ? (
                <ASCIIBar
                  openValue={game.awayTeam.openOdds}
                  currentValue={game.awayTeam.currentOdds}
                  showValues={false}
                  inverted={true}
                  width={20}
                />
              ) : (
                <span className="text-gray-600 text-xs">En attente des cotes...</span>
              )}
            </div>
            <div className="col-span-1 text-right text-white">
              {game.awayTeam.currentOdds !== null ? game.awayTeam.currentOdds.toFixed(2) : '—'}
            </div>
            <div className={`col-span-1 text-right ${
              game.awayTeam.movement !== null && game.awayTeam.movement < 0 ? 'text-green-500' :
              game.awayTeam.movement !== null && game.awayTeam.movement > 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {game.awayTeam.movement !== null
                ? `${game.awayTeam.movement > 0 ? '+' : ''}${game.awayTeam.movement.toFixed(2)}`
                : '—'}
            </div>
            <div className="col-span-1 text-right">
              {game.awayTeam.movement !== null && Math.abs(game.awayTeam.movement) > 0.1 ? (
                game.awayTeam.movement < 0 ? (
                  <span className="text-green-500">↘ STEAM</span>
                ) : (
                  <span className="text-red-500">↗ DRIFT</span>
                )
              ) : (
                <span className="text-gray-600">—</span>
              )}
            </div>
          </div>

          {/* Home Team Row */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2"></div>
            <div className="col-span-1 text-white">{game.homeTeam.abbr}</div>
            <div className="col-span-1 text-right text-gray-400">
              {game.homeTeam.openOdds !== null ? game.homeTeam.openOdds.toFixed(2) : '—'}
            </div>
            <div className="col-span-5">
              {game.homeTeam.openOdds !== null && game.homeTeam.currentOdds !== null ? (
                <ASCIIBar
                  openValue={game.homeTeam.openOdds}
                  currentValue={game.homeTeam.currentOdds}
                  showValues={false}
                  inverted={true}
                  width={20}
                />
              ) : (
                <span className="text-gray-600 text-xs"></span>
              )}
            </div>
            <div className="col-span-1 text-right text-white">
              {game.homeTeam.currentOdds !== null ? game.homeTeam.currentOdds.toFixed(2) : '—'}
            </div>
            <div className={`col-span-1 text-right ${
              game.homeTeam.movement !== null && game.homeTeam.movement < 0 ? 'text-green-500' :
              game.homeTeam.movement !== null && game.homeTeam.movement > 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {game.homeTeam.movement !== null
                ? `${game.homeTeam.movement > 0 ? '+' : ''}${game.homeTeam.movement.toFixed(2)}`
                : '—'}
            </div>
            <div className="col-span-1 text-right">
              {game.homeTeam.movement !== null && Math.abs(game.homeTeam.movement) > 0.1 ? (
                game.homeTeam.movement < 0 ? (
                  <span className="text-green-500">↘ STEAM</span>
                ) : (
                  <span className="text-red-500">↗ DRIFT</span>
                )
              ) : (
                <span className="text-gray-600">—</span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="pt-4 text-xs text-gray-600 flex gap-6">
        <span><span className="text-green-500">↘ STEAM</span> = Sharp money (line shortening)</span>
        <span><span className="text-red-500">↗ DRIFT</span> = Line lengthening</span>
      </div>
    </div>
  )
}
