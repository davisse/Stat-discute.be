'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { TeamRankingDualChart, TeamQuadrantChart, TeamPresenceCalendar, type TeamGameDay } from '@/components/teams'

interface TeamStats {
  team_id: number
  abbreviation: string
  full_name: string
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

function StatCard({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <div className={`${small ? 'p-2 sm:p-3' : 'p-2 sm:p-4'} bg-zinc-900/50 sm:border sm:border-zinc-800 sm:rounded-lg`}>
      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5 sm:mb-1">{label}</p>
      <p className={`${small ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold text-white font-mono`}>{value}</p>
    </div>
  )
}

export default function TeamPage() {
  const params = useParams()
  const teamId = params.teamId as string

  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [allTeamsRanking, setAllTeamsRanking] = useState<TeamRankingData[]>([])
  const [teamGames, setTeamGames] = useState<TeamGameDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeamStats() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/teams/${teamId}/stats`)
        if (!res.ok) {
          throw new Error('Équipe non trouvée')
        }
        const data = await res.json()
        setTeamStats(data)

        // Fetch all teams ranking data
        const rankingRes = await fetch('/api/teams/ranking')
        if (rankingRes.ok) {
          const rankingData = await rankingRes.json()
          setAllTeamsRanking(rankingData)
        }

        // Fetch team game history for calendar
        const gamesRes = await fetch(`/api/teams/${teamId}/games`)
        if (gamesRes.ok) {
          const gamesData = await gamesRes.json()
          setTeamGames(gamesData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setIsLoading(false)
      }
    }

    if (teamId) {
      fetchTeamStats()
    }
  }, [teamId])

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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center gap-3 text-zinc-500 mt-12">
            <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
            <span>Chargement...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-12 p-8 bg-zinc-900/50 border border-red-900/50 rounded-lg">
            <p className="text-red-400">{error}</p>
            <Link href="/teams" className="text-zinc-400 hover:text-white mt-4 inline-block">
              ← Retour à la liste
            </Link>
          </div>
        )}

        {/* Team Stats */}
        {!isLoading && !error && teamStats && (
          <>
            {/* Team Name with Logo Watermark */}
            <div className="relative">
              {/* Team Logo Watermark */}
              <div
                className="absolute -right-8 top-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `url(https://cdn.nba.com/logos/nba/${teamStats.team_id}/primary/L/logo.svg)`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  filter: 'brightness(1.2)',
                }}
              />

              {/* Team Name as Title */}
              <h1 className="text-[clamp(3rem,10vw,8rem)] font-black uppercase tracking-tighter leading-[0.9] text-white relative z-10">
                {teamStats.full_name}
              </h1>

              {/* Team Abbreviation */}
              <p className="mt-4 text-2xl text-zinc-500 font-mono relative z-10">{teamStats.abbreviation}</p>
            </div>

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
            </div>

            {/* Team Quadrant Chart - full width on mobile */}
            {allTeamsRanking.length > 0 && (
              <div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
                <TeamQuadrantChart
                  data={allTeamsRanking}
                  selectedTeamId={teamStats.team_id}
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
              </div>
            )}

            {/* Season Calendar */}
            {teamGames.length > 0 && (
              <div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
                <TeamPresenceCalendar
                  games={teamGames}
                  seasonStart="2025-10-22"
                  seasonEnd="2026-04-13"
                  teamAbbr={teamStats.abbreviation}
                  fullSize={true}
                />
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
