'use client'

import * as React from 'react'
import { Target, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, safeNum } from '@/lib/utils'
import { getTeamColors } from '@/lib/team-colors'

/**
 * TeamRankingDualChart - Compact Dual Cards Layout
 *
 * Shows team's position in league rankings for both offense and defense.
 * Displays Top 3, teams around selected team, and Bottom 3 for context.
 * ~50% space reduction vs original full 30-team lists.
 */

interface TeamRankingData {
  team_id: number
  abbreviation: string
  ppg: number
  opp_ppg: number
}

interface TeamRankingDualChartProps {
  data: TeamRankingData[]
  selectedTeamId?: number
  selectedTeamAbbreviation?: string
  className?: string
}

interface RankedTeam extends TeamRankingData {
  rank: number
}

// Get relevant teams: Top 3, around selected, Bottom 3
function getContextTeams(
  sortedTeams: RankedTeam[],
  selectedTeamId?: number
): { teams: RankedTeam[]; selectedIndex: number } {
  if (sortedTeams.length === 0) return { teams: [], selectedIndex: -1 }

  const selectedIndex = sortedTeams.findIndex((t) => t.team_id === selectedTeamId)
  const totalTeams = sortedTeams.length

  // Build context: Top 3 + around selected + Bottom 3
  const indices = new Set<number>()

  // Top 3
  for (let i = 0; i < Math.min(3, totalTeams); i++) indices.add(i)

  // Bottom 3
  for (let i = Math.max(0, totalTeams - 3); i < totalTeams; i++) indices.add(i)

  // Around selected team (1 above, selected, 1 below)
  if (selectedIndex >= 0) {
    if (selectedIndex > 0) indices.add(selectedIndex - 1)
    indices.add(selectedIndex)
    if (selectedIndex < totalTeams - 1) indices.add(selectedIndex + 1)
  }

  const sortedIndices = Array.from(indices).sort((a, b) => a - b)
  const teams = sortedIndices.map((i) => sortedTeams[i])

  return { teams, selectedIndex }
}

// Check if there's a gap between two ranks
function hasGap(prevRank: number, currentRank: number): boolean {
  return currentRank - prevRank > 1
}

function TeamRow({
  team,
  isSelected,
  teamColor,
  showPpg,
  maxValue,
}: {
  team: RankedTeam
  isSelected: boolean
  teamColor: string
  showPpg: boolean
  maxValue: number
}) {
  const value = showPpg ? safeNum(team.ppg) : safeNum(team.opp_ppg)
  const barWidth = (value / maxValue) * 100
  const isTop5 = team.rank <= 5
  const isBottom5 = team.rank >= 26

  return (
    <div className="flex items-center gap-2 py-0.5">
      {/* Rank */}
      <span
        className={cn(
          'w-6 text-right text-[10px] font-mono',
          isSelected && 'text-white font-bold',
          !isSelected && isTop5 && 'text-emerald-400',
          !isSelected && isBottom5 && 'text-red-400',
          !isSelected && !isTop5 && !isBottom5 && 'text-zinc-500'
        )}
      >
        #{team.rank}
      </span>

      {/* Team */}
      <span
        className={cn(
          'w-8 text-xs font-bold',
          isSelected ? '' : 'text-zinc-400'
        )}
        style={isSelected ? { color: teamColor } : undefined}
      >
        {team.abbreviation}
      </span>

      {/* Bar */}
      <div className="flex-1 h-3.5 bg-zinc-800 rounded overflow-hidden relative">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded',
            isSelected && 'opacity-80',
            !isSelected && isTop5 && 'bg-emerald-500/40',
            !isSelected && isBottom5 && 'bg-red-500/40',
            !isSelected && !isTop5 && !isBottom5 && 'bg-zinc-600/60'
          )}
          style={{
            width: `${barWidth}%`,
            ...(isSelected ? { backgroundColor: teamColor } : {}),
          }}
        />
      </div>

      {/* Value */}
      <span
        className={cn(
          'w-10 text-right text-[10px] font-mono',
          isSelected ? 'text-white font-bold' : 'text-zinc-500'
        )}
      >
        {value.toFixed(1)}
      </span>
    </div>
  )
}

