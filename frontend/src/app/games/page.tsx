import { getTodayGames, getUpcomingGames, getRecentGames, type Game } from '@/lib/queries'
import { AppLayout } from '@/components/layout'
import { Calendar, Clock, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

function GameCard({ game, showDate = false }: { game: Game; showDate?: boolean }) {
  const isCompleted = game.game_status === 'Final'
  const homeWon = isCompleted && game.home_score > game.away_score
  const awayWon = isCompleted && game.away_score > game.home_score

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 hover:border-gray-700 transition-colors">
      {showDate && (
        <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(game.game_date)}
        </div>
      )}

      <div className="space-y-3">
        {/* Away Team */}
        <div className={`flex items-center justify-between ${awayWon ? 'text-white' : 'text-gray-400'}`}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-600 w-8">VIS</span>
            <span className="font-semibold">{game.away_abbreviation}</span>
            <span className="text-sm text-gray-500 hidden sm:inline">{game.away_team}</span>
          </div>
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <span className={`font-mono text-lg ${awayWon ? 'font-bold' : ''}`}>
                {game.away_score}
              </span>
              {awayWon && <Trophy className="w-4 h-4 text-yellow-500" />}
            </div>
          ) : (
            <span className="text-gray-600">-</span>
          )}
        </div>

        {/* Home Team */}
        <div className={`flex items-center justify-between ${homeWon ? 'text-white' : 'text-gray-400'}`}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-600 w-8">DOM</span>
            <span className="font-semibold">{game.home_abbreviation}</span>
            <span className="text-sm text-gray-500 hidden sm:inline">{game.home_team}</span>
          </div>
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <span className={`font-mono text-lg ${homeWon ? 'font-bold' : ''}`}>
                {game.home_score}
              </span>
              {homeWon && <Trophy className="w-4 h-4 text-yellow-500" />}
            </div>
          ) : (
            <span className="text-gray-600">-</span>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 pt-3 border-t border-gray-800">
        <span className={`text-xs px-2 py-1 rounded ${
          isCompleted
            ? 'bg-green-500/20 text-green-400'
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {game.game_status}
        </span>
      </div>
    </div>
  )
}

function GamesSection({
  title,
  games,
  icon: Icon,
  emptyMessage,
  showDate = false
}: {
  title: string
  games: Game[]
  icon: React.ElementType
  emptyMessage: string
  showDate?: boolean
}) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {title}
        <span className="text-sm font-normal text-gray-500">({games.length})</span>
      </h2>

      {games.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <GameCard key={game.game_id} game={game} showDate={showDate} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </section>
  )
}

export default async function GamesPage() {
  const [todayGames, upcomingGames, recentGames] = await Promise.all([
    getTodayGames(),
    getUpcomingGames(),
    getRecentGames(15)
  ])

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-11rem)] px-4 md:px-8 py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            Matchs NBA
          </h1>
          <p className="text-gray-500 mt-2">
            Calendrier et resultats de la saison 2025-26
          </p>
        </div>

        {/* Today's Games */}
        <GamesSection
          title="Matchs du jour"
          games={todayGames}
          icon={Clock}
          emptyMessage="Pas de matchs aujourd&apos;hui"
        />

        {/* Upcoming Games */}
        <GamesSection
          title="Prochains matchs"
          games={upcomingGames}
          icon={Calendar}
          emptyMessage="Pas de matchs programmes dans les 7 prochains jours"
          showDate
        />

        {/* Recent Games */}
        <GamesSection
          title="Derniers resultats"
          games={recentGames}
          icon={Trophy}
          emptyMessage="Aucun match termine"
          showDate
        />
      </div>
    </AppLayout>
  )
}
