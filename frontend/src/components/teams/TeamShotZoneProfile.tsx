'use client'

import * as React from 'react'
import { Target, Shield, TrendingUp, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTeamColors } from '@/lib/team-colors'
import type { TeamShotZonesResponse, ZoneStats } from '@/lib/queries'

/**
 * TeamShotZoneProfile - Compact Dual Cards Layout
 *
 * Displays offensive and defensive shot zone profiles side by side
 * with inline progress bars for a ~50% more compact view.
 */

export interface TeamShotZoneProfileProps {
  teamId: number
  teamAbbreviation: string
  className?: string
}

// Zone display names
const ZONE_LABELS: Record<string, string> = {
  restrictedArea: 'RA',
  paintNonRA: 'Paint',
  midRange: 'Mid',
  corner3: 'C3',
  aboveBreak3: 'AB3',
}

// Profile badge colors and labels
const PROFILE_CONFIG: Record<string, { label: string; bgClass: string; textClass: string }> = {
  // Offensive profiles
  paint_heavy: { label: 'Jeu intérieur', bgClass: 'bg-orange-500/20', textClass: 'text-orange-400' },
  three_heavy: { label: 'Shooteurs', bgClass: 'bg-blue-500/20', textClass: 'text-blue-400' },
  mid_heavy: { label: 'Mid-Range', bgClass: 'bg-purple-500/20', textClass: 'text-purple-400' },
  balanced: { label: 'Équilibré', bgClass: 'bg-zinc-500/20', textClass: 'text-zinc-400' },
  // Defensive profiles
  paint_protector: { label: 'Protège raquette', bgClass: 'bg-green-500/20', textClass: 'text-green-400' },
  perimeter_defender: { label: 'Déf. périmètre', bgClass: 'bg-cyan-500/20', textClass: 'text-cyan-400' },
  rim_weak: { label: 'Faible cercle', bgClass: 'bg-red-500/20', textClass: 'text-red-400' },
  perimeter_weak: { label: 'Faible périm.', bgClass: 'bg-red-500/20', textClass: 'text-red-400' },
  balanced_defense: { label: 'Déf. équilibrée', bgClass: 'bg-zinc-500/20', textClass: 'text-zinc-400' },
}

function ProfileBadge({ profile }: { profile: string }) {
  const config = PROFILE_CONFIG[profile] || {
    label: profile,
    bgClass: 'bg-zinc-500/20',
    textClass: 'text-zinc-400',
  }

  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
        config.bgClass,
        config.textClass
      )}
    >
      {config.label}
    </span>
  )
}

function CompactZoneRow({
  zone,
  stats,
  leagueAvg,
  teamColor,
  isDefense,
  showFreq = true,
}: {
  zone: string
  stats: ZoneStats
  leagueAvg: number
  teamColor: string
  isDefense?: boolean
  showFreq?: boolean
}) {
  const fgPct = stats.fgPct * 100
  const deviation = (stats.fgPct - leagueAvg) * 100
  const isGood = isDefense ? deviation < -2 : deviation > 2
  const isBad = isDefense ? deviation > 2 : deviation < -2

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Zone label */}
      <span className="w-10 text-xs text-zinc-400 font-medium">{ZONE_LABELS[zone]}</span>

      {/* Progress bar (frequency for offense) */}
      {showFreq && (
        <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden relative">
          <div
            className="absolute inset-y-0 left-0 rounded"
            style={{
              width: `${Math.min(stats.freq * 100 * 2.5, 100)}%`,
              backgroundColor: teamColor,
              opacity: 0.7,
            }}
          />
          <span className="absolute inset-0 flex items-center px-1.5 text-[10px] font-mono text-white/90">
            {(stats.freq * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* FG% */}
      <span className="w-12 text-right text-xs font-mono font-bold text-white">
        {fgPct.toFixed(1)}%
      </span>

      {/* Diff indicator */}
      <span
        className={cn(
          'w-10 text-right text-[10px] font-mono',
          isGood && 'text-emerald-400',
          isBad && 'text-red-400',
          !isGood && !isBad && 'text-zinc-500'
        )}
      >
        {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}
      </span>

      {/* Status indicator for defense */}
      {isDefense && isBad && (
        <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
      )}
      {isDefense && isGood && (
        <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0" />
      )}
      {isDefense && !isGood && !isBad && (
        <span className="w-3" />
      )}
    </div>
  )
}

function DefenseZoneRow({
  zone,
  stats,
  leagueAvg,
  leagueAvgFreq,
}: {
  zone: string
  stats: ZoneStats
  leagueAvg: number
  leagueAvgFreq: number
}) {
  const fgPct = stats.fgPct * 100
  const freq = stats.freq * 100
  const deviation = (stats.fgPct - leagueAvg) * 100
  const freqDeviation = (stats.freq - leagueAvgFreq) * 100
  const isGood = deviation < -2
  const isBad = deviation > 2
  // For defense: high freq at rim = bad, high freq at 3 = good (forcing outside shots)
  const isRimZone = zone === 'restrictedArea' || zone === 'paintNonRA'
  const freqIsGood = isRimZone ? freqDeviation < -3 : freqDeviation > 3
  const freqIsBad = isRimZone ? freqDeviation > 3 : freqDeviation < -3

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Zone label */}
      <span className="w-10 text-xs text-zinc-400 font-medium">{ZONE_LABELS[zone]}</span>

      {/* Frequency bar - shows opponent shot distribution */}
      <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden relative">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded',
            freqIsBad && 'bg-red-500/70',
            freqIsGood && 'bg-emerald-500/70',
            !freqIsGood && !freqIsBad && 'bg-cyan-500/50'
          )}
          style={{
            width: `${Math.min(freq * 2.5, 100)}%`,
          }}
        />
        <span className="absolute inset-0 flex items-center px-1.5 text-[10px] font-mono text-white/90">
          {freq.toFixed(0)}%
        </span>
      </div>

      {/* FG% allowed */}
      <span className="w-12 text-right text-xs font-mono font-bold text-white">
        {fgPct.toFixed(1)}%
      </span>

      {/* Diff indicator */}
      <span
        className={cn(
          'w-10 text-right text-[10px] font-mono',
          isGood && 'text-emerald-400',
          isBad && 'text-red-400',
          !isGood && !isBad && 'text-zinc-500'
        )}
      >
        {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}
      </span>

      {/* Status indicator */}
      {isBad && (
        <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
      )}
      {isGood && (
        <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0" />
      )}
      {!isGood && !isBad && (
        <span className="w-3" />
      )}
    </div>
  )
}