function GapIndicator() {
  return (
    <div className="flex items-center justify-center py-0.5">
      <span className="text-zinc-600 text-[10px]">• • •</span>
    </div>
  )
}

export function TeamRankingDualChart({
  data,
  selectedTeamId,
  selectedTeamAbbreviation,
  className = '',
}: TeamRankingDualChartProps) {
  // Sort for PPG (descending - highest first)
  const ppgSorted = React.useMemo(() => {
    return [...data]
      .sort((a, b) => safeNum(b.ppg) - safeNum(a.ppg))
      .map((t, i) => ({ ...t, rank: i + 1 }))
  }, [data])

  // Sort for OPP PPG (ascending - lowest first = best defense)
  const oppPpgSorted = React.useMemo(() => {
    return [...data]
      .sort((a, b) => safeNum(a.opp_ppg) - safeNum(b.opp_ppg))
      .map((t, i) => ({ ...t, rank: i + 1 }))
  }, [data])

  // Get context teams for each ranking
  const ppgContext = React.useMemo(
    () => getContextTeams(ppgSorted, selectedTeamId),
    [ppgSorted, selectedTeamId]
  )
  const oppContext = React.useMemo(
    () => getContextTeams(oppPpgSorted, selectedTeamId),
    [oppPpgSorted, selectedTeamId]
  )

  // Calculate max values for bar widths
  const maxPpg = React.useMemo(
    () => (ppgSorted.length > 0 ? Math.max(...ppgSorted.map((t) => safeNum(t.ppg))) : 130),
    [ppgSorted]
  )
  const maxOppPpg = React.useMemo(
    () => (oppPpgSorted.length > 0 ? Math.max(...oppPpgSorted.map((t) => safeNum(t.opp_ppg))) : 130),
    [oppPpgSorted]
  )

  // Find selected team's ranks
  const selectedPpgRank = ppgSorted.find((t) => t.team_id === selectedTeamId)?.rank ?? 0
  const selectedOppRank = oppPpgSorted.find((t) => t.team_id === selectedTeamId)?.rank ?? 0
  const selectedTeam = data.find((t) => t.team_id === selectedTeamId)
  const netRating = selectedTeam
    ? safeNum(selectedTeam.ppg) - safeNum(selectedTeam.opp_ppg)
    : 0

  // Team colors
  const teamColors = getTeamColors(selectedTeamAbbreviation || 'NBA')

  // Generate betting insight
  const getBettingInsight = () => {
    if (!selectedTeam) return null

    const isTopOffense = selectedPpgRank <= 10
    const isTopDefense = selectedOppRank <= 10
    const isBottomOffense = selectedPpgRank >= 21
    const isBottomDefense = selectedOppRank >= 21

    if (isTopOffense && isTopDefense) {
      return {
        icon: TrendingUp,
        text: `Élite des deux côtés → Overs possibles mais prudence (équipes faibles peuvent scorer)`,
        type: 'positive',
      }
    }
    if (isTopDefense && isBottomOffense) {
      return {
        icon: TrendingDown,
        text: `Défense Top-10 mais attaque faible → Unders favorables`,
        type: 'negative',
      }
    }
    if (isTopOffense && isBottomDefense) {
      return {
        icon: TrendingUp,
        text: `Attaque puissante, défense poreuse → Overs élevés probables`,
        type: 'positive',
      }
    }
    if (isBottomOffense && isBottomDefense) {
      return {
        icon: TrendingDown,
        text: `Faible des deux côtés → Éviter les paris sur cette équipe`,
        type: 'negative',
      }
    }
    if (isTopDefense) {
      return {
        icon: Shield,
        text: `Défense solide (#${selectedOppRank}) → Avantage sur les unders`,
        type: 'neutral',
      }
    }
    if (isTopOffense) {
      return {
        icon: Target,
        text: `Attaque explosive (#${selectedPpgRank}) → Potentiel overs élevés`,
        type: 'neutral',
      }
    }
    return {
      icon: Minus,
      text: `Profil équilibré → Analyser le matchup spécifique`,
      type: 'neutral',
    }
  }

  const insight = getBettingInsight()

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'bg-zinc-900/50 border border-zinc-800 rounded-xl p-4',
          className
        )}
      >
        <p className="text-zinc-500 text-sm text-center">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl', className)}>
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              CLASSEMENT LIGUE
            </h2>
            <p className="text-[10px] tracking-[0.15em] uppercase text-zinc-500">
              Position de {selectedTeamAbbreviation || 'l\'équipe'} • Attaque & Défense
            </p>
          </div>

          {/* Rank Badges */}
          {selectedTeamId && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] text-zinc-500">ATT:</span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-bold',
                    selectedPpgRank <= 10
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : selectedPpgRank >= 21
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-zinc-700 text-zinc-300'
                  )}
                >
                  #{selectedPpgRank}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] text-zinc-500">DÉF:</span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-bold',
                    selectedOppRank <= 10
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : selectedOppRank >= 21
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-zinc-700 text-zinc-300'
                  )}
                >
                  #{selectedOppRank}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500">NET:</span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-bold',
                    netRating > 0
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : netRating < 0
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-zinc-700 text-zinc-300'
                  )}
                >
                  {netRating > 0 ? '+' : ''}
                  {netRating.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dual Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
        {/* Left: Offense (PPG) */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4" style={{ color: teamColors.primary }} />
            <span className="text-xs font-bold uppercase tracking-wide text-white">
              Attaque (PPG)
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">Plus = meilleur • Trié par PPG desc.</p>

          {/* Column headers */}
          <div className="flex items-center gap-2 pb-1 mb-1 border-b border-zinc-800/50 text-[9px] text-zinc-600 uppercase tracking-wide">
            <span className="w-6 text-right">#</span>
            <span className="w-8">Team</span>
            <span className="flex-1">PPG</span>
            <span className="w-10 text-right">Pts</span>
          </div>

          <div className="space-y-0">
            {ppgContext.teams.map((team, idx) => {
              const prevTeam = idx > 0 ? ppgContext.teams[idx - 1] : null
              const showGap = prevTeam && hasGap(prevTeam.rank, team.rank)
              const isSelected = team.team_id === selectedTeamId

              return (
                <React.Fragment key={team.team_id}>
                  {showGap && <GapIndicator />}
                  <TeamRow
                    team={team}
                    isSelected={isSelected}
                    teamColor={teamColors.primary}
                    showPpg={true}
                    maxValue={maxPpg}
                  />
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Right: Defense (OPP PPG) */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wide text-white">
              Défense (OPP PPG)
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">Moins = meilleur • Trié par OPP PPG asc.</p>

          {/* Column headers */}
          <div className="flex items-center gap-2 pb-1 mb-1 border-b border-zinc-800/50 text-[9px] text-zinc-600 uppercase tracking-wide">
            <span className="w-6 text-right">#</span>
            <span className="w-8">Team</span>
            <span className="flex-1">OPP PPG</span>
            <span className="w-10 text-right">Pts</span>
          </div>

          <div className="space-y-0">
            {oppContext.teams.map((team, idx) => {
              const prevTeam = idx > 0 ? oppContext.teams[idx - 1] : null
              const showGap = prevTeam && hasGap(prevTeam.rank, team.rank)
              const isSelected = team.team_id === selectedTeamId

              return (
                <React.Fragment key={team.team_id}>
                  {showGap && <GapIndicator />}
                  <TeamRow
                    team={team}
                    isSelected={isSelected}
                    teamColor={teamColors.primary}
                    showPpg={false}
                    maxValue={maxOppPpg}
                  />
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Betting Insight Footer */}
      {insight && (
        <div className="px-4 py-3 border-t border-zinc-800 bg-amber-500/5">
          <div className="flex items-start gap-2">
            <insight.icon
              className={cn(
                'w-4 h-4 mt-0.5 flex-shrink-0',
                insight.type === 'positive' && 'text-emerald-400',
                insight.type === 'negative' && 'text-red-400',
                insight.type === 'neutral' && 'text-amber-400'
              )}
            />
            <p className="text-xs text-zinc-300 leading-relaxed">{insight.text}</p>
          </div>
        </div>
      )}
    </div>
  )
}
