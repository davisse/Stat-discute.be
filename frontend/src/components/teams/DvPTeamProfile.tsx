'use client'

import * as React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import { getTeamColors } from '@/lib/team-colors'
import { Users, Target, Shield, TrendingUp } from 'lucide-react'

/**
 * DvPTeamProfile - Compact Dual Cards Layout with Mini-Radar
 *
 * Left: Simplified radar chart (visual overview)
 * Right: Position details with inline bars (data)
 */

interface DvPHeatmapCell {
  team_id: number
  team_abbreviation: string
  position: string
  points_allowed_per_game: number
  points_allowed_rank: number
  fg_pct_allowed: number
  league_avg: number
  diff_from_avg: number
}

interface DvPApiResponse {
  cells: DvPHeatmapCell[]
  league_averages: { position: string; avg_points: number }[]
  positions: string[]
}

export interface DvPTeamProfileProps {
  teamId: number
  teamAbbreviation: string
  className?: string
}

interface PositionData {
  position: string
  positionFull: string
  pointsAllowed: number
  rank: number
  leagueAvg: number
  diffFromAvg: number
  tier: 'elite' | 'good' | 'average' | 'below' | 'weak'
}

// Position full names
const POSITION_NAMES: Record<string, string> = {
  PG: 'Point Guard',
  SG: 'Shooting Guard',
  SF: 'Small Forward',
  PF: 'Power Forward',
  C: 'Center',
}

// Tier configuration
const TIER_CONFIG = {
  elite: { label: 'Elite', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400' },
  good: { label: 'Bon', bgClass: 'bg-green-500/20', textClass: 'text-green-400' },
  average: { label: 'Moyen', bgClass: 'bg-zinc-500/20', textClass: 'text-zinc-400' },
  below: { label: 'Faible', bgClass: 'bg-orange-500/20', textClass: 'text-orange-400' },
  weak: { label: 'Mauvais', bgClass: 'bg-red-500/20', textClass: 'text-red-400' },
}

// Get tier from rank
function getTierFromRank(rank: number): 'elite' | 'good' | 'average' | 'below' | 'weak' {
  if (rank <= 6) return 'elite'
  if (rank <= 12) return 'good'
  if (rank <= 18) return 'average'
  if (rank <= 24) return 'below'
  return 'weak'
}

// Transform API data
function transformData(
  cells: DvPHeatmapCell[],
  leagueAverages: { position: string; avg_points: number }[]
): PositionData[] {
  const avgMap = new Map(leagueAverages.map(la => [la.position, la.avg_points]))

  return cells.map(cell => ({
    position: cell.position,
    positionFull: POSITION_NAMES[cell.position] || cell.position,
    pointsAllowed: cell.points_allowed_per_game,
    rank: cell.points_allowed_rank,
    leagueAvg: avgMap.get(cell.position) ?? cell.league_avg,
    diffFromAvg: cell.diff_from_avg,
    tier: getTierFromRank(cell.points_allowed_rank),
  }))
}

// Profile badge component
function ProfileBadge({ label, count, type }: { label: string; count: number; type: 'elite' | 'weak' }) {
  if (count === 0) return null
  const isElite = type === 'elite'
  return (
    <div className="flex items-center gap-1.5">
      {isElite ? (
        <Shield className="w-3 h-3 text-emerald-400" />
      ) : (
        <Target className="w-3 h-3 text-red-400" />
      )}
      <span className={cn(
        'px-1.5 py-0.5 rounded text-[9px] font-semibold',
        isElite ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
      )}>
        {label}: {count}
      </span>
    </div>
  )
}

// Position row with inline bar
function PositionRow({
  data,
  minValue,
  maxValue,
  teamColor,
}: {
  data: PositionData
  minValue: number
  maxValue: number
  teamColor: string
}) {
  const range = maxValue - minValue
  const barWidth = ((data.pointsAllowed - minValue) / range) * 100
  const avgPosition = ((data.leagueAvg - minValue) / range) * 100

  const isGood = data.diffFromAvg < -1
  const isBad = data.diffFromAvg > 1
  const isTarget = data.rank >= 20
  const isAvoid = data.rank <= 6

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Position */}
      <span className="w-7 text-xs font-bold" style={{ color: teamColor }}>{data.position}</span>

      {/* PPG bar */}
      <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden relative">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded',
            isGood && 'bg-emerald-500/60',
            isBad && 'bg-red-500/60',
            !isGood && !isBad && 'bg-zinc-600/60'
          )}
          style={{ width: `${barWidth}%` }}
        />
        {/* League average line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white/50 z-10"
          style={{ left: `${avgPosition}%` }}
        />
        <span className="absolute inset-0 flex items-center px-1.5 text-[10px] font-mono text-white/90">
          {data.pointsAllowed.toFixed(1)}
        </span>
      </div>

      {/* Diff */}
      <span className={cn(
        'w-10 text-right text-[10px] font-mono font-bold',
        isGood && 'text-emerald-400',
        isBad && 'text-red-400',
        !isGood && !isBad && 'text-zinc-500'
      )}>
        {data.diffFromAvg > 0 ? '+' : ''}{data.diffFromAvg.toFixed(1)}
      </span>

      {/* Rank */}
      <span className={cn(
        'w-7 text-right text-[10px] font-mono',
        data.rank <= 5 && 'text-emerald-400',
        data.rank >= 26 && 'text-red-400',
        data.rank > 5 && data.rank < 26 && 'text-zinc-500'
      )}>
        #{data.rank}
      </span>

      {/* Target/Avoid icon */}
      {isTarget && <Target className="w-3 h-3 text-red-400 flex-shrink-0" />}
      {isAvoid && <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
      {!isTarget && !isAvoid && <span className="w-3" />}
    </div>
  )
}

