import { AppLayout } from '@/components/layout'
import { MatchHeader, MatchContextSection, ScoringTrendWrapper, OUDistributionChart, LineSpectrum } from '@/components/ou-investigation'
import { type TeamGameDay } from '@/components/teams'
import {
  getTeamIdByAbbreviation,
  getTeamOUStats,
  getTeamStandings,
  getProjectedLineups,
  getH2HGames,
  getTeamGameTotals,
  getMatchupOULine,
  getTodayGamesWithOdds,
  type ProjectedPlayer,
  type GameWithOdds
} from '@/lib/queries'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTeamColors } from '@/lib/team-colors'

interface PageProps {
  searchParams: Promise<{ home?: string; away?: string }>
}

// ============================================================================
// Game Selection Component (when no teams are specified)
// ============================================================================

function GameSelectionCard({ game }: { game: GameWithOdds }) {
  const homeColors = getTeamColors(game.home_team_abbr)
  const awayColors = getTeamColors(game.away_team_abbr)

  return (
    <Link
      href={`/ou-investigation?home=${game.home_team_abbr}&away=${game.away_team_abbr}`}
      className="group block p-4 sm:p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-white/50 hover:bg-zinc-900/70 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Away Team */}
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-sm text-zinc-500">{game.away_wins}-{game.away_losses}</span>
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: awayColors.primary }}
            />
          </div>
          <p className="text-lg sm:text-xl font-bold text-white">{game.away_team_abbr}</p>
          <p className="text-xs text-zinc-500 hidden sm:block">{game.away_team_name}</p>
        </div>

        {/* VS / Time */}
        <div className="flex flex-col items-center px-3">
          <span className="text-xs text-zinc-600 uppercase tracking-wider">@</span>
          {game.game_time && (
            <span className="text-sm font-mono text-zinc-400 mt-1">{game.game_time}</span>
          )}
        </div>

        {/* Home Team */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: homeColors.primary }}
            />
            <span className="text-sm text-zinc-500">{game.home_wins}-{game.home_losses}</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white">{game.home_team_abbr}</p>
          <p className="text-xs text-zinc-500 hidden sm:block">{game.home_team_name}</p>
        </div>

        {/* Arrow */}
        <div className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-200">
          →
        </div>
      </div>

      {/* O/U Line if available */}
      {game.total && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-zinc-500 uppercase">O/U</span>
            <span className="text-sm font-mono font-bold text-amber-400">{game.total}</span>
          </div>
        </div>
      )}
    </Link>
  )
}