export function TeamShotZoneProfile({
  teamId,
  teamAbbreviation,
  className,
}: TeamShotZoneProfileProps) {
  const [data, setData] = React.useState<TeamShotZonesResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const teamColors = getTeamColors(teamAbbreviation)

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch(`/api/teams/${teamId}/shot-zones`)

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Données de zones non disponibles.')
          }
          throw new Error('Erreur lors du chargement des zones de tir.')
        }

        const zonesData: TeamShotZonesResponse = await res.json()
        setData(zonesData)
      } catch (err) {
        console.error('Error fetching shot zones:', err)
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
          <Target className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
      </div>
    )
  }

  // No data state
  if (!data || (!data.offense && !data.defense)) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-4', className)}>
        <div className="text-center py-6">
          <Target className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  const zones: string[] = ['restrictedArea', 'paintNonRA', 'midRange', 'corner3', 'aboveBreak3']

  return (
    <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl', className)}>
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
            SHOOTING ZONES
          </h2>
          <p className="text-[10px] tracking-[0.15em] uppercase text-zinc-500">
            Distribution • Offense & Défense
          </p>
        </div>
        <div className="flex gap-2">
          {data.offense?.profile && <ProfileBadge profile={data.offense.profile} />}
          {data.defense?.profile && <ProfileBadge profile={data.defense.profile} />}
        </div>
      </div>

      {/* Dual Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
        {/* Offensive Card */}
        {data.offense && data.leagueAvgOffense && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" style={{ color: teamColors.primary }} />
              <span className="text-xs font-bold uppercase tracking-wide text-white">Offense</span>
            </div>
            <p className="text-[10px] text-zinc-500 mb-2">
              Où l'équipe choisit de tirer et son efficacité par zone
            </p>

            {/* Column headers */}
            <div className="flex items-center gap-2 pb-1 mb-1 border-b border-zinc-800/50 text-[9px] text-zinc-600 uppercase tracking-wide">
              <span className="w-10">Zone</span>
              <span className="flex-1">Fréq.</span>
              <span className="w-12 text-right">FG%</span>
              <span className="w-10 text-right">vs Avg</span>
            </div>

            <div className="space-y-0.5">
              {zones.map((zone) => {
                const stats = data.offense![zone as keyof typeof data.offense] as ZoneStats
                const leagueAvgZone = data.leagueAvgOffense![zone as keyof typeof data.leagueAvgOffense]
                const leagueAvg = typeof leagueAvgZone === 'object' && leagueAvgZone !== null ? leagueAvgZone.fgPct : 0

                return (
                  <CompactZoneRow
                    key={zone}
                    zone={zone}
                    stats={stats}
                    leagueAvg={leagueAvg}
                    teamColor={teamColors.primary}
                  />
                )
              })}
            </div>

            {/* Total */}
            <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Total</span>
              <span className="text-sm font-bold font-mono text-white">
                {(data.offense.totalFgPct * 100).toFixed(1)}% FG
              </span>
            </div>
          </div>
        )}

        {/* Defensive Card */}
        {data.defense && data.leagueAvgDefense && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wide text-white">Défense</span>
            </div>
            <p className="text-[10px] text-zinc-500 mb-2">
              Où les adversaires tirent et leur réussite contre cette défense
            </p>

            {/* Column headers */}
            <div className="flex items-center gap-2 pb-1 mb-1 border-b border-zinc-800/50 text-[9px] text-zinc-600 uppercase tracking-wide">
              <span className="w-10">Zone</span>
              <span className="flex-1">Fréq.</span>
              <span className="w-12 text-right">FG%</span>
              <span className="w-10 text-right">vs Avg</span>
              <span className="w-3"></span>
            </div>

            <div className="space-y-0.5">
              {zones.map((zone) => {
                const stats = data.defense![zone as keyof typeof data.defense] as ZoneStats
                const leagueAvgZone = data.leagueAvgDefense![zone as keyof typeof data.leagueAvgDefense]
                const leagueAvg = typeof leagueAvgZone === 'object' && leagueAvgZone !== null ? leagueAvgZone.fgPct : 0
                const leagueAvgFreq = typeof leagueAvgZone === 'object' && leagueAvgZone !== null ? leagueAvgZone.freq : 0

                return (
                  <DefenseZoneRow
                    key={zone}
                    zone={zone}
                    stats={stats}
                    leagueAvg={leagueAvg}
                    leagueAvgFreq={leagueAvgFreq}
                  />
                )
              })}
            </div>

            {/* Total */}
            <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500">FG% adverse</span>
              <span className="text-sm font-bold font-mono text-white">
                {(data.defense.totalFgPct * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Betting Insight (compact) */}
      {data.matchupInsights && (
        <div className="px-4 py-3 border-t border-zinc-800 bg-amber-500/5">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300 leading-relaxed">
              {data.matchupInsights.bettingTip}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