// Mini radar chart component
function MiniRadarChart({
  data,
  teamAbbreviation,
  teamColor,
}: {
  data: PositionData[]
  teamAbbreviation: string
  teamColor: string
}) {
  const maxValue = Math.max(...data.map(d => d.pointsAllowed), ...data.map(d => d.leagueAvg)) + 2
  const minValue = Math.min(...data.map(d => d.pointsAllowed), ...data.map(d => d.leagueAvg)) - 2

  // Sort by position order
  const positionOrder = ['PG', 'SG', 'SF', 'PF', 'C']
  const sortedData = [...data].sort((a, b) =>
    positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position)
  )

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-2 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: teamColor, opacity: 0.6 }} />
          <span className="text-zinc-400">{teamAbbreviation}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 border-t border-dashed border-white/40" />
          <span className="text-zinc-400">Moy. Ligue</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={sortedData} cx="50%" cy="50%" outerRadius="70%">
          <defs>
            <linearGradient id="miniRadarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={teamColor} stopOpacity="0.4"/>
              <stop offset="100%" stopColor={teamColor} stopOpacity="0.1"/>
            </linearGradient>
          </defs>

          <PolarGrid
            stroke="rgba(255,255,255,0.1)"
            strokeDasharray="2 4"
            gridType="polygon"
          />

          <PolarRadiusAxis
            domain={[minValue, maxValue]}
            tick={false}
            axisLine={false}
          />

          <PolarAngleAxis
            dataKey="position"
            tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 600 }}
          />

          {/* League average overlay */}
          <Radar
            name="League Avg"
            dataKey="leagueAvg"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
            strokeDasharray="3 3"
            fill="none"
          />

          {/* Team defense polygon */}
          <Radar
            name={teamAbbreviation}
            dataKey="pointsAllowed"
            stroke={teamColor}
            strokeWidth={2}
            fill="url(#miniRadarGradient)"
            dot={{ r: 3, fill: teamColor, stroke: '#fff', strokeWidth: 1 }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Scale hint */}
      <p className="text-center text-[9px] text-zinc-600 mt-1">
        Petit polygone = meilleure défense
      </p>
    </div>
  )
}