async function GameSelectionView() {
  const todayGames = await getTodayGamesWithOdds()

  // Filter only scheduled games
  const scheduledGames = todayGames.filter(g => g.status === 'Scheduled')

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold text-emerald-500 tracking-widest">03</span>
            <div className="w-8 h-px bg-emerald-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            O/U Investigation Lab
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Sélectionnez un match pour analyser les tendances Over/Under
          </p>
        </div>

        {/* Today's Games */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Matchs du jour
            <span className="text-zinc-600">({scheduledGames.length})</span>
          </h2>

          {scheduledGames.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800 rounded-xl">
              <p className="text-zinc-500">Aucun match prévu aujourd'hui</p>
              <p className="text-sm text-zinc-600 mt-2">Revenez plus tard ou sélectionnez une date</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {scheduledGames.map((game) => (
                <GameSelectionCard key={game.game_id} game={game} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Access - Recent/Popular Matchups */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
            Ou entrez manuellement
          </h3>
          <p className="text-sm text-zinc-600">
            Utilisez les paramètres URL : <code className="text-zinc-400 bg-zinc-800 px-2 py-1 rounded">/ou-investigation?home=LAL&away=BOS</code>
          </p>
        </div>
      </div>
    </AppLayout>
  )
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function OUInvestigationPage({ searchParams }: PageProps) {
  const params = await searchParams

  // If no teams specified, show game selection
  if (!params.home && !params.away) {
    return <GameSelectionView />
  }

  // Get team abbreviations from params
  const homeAbbr = params.home?.toUpperCase() || ''
  const awayAbbr = params.away?.toUpperCase() || ''

  // Validate both teams are provided
  if (!homeAbbr || !awayAbbr) {
    return <GameSelectionView />
  }

  // Get team IDs
  const [homeTeamId, awayTeamId] = await Promise.all([
    getTeamIdByAbbreviation(homeAbbr),
    getTeamIdByAbbreviation(awayAbbr)
  ])

  if (!homeTeamId || !awayTeamId) {
    notFound()
  }

  // Fetch data in parallel
  const [homeStats, awayStats, standings, projectedLineups, h2hGamesRaw, homeGameTotals, awayGameTotals, ouLine] = await Promise.all([
    getTeamOUStats(homeTeamId),
    getTeamOUStats(awayTeamId),
    getTeamStandings(),
    getProjectedLineups(awayAbbr, homeAbbr),
    getH2HGames(homeAbbr, awayAbbr),
    getTeamGameTotals(homeTeamId, 100),
    getTeamGameTotals(awayTeamId, 100),
    getMatchupOULine(awayAbbr, homeAbbr)
  ])

  // Default line if no betting data available
  const currentLine = ouLine?.total || 220.5

  if (!homeStats || !awayStats) {
    notFound()
  }

  // Get team records from standings
  const homeStanding = standings.find(s => s.abbreviation === homeAbbr)
  const awayStanding = standings.find(s => s.abbreviation === awayAbbr)

  // Format today's date
  const today = new Date()
  const gameDate = today.toISOString().split('T')[0]
  // Use game time from RotoWire if available
  const gameTime = projectedLineups?.home?.gameTime || '19:30 ET'

  // Transform projected lineup data to component format
  function transformProjectedLineup(
    teamAbbr: string,
    starters: ProjectedPlayer[],
    injuries: ProjectedPlayer[]
  ): {
    abbreviation: string
    starters: { name: string; position: string; status: 'CONFIRMED' | 'GTD' | 'OUT'; injuryNote?: string }[]
    bench?: { name: string; position: string; status: 'CONFIRMED' | 'GTD' | 'OUT'; injuryNote?: string }[]
    out: { name: string; position: string; status: 'OUT' | 'GTD'; injuryNote?: string }[]
  } {
    // Separate starters (first 5) from bench (remaining players if any)
    const startersList = starters.slice(0, 5)
    const benchList = starters.slice(5) // RotoWire usually only gives 5, but handle more if available

    return {
      abbreviation: teamAbbr,
      starters: startersList.map(p => ({
        name: p.name,
        position: p.position || '?',
        status: p.status === 'PROBABLE' ? 'CONFIRMED' : p.status as 'CONFIRMED' | 'GTD' | 'OUT',
        injuryNote: p.injury || undefined
      })),
      // Include bench if we have more than 5 players from source
      bench: benchList.length > 0 ? benchList.map(p => ({
        name: p.name,
        position: p.position || '?',
        status: p.status === 'PROBABLE' ? 'CONFIRMED' : p.status as 'CONFIRMED' | 'GTD' | 'OUT',
        injuryNote: p.injury || undefined
      })) : undefined,
      out: injuries.map(p => ({
        name: p.name,
        position: p.position || '?',
        status: p.status === 'OUT' || p.status === 'DOUBTFUL' ? 'OUT' as const : 'GTD' as const,
        injuryNote: p.injury || undefined
      }))
    }
  }

  // Build lineup data from projected lineups (RotoWire)
  const homeLineup = projectedLineups?.home
    ? transformProjectedLineup(homeAbbr, projectedLineups.home.starters, projectedLineups.home.injuries)
    : { abbreviation: homeAbbr, starters: [], bench: undefined, out: [] }

  const awayLineup = projectedLineups?.away
    ? transformProjectedLineup(awayAbbr, projectedLineups.away.starters, projectedLineups.away.injuries)
    : { abbreviation: awayAbbr, starters: [], bench: undefined, out: [] }

  // Transform H2H games (DB data doesn't have betting lines yet)
  const h2hGames = h2hGamesRaw.map(game => ({
    date: game.date,
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    total: game.total
    // line and result omitted - not available in games table
  }))

  // Transform game totals to TeamGameDay format for ScoringTrendWrapper
  function transformToTeamGameDay(games: typeof homeGameTotals): TeamGameDay[] {
    return games.map(g => ({
      game_id: g.gameId,
      game_date: g.date,
      opponent: g.opponent,
      is_home: g.isHome,
      team_pts: g.teamScore,
      opp_pts: g.oppScore,
      result: (g.teamScore > g.oppScore ? 'W' : 'L') as 'W' | 'L' | 'Scheduled',
      point_diff: g.teamScore - g.oppScore,
      game_status: 'Final' as const
    }))
  }

  const homeGamesTransformed = transformToTeamGameDay(homeGameTotals)
  const awayGamesTransformed = transformToTeamGameDay(awayGameTotals)

  // Transform game totals for OUDistributionChart
  function transformToGameTotal(
    games: typeof homeGameTotals,
    teamAbbr: string,
    line: number
  ) {
    return games.map(g => ({
      gameId: g.gameId,
      total: g.total,
      homeTeam: g.isHome ? teamAbbr : g.opponent,
      awayTeam: g.isHome ? g.opponent : teamAbbr,
      date: String(g.date).split('T')[0],
      isOver: g.total > line
    }))
  }

  // Transform game totals for LineSpectrum
  function transformToHistoricalTotal(
    games: typeof homeGameTotals,
    line: number
  ) {
    return games.map(g => ({
      gameId: g.gameId,
      date: String(g.date).split('T')[0],
      opponent: g.opponent,
      total: g.total,
      isOver: g.total > line,
      line: line // Use current line since we don't have historical lines
    }))
  }

  const homeDistributionGames = transformToGameTotal(homeGameTotals, homeAbbr, currentLine)
  const awayDistributionGames = transformToGameTotal(awayGameTotals, awayAbbr, currentLine)
  const homeSpectrumGames = transformToHistoricalTotal(homeGameTotals, currentLine)
  const awaySpectrumGames = transformToHistoricalTotal(awayGameTotals, currentLine)

  // Context data with dynamic parts
  const contextData = {
    cinematicTitle: 'DEUX TITANS, UNE ALTITUDE, ZÉRO CERTITUDE',
    narrativeContext: `Milwaukee affiche 113.2 PPG (8e NBA) contre 108.7 PPG encaissés, générant des matchs à 221.9 points de moyenne — leur record O/U : 58% OVER sur la saison. Denver sans Jokić chute à 104.3 PPG (-14.2 pts) et voit son pace ralentir à 96.8 possessions (vs 101.2 avec lui). Les 3 derniers H2H totalisent 228 pts de moyenne avec 2 UNDER sur 3. Factor clé : les Bucks en back-to-back affichent un UNDER rate de 67% (pace -3.1). La ligne à 220.5 se situe 1.4 pts sous la moyenne H2H mais 7.2 pts au-dessus du Denver post-Jokić. Projection ajustée : 216-224 pts.`,
    h2hGames,
    homeLineup,
    awayLineup
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Back Button + Page Title */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/ou-investigation"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-4"
          >
            <span>←</span>
            <span>Tous les matchs</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
            O/U Investigation Lab
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Analyse approfondie des tendances Over/Under
          </p>
        </div>

        {/* 01 - Match Header */}
        <MatchHeader
          homeTeam={{
            abbreviation: homeStats.abbreviation,
            name: homeStats.fullName,
            wins: homeStanding?.wins || 0,
            losses: homeStanding?.losses || 0
          }}
          awayTeam={{
            abbreviation: awayStats.abbreviation,
            name: awayStats.fullName,
            wins: awayStanding?.wins || 0,
            losses: awayStanding?.losses || 0
          }}
          gameDate={gameDate}
          gameTime={gameTime}
        />

        {/* 02 - Context Section (Variante A) */}
        <MatchContextSection
          homeTeam={{
            abbreviation: homeStats.abbreviation,
            name: homeStats.fullName,
            wins: homeStanding?.wins || 0,
            losses: homeStanding?.losses || 0
          }}
          awayTeam={{
            abbreviation: awayStats.abbreviation,
            name: awayStats.fullName,
            wins: awayStanding?.wins || 0,
            losses: awayStanding?.losses || 0
          }}
          cinematicTitle={contextData.cinematicTitle}
          narrativeContext={contextData.narrativeContext}
          h2hGames={contextData.h2hGames}
          homeLineup={contextData.homeLineup}
          awayLineup={contextData.awayLineup}
        />

        {/* 03 - Scoring Trend Chart (reused from Team Detail) */}
        <div className="mt-8">
          <ScoringTrendWrapper
            homeTeam={{
              abbreviation: homeStats.abbreviation,
              name: homeStats.fullName
            }}
            awayTeam={{
              abbreviation: awayStats.abbreviation,
              name: awayStats.fullName
            }}
            homeGames={homeGamesTransformed}
            awayGames={awayGamesTransformed}
          />
        </div>

        {/* 04 - O/U Distribution Chart */}
        <OUDistributionChart
          homeTeamAbbr={homeAbbr}
          awayTeamAbbr={awayAbbr}
          homeTeamGames={homeDistributionGames}
          awayTeamGames={awayDistributionGames}
          currentLine={currentLine}
        />

        {/* 05 - Line Spectrum Positioning */}
        <LineSpectrum
          homeTeamAbbr={homeAbbr}
          awayTeamAbbr={awayAbbr}
          homeTeamGames={homeSpectrumGames}
          awayTeamGames={awaySpectrumGames}
          currentLine={currentLine}
        />

      </div>
    </AppLayout>
  )
}
