'use client'

import * as React from 'react'
import { Shield, Users, AlertCircle, TrendingUp, TrendingDown, Zap, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTeamColors } from '@/lib/team-colors'
import type { DefensiveSystemAnalysisData, DvPPositionData, DefensiveZoneData, DefensiveSystemInsight } from '@/lib/queries'

/**
 * DefensiveSystemAnalysis - Compact Dual Cards Layout
 *
 * Combined DvP + Shot Zone Analysis
 * Left: DvP by Position (WHO scores)
 * Right: Shot Zone Defense (WHERE they score)
 */

export interface DefensiveSystemAnalysisProps {
  teamId: number
  teamAbbreviation: string
  className?: string
}

// Tier configuration
const TIER_CONFIG = {
  elite: { label: 'Elite', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400' },
  good: { label: 'Bon', bgClass: 'bg-green-500/20', textClass: 'text-green-400' },
  average: { label: 'Moyen', bgClass: 'bg-zinc-500/20', textClass: 'text-zinc-400' },
  below: { label: 'Faible', bgClass: 'bg-orange-500/20', textClass: 'text-orange-400' },
  weak: { label: 'Mauvais', bgClass: 'bg-red-500/20', textClass: 'text-red-400' },
}

function ProfileBadge({ label, value }: { label: string; value: keyof typeof TIER_CONFIG }) {
  const config = TIER_CONFIG[value]
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] text-zinc-500 uppercase">{label}:</span>
      <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-semibold', config.bgClass, config.textClass)}>
        {config.label}
      </span>
    </div>
  )
}

function DvPPositionRow({ data, teamColor }: { data: DvPPositionData; teamColor: string }) {
  const isGood = data.diff < -1
  const isBad = data.diff > 1

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Position */}
      <span className="w-8 text-xs font-bold" style={{ color: teamColor }}>{data.position}</span>

      {/* PPG bar */}
      <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden relative">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded',
            isGood && 'bg-emerald-500/60',
            isBad && 'bg-red-500/60',
            !isGood && !isBad && 'bg-zinc-600/60'
          )}
          style={{ width: `${Math.min(data.pointsAllowed * 2.5, 100)}%` }}
        />
        <span className="absolute inset-0 flex items-center px-1.5 text-[10px] font-mono text-white/90">
          {data.pointsAllowed.toFixed(1)} PPG
        </span>
      </div>

      {/* Diff */}
      <span className={cn(
        'w-10 text-right text-[10px] font-mono font-bold',
        isGood && 'text-emerald-400',
        isBad && 'text-red-400',
        !isGood && !isBad && 'text-zinc-500'
      )}>
        {data.diff > 0 ? '+' : ''}{data.diff.toFixed(1)}
      </span>

      {/* Rank */}
      <span className={cn(
        'w-8 text-right text-[10px] font-mono',
        data.rank <= 5 && 'text-emerald-400',
        data.rank >= 26 && 'text-red-400',
        data.rank > 5 && data.rank < 26 && 'text-zinc-500'
      )}>
        #{data.rank}
      </span>
    </div>
  )
}

function ZoneDefenseRow({ data }: { data: DefensiveZoneData }) {
  const isGood = data.isStrength
  const isBad = data.isWeakness

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Zone name */}
      <span className="w-16 text-xs text-zinc-400">{data.zoneFr}</span>

      {/* FG% bar */}
      <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden relative">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded',
            isGood && 'bg-emerald-500/60',
            isBad && 'bg-red-500/60',
            !isGood && !isBad && 'bg-cyan-500/50'
          )}
          style={{ width: `${Math.min(data.fgPctAllowed * 100 * 1.5, 100)}%` }}
        />
        <span className="absolute inset-0 flex items-center px-1.5 text-[10px] font-mono text-white/90">
          {(data.fgPctAllowed * 100).toFixed(1)}%
        </span>
      </div>

      {/* Diff */}
      <span className={cn(
        'w-12 text-right text-[10px] font-mono font-bold',
        isGood && 'text-emerald-400',
        isBad && 'text-red-400',
        !isGood && !isBad && 'text-zinc-500'
      )}>
        {data.diff > 0 ? '+' : ''}{data.diff.toFixed(1)}%
      </span>

      {/* Status icon */}
      {isBad && <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}
      {isGood && <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
      {!isGood && !isBad && <span className="w-3" />}
    </div>
  )
}

function InsightBadge({ insight }: { insight: DefensiveSystemInsight }) {
  const isParadox = insight.type === 'paradox'
  const isStrength = insight.type === 'strength'
  const isWeakness = insight.type === 'weakness'

  return (
    <div className={cn(
      'p-2.5 rounded-lg border',
      isParadox && 'bg-amber-500/10 border-amber-500/20',
      isStrength && 'bg-emerald-500/10 border-emerald-500/20',
      isWeakness && 'bg-red-500/10 border-red-500/20',
      !isParadox && !isStrength && !isWeakness && 'bg-zinc-800/50 border-zinc-700'
    )}>
      <div className="flex items-start gap-2">
        {isParadox && <Zap className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />}
        {isStrength && <Shield className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />}
        {isWeakness && <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />}
        <div className="min-w-0">
          <h5 className={cn(
            'text-[10px] font-bold uppercase tracking-wide mb-0.5',
            isParadox && 'text-amber-400',
            isStrength && 'text-emerald-400',
            isWeakness && 'text-red-400',
            !isParadox && !isStrength && !isWeakness && 'text-zinc-400'
          )}>
            {insight.title}
          </h5>
          <p className="text-[11px] text-zinc-300 leading-relaxed">{insight.description}</p>
        </div>
      </div>
    </div>
  )
}

