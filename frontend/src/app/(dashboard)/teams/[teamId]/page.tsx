import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { StadiumSpotlightHero } from '@/components/hero'
import { TeamRankingDualChart, TeamQuadrantChart, QuadrantInsight, TeamPresenceCalendar, TeamPointDiffChart, TeamScoringTrendChart, DvPTeamProfile, TeamAnalysis, ShotDistributionProfile, TeamShotZoneProfile, DefensiveSystemAnalysis, ComponentInsight, type TeamGameDay } from '@/components/teams'
import { getTeamDetailedStats, getAllTeamsRanking, getTeamGameHistory } from '@/lib/queries'

export const dynamic = 'force-dynamic'

interface TeamStats {
  team_id: number
  abbreviation: string
  full_name: string
  conference: 'East' | 'West'
  conference_rank: number
  wins: number
  losses: number
  streak: string
  pace: string
  ppg: string
  opp_ppg: string
  ortg: string
  drtg: string
  avg_total: string
  stddev_total: string
  min_total: number
  max_total: number
  l3_ppg: string
  l3_total: string
  l5_ppg: string
  l5_total: string
  l10_ppg: string
  l10_total: string
  games_played: number
  over_rate: string
}

interface TeamRankingData {
  team_id: number
  abbreviation: string
  ppg: number
  opp_ppg: number
}

// ============================================================================
// Generate Metadata for SEO
// ============================================================================

