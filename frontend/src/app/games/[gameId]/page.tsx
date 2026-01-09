import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getGameById } from '@/lib/queries'
import { AppLayout } from '@/components/layout'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ gameId: string }>
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default async function GameDetailPage({ params }: Props) {
  const { gameId } = await params
  const game = await getGameById(gameId)

  if (!game) {
    notFound()
  }

  const isCompleted = game.status === 'Final'
  const homeWon = isCompleted && (game.home_score ?? 0) > (game.away_score ?? 0)
  const awayWon = isCompleted && (game.away_score ?? 0) > (game.home_score ?? 0)

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-11rem)] px-4 md:px-8 py-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour aux matchs</span>
        </Link>

        {/* Game Header Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 md:p-8 mb-8">
          {/* Date & Venue */}
          <div className="text-center mb-6">
            <p className="text-zinc-400 text-sm uppercase tracking-wider">
              {formatDate(game.game_date)}
            </p>
            {game.venue && (
              <p className="text-zinc-500 text-xs mt-1">{game.venue}</p>
            )}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-center gap-4 md:gap-8 mb-6">
            {/* Away Team */}
            <div className={`text-center flex-1 ${awayWon ? 'text-white' : 'text-zinc-400'}`}>
              <p className="text-3xl md:text-5xl font-bold mb-2">{game.away_team_abbr}</p>
              <p className="text-sm text-zinc-500 hidden md:block">{game.away_team_name}</p>
              <p className="text-xs text-zinc-600 mt-1">({game.away_wins}-{game.away_losses})</p>
              {isCompleted && (
                <p className={`text-4xl md:text-6xl font-bold mt-4 ${awayWon ? 'text-white' : 'text-zinc-500'}`}>
                  {game.away_score}
                </p>
              )}
            </div>

            {/* VS / Time */}
            <div className="text-center px-4">
              {isCompleted ? (
                <span className="text-zinc-600 text-lg font-medium">FINAL</span>
              ) : (
                <>
                  <p className="text-2xl md:text-3xl font-bold text-white">{formatTime(game.game_date)}</p>
                  <p className="text-zinc-500 text-xs mt-1">@</p>
                </>
              )}
            </div>

            {/* Home Team */}
            <div className={`text-center flex-1 ${homeWon ? 'text-white' : 'text-zinc-400'}`}>
              <p className="text-3xl md:text-5xl font-bold mb-2">{game.home_team_abbr}</p>
              <p className="text-sm text-zinc-500 hidden md:block">{game.home_team_name}</p>
              <p className="text-xs text-zinc-600 mt-1">({game.home_wins}-{game.home_losses})</p>
              {isCompleted && (
                <p className={`text-4xl md:text-6xl font-bold mt-4 ${homeWon ? 'text-white' : 'text-zinc-500'}`}>
                  {game.home_score}
                </p>
              )}
            </div>
          </div>

          {/* Odds Line */}
          {(game.spread_home || game.total) && (
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-zinc-800">
              {game.spread_home && (
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Spread</p>
                  <p className="text-lg font-mono text-white">
                    {game.home_team_abbr} {game.spread_home > 0 ? '+' : ''}{game.spread_home}
                  </p>
                </div>
              )}
              {game.total && (
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Total</p>
                  <p className="text-lg font-mono text-white">O/U {game.total}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Placeholder Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4">
          {['H2H', 'Forme', 'Stats', 'Trends'].map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                i === 0
                  ? 'bg-white text-black font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Placeholder Content */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-zinc-500">
            Contenu détaillé à venir...
          </p>
          <p className="text-zinc-600 text-sm mt-2">
            Head-to-head, forme récente, statistiques comparées
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
