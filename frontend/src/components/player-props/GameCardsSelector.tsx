'use client'

interface Game {
  game_id: string
  game_date: string
  home_team_id: number
  home_abbr: string
  home_team: string
  away_team_id: number
  away_abbr: string
  away_team: string
  event_id?: string
}

interface GameCardsSelectorProps {
  games: Game[]
  selectedGameId: string | null
  onSelectGame: (gameId: string | null) => void
}

export function GameCardsSelector({ games, selectedGameId, onSelectGame }: GameCardsSelectorProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-xl">Tonight&apos;s Games</span>
        <span className="text-sm text-gray-500 font-normal">({games.length} games)</span>
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {/* All Games Option */}
        <button
          onClick={() => onSelectGame(null)}
          className={`flex-shrink-0 px-6 py-4 rounded-lg border-2 transition-all duration-300 min-w-[140px] ${
            selectedGameId === null
              ? 'border-white bg-white text-black'
              : 'border-gray-800 bg-transparent text-gray-400 hover:border-gray-600 hover:text-white'
          }`}
        >
          <div className="text-center">
            <div className="text-lg font-bold">ALL</div>
            <div className="text-xs mt-1 opacity-70">All Games</div>
          </div>
        </button>

        {games.map((game) => {
          const isSelected = selectedGameId === game.game_id

          return (
            <button
              key={game.game_id}
              onClick={() => onSelectGame(game.game_id)}
              className={`flex-shrink-0 px-5 py-4 rounded-lg border-2 transition-all duration-300 min-w-[140px] ${
                isSelected
                  ? 'border-white bg-white text-black'
                  : 'border-gray-800 bg-transparent text-gray-400 hover:border-gray-600 hover:text-white'
              }`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-lg font-bold">
                  <span>{game.away_abbr}</span>
                  <span className={`text-xs ${isSelected ? 'text-gray-600' : 'text-gray-600'}`}>@</span>
                  <span>{game.home_abbr}</span>
                </div>
                {game.event_id ? (
                  <div className={`text-xs mt-1 ${isSelected ? 'text-green-700' : 'text-green-500'}`}>
                    Props Available
                  </div>
                ) : (
                  <div className={`text-xs mt-1 ${isSelected ? 'text-gray-600' : 'text-gray-600'}`}>
                    No Props
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected game details */}
      {selectedGameId && (
        <div className="mt-2 text-sm text-gray-500">
          {(() => {
            const game = games.find(g => g.game_id === selectedGameId)
            if (!game) return null
            return (
              <span>
                {game.away_team} @ {game.home_team}
              </span>
            )
          })()}
        </div>
      )}
    </div>
  )
}