export function DvPTeamProfile({ teamId, teamAbbreviation, className }: DvPTeamProfileProps) {
  const [data, setData] = React.useState<PositionData[] | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const teamColors = getTeamColors(teamAbbreviation)

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch('/api/teams/dvp')
        if (!res.ok) throw new Error('Failed to fetch DvP data')

        const apiData: DvPApiResponse = await res.json()
        const teamCells = apiData.cells.filter(c => Number(c.team_id) === Number(teamId))

        if (teamCells.length === 0) {
          throw new Error('Données DvP indisponibles')
        }

        const transformed = transformData(teamCells, apiData.league_averages)
        setData(transformed)
      } catch (err) {
        console.error('Error fetching DvP data:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-4', className)}>
        <div className="flex items-center justify-center gap-3 text-zinc-500 py-8">
          <div className="w-4 h-4 border-2 border-zinc-500 border-t-amber-400 rounded-full animate-spin" />
          <span className="text-sm">Chargement...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-4', className)}>
        <div className="text-center py-6">
          <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
      </div>
    )
  }

  // No data state
  if (!data) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-4', className)}>
        <div className="text-center py-6">
          <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  // Calculate stats for header
  const eliteCount = data.filter(d => d.tier === 'elite').length
  const weakCount = data.filter(d => d.tier === 'weak').length
  const targets = data.filter(d => d.rank >= 20).sort((a, b) => b.rank - a.rank)
  const avoids = data.filter(d => d.rank <= 6).sort((a, b) => a.rank - b.rank)

  // Calculate scale for bars
  const allValues = [...data.map(d => d.pointsAllowed), ...data.map(d => d.leagueAvg)]
  const minValue = Math.min(...allValues) - 1
  const maxValue = Math.max(...allValues) + 1

  // Sort by position order
  const positionOrder = ['PG', 'SG', 'SF', 'PF', 'C']
  const sortedData = [...data].sort((a, b) =>
    positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position)
  )

  return (
    <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl', className)}>
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              DVP PROFILE
            </h2>
            <p className="text-[10px] tracking-[0.15em] uppercase text-zinc-500">
              Points Allowed by Position
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProfileBadge label="Elite" count={eliteCount} type="elite" />
            <ProfileBadge label="Faible" count={weakCount} type="weak" />
          </div>
        </div>
      </div>

      {/* Dual Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
        {/* Left: Mini Radar */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" style={{ color: teamColors.primary }} />
            <span className="text-xs font-bold uppercase tracking-wide text-white">
              Vue d'ensemble
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">
            Forme du polygone par position adverse
          </p>

          <MiniRadarChart
            data={data}
            teamAbbreviation={teamAbbreviation}
            teamColor={teamColors.primary}
          />
        </div>

        {/* Right: Position Details */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wide text-white">
              Détails par Position
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">
            Points concédés vs moyenne ligue
          </p>

          {/* Column headers */}
          <div className="flex items-center gap-2 pb-1 mb-1 border-b border-zinc-800/50 text-[9px] text-zinc-600 uppercase tracking-wide">
            <span className="w-7">Pos</span>
            <span className="flex-1">PPG</span>
            <span className="w-10 text-right">vs Avg</span>
            <span className="w-7 text-right">Rank</span>
            <span className="w-3"></span>
          </div>

          <div className="space-y-0.5">
            {sortedData.map(posData => (
              <PositionRow
                key={posData.position}
                data={posData}
                minValue={minValue}
                maxValue={maxValue}
                teamColor={teamColors.primary}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-3 text-[9px] text-zinc-500">
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-3 bg-white/50" />
              <span>Moy. Ligue</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-2.5 h-2.5 text-red-400" />
              <span>Cible</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-emerald-400" />
              <span>Éviter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Betting Insight Footer */}
      <div className="px-4 py-3 border-t border-zinc-800 bg-amber-500/5">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex flex-wrap gap-3 mb-1">
              {targets.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-zinc-500">Cibles:</span>
                  <span className="text-[10px] font-bold text-red-400">
                    {targets.map(t => `${t.position} (#${t.rank})`).join(', ')}
                  </span>
                </div>
              )}
              {avoids.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-zinc-500">Éviter:</span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    {avoids.map(a => `${a.position} (#${a.rank})`).join(', ')}
                  </span>
                </div>
              )}
              {targets.length === 0 && avoids.length === 0 && (
                <span className="text-[10px] text-zinc-400">Pas de matchup extrême</span>
              )}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {targets.length > 0
                ? `Privilégiez les props Over pour les ${targets.map(t => t.positionFull).join(' et ')}.`
                : avoids.length > 0
                ? `Défense solide sur ${avoids.map(a => a.positionFull).join(' et ')}, évitez ces positions.`
                : 'Profil défensif équilibré, analysez les matchups spécifiques.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