export function DefensiveSystemAnalysis({
  teamId,
  teamAbbreviation,
  className,
}: DefensiveSystemAnalysisProps) {
  const [data, setData] = React.useState<DefensiveSystemAnalysisData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const teamColors = getTeamColors(teamAbbreviation)

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch(`/api/teams/${teamId}/defensive-system`)

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Données insuffisantes.')
          }
          throw new Error('Erreur de chargement.')
        }

        const analysisData: DefensiveSystemAnalysisData = await res.json()
        setData(analysisData)
      } catch (err) {
        console.error('Error fetching defensive system analysis:', err)
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
          <Shield className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
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
          <Shield className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">Aucune donnée disponible</p>
        </div>
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
              DEFENSIVE SYSTEM
            </h2>
            <p className="text-[10px] tracking-[0.15em] uppercase text-zinc-500">
              DvP + Shot Zones • Position vs Location
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProfileBadge label="Cercle" value={data.systemProfile.rimProtection} />
            <ProfileBadge label="Périm." value={data.systemProfile.perimeterDefense} />
          </div>
        </div>
      </div>

      {/* Insights (if paradox or important) */}
      {data.insights.length > 0 && (
        <div className="px-4 py-3 border-b border-zinc-800 space-y-2">
          {data.insights.slice(0, 2).map((insight, idx) => (
            <InsightBadge key={idx} insight={insight} />
          ))}
        </div>
      )}

      {/* Dual Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
        {/* Left: DvP by Position */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" style={{ color: teamColors.primary }} />
            <span className="text-xs font-bold uppercase tracking-wide text-white">
              Défense par Position
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">
            Points concédés par position adverse (QUI marque)
          </p>

          {/* Column headers */}
          <div className="flex items-center gap-2 pb-1 mb-1 border-b border-zinc-800/50 text-[9px] text-zinc-600 uppercase tracking-wide">
            <span className="w-8">Pos</span>
            <span className="flex-1">PPG</span>
            <span className="w-10 text-right">vs Avg</span>
            <span className="w-8 text-right">Rank</span>
          </div>

          <div className="space-y-0.5">
            {data.dvpByPosition.map(pos => (
              <DvPPositionRow key={pos.position} data={pos} teamColor={teamColors.primary} />
            ))}
          </div>
        </div>

        {/* Right: Shot Zone Defense */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wide text-white">
              Défense par Zone
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">
            FG% concédé par zone de tir (OÙ ils marquent)
          </p>

          {/* Column headers */}
          <div className="flex items-center gap-2 pb-1 mb-1 border-b border-zinc-800/50 text-[9px] text-zinc-600 uppercase tracking-wide">
            <span className="w-16">Zone</span>
            <span className="flex-1">FG%</span>
            <span className="w-12 text-right">vs Avg</span>
            <span className="w-3"></span>
          </div>

          <div className="space-y-0.5">
            {data.shotZoneDefense.map(zone => (
              <ZoneDefenseRow key={zone.zone} data={zone} />
            ))}
          </div>
        </div>
      </div>

      {/* Betting Recommendations Footer */}
      <div className="px-4 py-3 border-t border-zinc-800 bg-amber-500/5">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex flex-wrap gap-3 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-zinc-500">vs Guards:</span>
                <span className={cn(
                  'text-[10px] font-bold uppercase',
                  data.bettingRecommendations.vsGuardDriven === 'over' && 'text-emerald-400',
                  data.bettingRecommendations.vsGuardDriven === 'under' && 'text-red-400',
                  data.bettingRecommendations.vsGuardDriven === 'neutral' && 'text-zinc-400'
                )}>
                  {data.bettingRecommendations.vsGuardDriven}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-zinc-500">vs Paint:</span>
                <span className={cn(
                  'text-[10px] font-bold uppercase',
                  data.bettingRecommendations.vsPaintHeavy === 'over' && 'text-emerald-400',
                  data.bettingRecommendations.vsPaintHeavy === 'under' && 'text-red-400',
                  data.bettingRecommendations.vsPaintHeavy === 'neutral' && 'text-zinc-400'
                )}>
                  {data.bettingRecommendations.vsPaintHeavy}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-zinc-500">vs 3PT:</span>
                <span className={cn(
                  'text-[10px] font-bold uppercase',
                  data.bettingRecommendations.vsThreeHeavy === 'over' && 'text-emerald-400',
                  data.bettingRecommendations.vsThreeHeavy === 'under' && 'text-red-400',
                  data.bettingRecommendations.vsThreeHeavy === 'neutral' && 'text-zinc-400'
                )}>
                  {data.bettingRecommendations.vsThreeHeavy}
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {data.bettingRecommendations.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