type Props = {
  params: Promise<{ teamId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { teamId } = await params
  const teamIdNum = parseInt(teamId, 10)

  try {
    const teamData = await getTeamDetailedStats(teamIdNum)

    if (!teamData) {
      return { title: 'Équipe introuvable - STAT-DISCUTE' }
    }

    const description = `Statistiques ${teamData.full_name} 2025-26 : ${teamData.wins}V-${teamData.losses}D, ${parseFloat(teamData.ppg).toFixed(1)} pts/match. Analyse complète offensive, défensive et DvP.`

    return {
      title: `${teamData.full_name} (${teamData.abbreviation}) - Stats NBA 2025-26 | STAT-DISCUTE`,
      description,
      keywords: `${teamData.full_name}, ${teamData.abbreviation}, NBA stats, statistiques équipe, ${teamData.conference} Conference`,
      openGraph: {
        title: `${teamData.full_name} - Statistiques NBA 2025-26`,
        description,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${teamData.full_name} - Stats NBA 2025-26`,
        description,
      }
    }
  } catch (error) {
    return { title: 'Erreur - STAT-DISCUTE' }
  }
}

// ============================================================================
// Components
// ============================================================================

function StatCard({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <div className={`${small ? 'p-2 sm:p-3' : 'p-2 sm:p-4'} bg-zinc-900/50 sm:border sm:border-zinc-800 sm:rounded-lg`}>
      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5 sm:mb-1">{label}</p>
      <p className={`${small ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold text-white font-mono`}>{value}</p>
    </div>
  )
}

export default async function TeamPage({ params }: Props) {
  const { teamId } = await params
  const teamIdNum = parseInt(teamId, 10)

  if (isNaN(teamIdNum) || teamIdNum <= 0) {
    notFound()
  }

  // Fetch all data in parallel
  const [teamStats, allTeamsRankingRaw, teamGamesRaw] = await Promise.all([
    getTeamDetailedStats(teamIdNum),
    getAllTeamsRanking(),
    getTeamGameHistory(teamIdNum),
  ])

  // Type cast for ranking data and games (queries return correct structure but no type annotations)
  const allTeamsRanking = allTeamsRankingRaw as TeamRankingData[]
  const teamGames = teamGamesRaw as TeamGameDay[]

  if (!teamStats) {
    notFound()
  }

  return (
    <AppLayout>
      <div className="px-2 sm:px-6 md:px-8 pt-4 sm:pt-8 max-w-7xl mx-auto pb-16">
        {/* Back Button */}
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6"
        >
          <span>←</span>
          <span className="text-sm uppercase tracking-wider">Toutes les équipes</span>
        </Link>

        {/* Team Stats */}
        {teamStats && (
          <>
            {/* Stadium Spotlight Hero Section */}
            <div className="-mx-2 sm:mx-0 mb-6 sm:mb-8">
              <StadiumSpotlightHero
                teamId={teamStats.team_id}
                abbreviation={teamStats.abbreviation}
                fullName={teamStats.full_name}
                conferenceRank={teamStats.conference_rank}
                conference={teamStats.conference}
                wins={teamStats.wins}
                losses={teamStats.losses}
                streak={teamStats.streak}
                netRating={parseFloat(teamStats.ortg) - parseFloat(teamStats.drtg)}
              />
              <ComponentInsight
                teamAbbreviation={teamStats.abbreviation}
                componentType="hero"
                contextData={{
                  fullName: teamStats.full_name,
                  conference: teamStats.conference,
                  conferenceRank: teamStats.conference_rank,
                  wins: teamStats.wins,
                  losses: teamStats.losses,
                  winPct: (teamStats.wins / (teamStats.wins + teamStats.losses) * 100).toFixed(1),
                  streak: teamStats.streak,
                  netRating: (parseFloat(teamStats.ortg) - parseFloat(teamStats.drtg)).toFixed(1),
                }}
                label="Vue d'ensemble"
              />
            </div>

            {/* Season Calendar / Journey */}
            {teamGames.length > 0 && (
              <div className="-mx-2 sm:mx-0 mb-6 sm:mb-8">
                <TeamPresenceCalendar
                  games={teamGames}
                  seasonStart="2025-10-22"
                  seasonEnd="2026-04-13"
                  teamAbbr={teamStats.abbreviation}
                  fullSize={true}
                />
                <ComponentInsight
                  teamAbbreviation={teamStats.abbreviation}
                  componentType="calendar"
                  contextData={{
                    totalGames: teamGames.length,
                    homeGames: teamGames.filter(g => g.is_home).length,
                    awayGames: teamGames.filter(g => !g.is_home).length,
                    recentGames: teamGames.slice(-5).map(g => ({
                      opponent: g.opponent,
                      result: g.result,
                      isHome: g.is_home,
                    })),
                  }}
                  label="Parcours"
                />
              </div>
            )}

            {/* Point Differential Chart */}
            {teamGames.length > 0 && (
              <div className="-mx-2 sm:mx-0 mb-6 sm:mb-8">
                <TeamPointDiffChart games={teamGames} />
                <ComponentInsight
                  teamAbbreviation={teamStats.abbreviation}
                  componentType="pointDiff"
                  contextData={{
                    avgPointDiff: (teamGames.filter(g => g.point_diff !== null).reduce((sum, g) => sum + (g.point_diff ?? 0), 0) / teamGames.filter(g => g.point_diff !== null).length).toFixed(1),
                    blowoutWins: teamGames.filter(g => g.result === 'W' && (g.point_diff ?? 0) >= 15).length,
                    closeWins: teamGames.filter(g => g.result === 'W' && Math.abs(g.point_diff ?? 0) <= 5).length,
                    blowoutLosses: teamGames.filter(g => g.result === 'L' && (g.point_diff ?? 0) <= -15).length,
                    closeLosses: teamGames.filter(g => g.result === 'L' && Math.abs(g.point_diff ?? 0) <= 5).length,
                    biggestWin: Math.max(...teamGames.filter(g => g.result === 'W' && g.point_diff !== null).map(g => g.point_diff ?? 0), 0),
                    biggestLoss: Math.abs(Math.min(...teamGames.filter(g => g.result === 'L' && g.point_diff !== null).map(g => g.point_diff ?? 0), 0)),
                  }}
                  label="Écarts de points"
                />
              </div>
            )}

            {/* Team Stats Grid - Compact */}
            <div className="mt-6 sm:mt-8 -mx-2 sm:mx-0 grid gap-2 sm:gap-3">
              {/* Main Stats Row */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-1 sm:gap-2 px-2 sm:px-0">
                <StatCard label="PPG" value={parseFloat(teamStats.ppg).toFixed(1)} />
                <StatCard label="OPP PPG" value={parseFloat(teamStats.opp_ppg).toFixed(1)} />
                <StatCard label="PACE" value={parseFloat(teamStats.pace).toFixed(1)} />
                <StatCard label="ORTG" value={parseFloat(teamStats.ortg).toFixed(1)} />
                <StatCard label="DRTG" value={parseFloat(teamStats.drtg).toFixed(1)} />
                <StatCard label="MATCHS" value={teamStats.games_played.toString()} />
              </div>

              {/* Totals + Recent Form - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {/* Totals Section */}
                <div className="p-3 sm:p-4 bg-zinc-900/50 sm:border sm:border-zinc-800 sm:rounded-lg">
                  <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 sm:mb-3">Totaux</h3>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    <div>
                      <p className="text-[10px] text-zinc-500">Moyenne</p>
                      <p className="text-base sm:text-lg font-bold text-white font-mono">{parseFloat(teamStats.avg_total).toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500">Écart-type</p>
                      <p className="text-base sm:text-lg font-bold text-white font-mono">{parseFloat(teamStats.stddev_total).toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500">Min/Max</p>
                      <p className="text-base sm:text-lg font-bold text-white font-mono">{teamStats.min_total}-{teamStats.max_total}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500">Over 220.5</p>
                      <p className="text-base sm:text-lg font-bold text-white font-mono">{parseFloat(teamStats.over_rate).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                {/* Recent Form */}
                <div className="p-3 sm:p-4 bg-zinc-900/50 sm:border sm:border-zinc-800 sm:rounded-lg">
                  <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 sm:mb-3">Forme récente</h3>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div>
                      <p className="text-[10px] text-zinc-500 mb-1">L3</p>
                      <p className="text-base sm:text-lg font-bold text-white font-mono">{parseFloat(teamStats.l3_ppg).toFixed(1)} <span className="text-xs text-zinc-500">PPG</span></p>
                      <p className="text-sm text-zinc-400 font-mono">{parseFloat(teamStats.l3_total).toFixed(1)} <span className="text-[10px] text-zinc-500">Tot</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 mb-1">L5</p>
                      <p className="text-base sm:text-lg font-bold text-white font-mono">{parseFloat(teamStats.l5_ppg).toFixed(1)} <span className="text-xs text-zinc-500">PPG</span></p>
                      <p className="text-sm text-zinc-400 font-mono">{parseFloat(teamStats.l5_total).toFixed(1)} <span className="text-[10px] text-zinc-500">Tot</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 mb-1">L10</p>
                      <p className="text-base sm:text-lg font-bold text-white font-mono">{parseFloat(teamStats.l10_ppg).toFixed(1)} <span className="text-xs text-zinc-500">PPG</span></p>
                      <p className="text-sm text-zinc-400 font-mono">{parseFloat(teamStats.l10_total).toFixed(1)} <span className="text-[10px] text-zinc-500">Tot</span></p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Stats Insights - Combined for Stats Grid, Totals, and Recent Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 px-2 sm:px-0">
                <ComponentInsight
                  teamAbbreviation={teamStats.abbreviation}
                  componentType="statsGrid"
                  contextData={{
                    ppg: parseFloat(teamStats.ppg).toFixed(1),
                    oppPpg: parseFloat(teamStats.opp_ppg).toFixed(1),
                    pace: parseFloat(teamStats.pace).toFixed(1),
                    ortg: parseFloat(teamStats.ortg).toFixed(1),
                    drtg: parseFloat(teamStats.drtg).toFixed(1),
                    netRating: (parseFloat(teamStats.ortg) - parseFloat(teamStats.drtg)).toFixed(1),
                    gamesPlayed: teamStats.games_played,
                  }}
                  label="Stats O/D"
                  className="mt-0"
                />
                <ComponentInsight
                  teamAbbreviation={teamStats.abbreviation}
                  componentType="totals"
                  contextData={{
                    avgTotal: parseFloat(teamStats.avg_total).toFixed(1),
                    stddevTotal: parseFloat(teamStats.stddev_total).toFixed(1),
                    minTotal: teamStats.min_total,
                    maxTotal: teamStats.max_total,
                    overRate: parseFloat(teamStats.over_rate).toFixed(0),
                  }}
                  label="Totaux"
                  className="mt-0"
                />
                <ComponentInsight
                  teamAbbreviation={teamStats.abbreviation}
                  componentType="recentForm"
                  contextData={{
                    l3Ppg: parseFloat(teamStats.l3_ppg).toFixed(1),
                    l3Total: parseFloat(teamStats.l3_total).toFixed(1),
                    l5Ppg: parseFloat(teamStats.l5_ppg).toFixed(1),
                    l5Total: parseFloat(teamStats.l5_total).toFixed(1),
                    l10Ppg: parseFloat(teamStats.l10_ppg).toFixed(1),
                    l10Total: parseFloat(teamStats.l10_total).toFixed(1),
                    seasonPpg: parseFloat(teamStats.ppg).toFixed(1),
                  }}
                  label="Forme récente"
                  className="mt-0"
                />
              </div>
            </div>

            {/* Team Quadrant Chart - full width on mobile */}
            {allTeamsRanking.length > 0 && (
              <div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
                <TeamQuadrantChart
                  data={allTeamsRanking}
                  selectedTeamId={teamStats.team_id}
                />
                {/* RAG Insight below quadrant */}
                <QuadrantInsight
                  teamId={teamStats.team_id}
                  teamAbbreviation={teamStats.abbreviation}
                />
              </div>
            )}

            {/* Team Ranking Charts */}
            {allTeamsRanking.length > 0 && (
              <div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
                <TeamRankingDualChart
                  data={allTeamsRanking}
                  selectedTeamId={teamStats.team_id}
                />
                <ComponentInsight
                  teamAbbreviation={teamStats.abbreviation}
                  componentType="ranking"
                  contextData={{
                    ppg: parseFloat(teamStats.ppg).toFixed(1),
                    oppPpg: parseFloat(teamStats.opp_ppg).toFixed(1),
                    ppgRank: allTeamsRanking.sort((a, b) => b.ppg - a.ppg).findIndex(t => t.team_id === teamStats.team_id) + 1,
                    defRank: allTeamsRanking.sort((a, b) => a.opp_ppg - b.opp_ppg).findIndex(t => t.team_id === teamStats.team_id) + 1,
                    totalTeams: allTeamsRanking.length,
                  }}
                  label="Classement"
                />
              </div>
            )}

            {/* Scoring Trend Chart */}
            {teamGames.length > 0 && (
              <div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
                <TeamScoringTrendChart games={teamGames} />
                <ComponentInsight
                  teamAbbreviation={teamStats.abbreviation}
                  componentType="scoringTrend"
                  contextData={{
                    first10AvgPpg: teamGames.length >= 10 ? (teamGames.slice(0, 10).filter(g => g.team_pts !== null).reduce((sum, g) => sum + (g.team_pts ?? 0), 0) / 10).toFixed(1) : null,
                    last10AvgPpg: teamGames.length >= 10 ? (teamGames.slice(-10).filter(g => g.team_pts !== null).reduce((sum, g) => sum + (g.team_pts ?? 0), 0) / 10).toFixed(1) : null,
                    seasonAvgPpg: parseFloat(teamStats.ppg).toFixed(1),
                    highestScoring: Math.max(...teamGames.filter(g => g.team_pts !== null).map(g => g.team_pts ?? 0)),
                    lowestScoring: Math.min(...teamGames.filter(g => g.team_pts !== null).map(g => g.team_pts ?? 0)),
                    gamesOver110: teamGames.filter(g => (g.team_pts ?? 0) >= 110).length,
                    gamesUnder100: teamGames.filter(g => g.team_pts !== null && (g.team_pts ?? 0) < 100).length,
                  }}
                  label="Tendance scoring"
                />
              </div>
            )}

            {/* Shot Distribution Profile - How defense reshapes opponent shots */}
            <div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
              <ShotDistributionProfile
                teamId={teamStats.team_id}
                teamAbbreviation={teamStats.abbreviation}
              />
              <ComponentInsight
                teamAbbreviation={teamStats.abbreviation}
                componentType="shotDistribution"
                contextData={{
                  drtg: parseFloat(teamStats.drtg).toFixed(1),
                  oppPpg: parseFloat(teamStats.opp_ppg).toFixed(1),
                  note: "Données détaillées chargées par le composant"
                }}
                label="Distribution tirs adverses"
              />
            </div>

            {/* Team Shot Zone Profile - Offensive and Defensive zone breakdown */}
            <div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
              <TeamShotZoneProfile
                teamId={teamStats.team_id}
                teamAbbreviation={teamStats.abbreviation}
              />
              <ComponentInsight
                teamAbbreviation={teamStats.abbreviation}
                componentType="shotZone"
                contextData={{
                  ortg: parseFloat(teamStats.ortg).toFixed(1),
                  drtg: parseFloat(teamStats.drtg).toFixed(1),
                  ppg: parseFloat(teamStats.ppg).toFixed(1),
                  oppPpg: parseFloat(teamStats.opp_ppg).toFixed(1),
                  note: "Données par zone chargées par le composant"
                }}
                label="Zones de tir"
              />
            </div>

            {/* Defensive System Analysis - Combined DvP + Shot Zones */}
            <div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
              <DefensiveSystemAnalysis
                teamId={teamStats.team_id}
                teamAbbreviation={teamStats.abbreviation}
              />
              <ComponentInsight
                teamAbbreviation={teamStats.abbreviation}
                componentType="defensiveSystem"
                contextData={{
                  drtg: parseFloat(teamStats.drtg).toFixed(1),
                  oppPpg: parseFloat(teamStats.opp_ppg).toFixed(1),
                  defRank: allTeamsRanking.sort((a, b) => a.opp_ppg - b.opp_ppg).findIndex(t => t.team_id === teamStats.team_id) + 1,
                  totalTeams: allTeamsRanking.length,
                  note: "Système défensif combiné DvP + zones"
                }}
                label="Système défensif"
              />
            </div>

            {/* Defense vs Position Profile (Radar + Bars) */}
            <div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
              <DvPTeamProfile
                teamId={teamStats.team_id}
                teamAbbreviation={teamStats.abbreviation}
              />
              <ComponentInsight
                teamAbbreviation={teamStats.abbreviation}
                componentType="dvp"
                contextData={{
                  drtg: parseFloat(teamStats.drtg).toFixed(1),
                  oppPpg: parseFloat(teamStats.opp_ppg).toFixed(1),
                  note: "Défense par position (PG, SG, SF, PF, C)"
                }}
                label="DvP par position"
              />
            </div>

            {/* Team Analysis (French narrative) */}
            <div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
              <TeamAnalysis
                teamId={teamStats.team_id}
                teamAbbreviation={teamStats.abbreviation}
              />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
