'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { getTeamColors } from '@/lib/team-colors'
import { BarChart3, TrendingUp, TrendingDown, AlertCircle, Shield } from 'lucide-react'
import type { ShotDistributionData, ShotDistributionPosition } from '@/lib/queries'

/**
 * ShotDistributionProfile - Compact Dual Cards Layout
 *
 * Shows how a defense forces opponents to redistribute their shots by position.
 * Left: Distribution data with inline bars
 * Right: Analysis (Forces To / Blocks From)
 */

export interface ShotDistributionProfileProps {
  teamId: number
  teamAbbreviation: string
  className?: string
}

// Profile badge configuration
const PROFILE_CONFIG: Record<string, { label: string; bgClass: string; textClass: string }> = {
  'GUARDS-KILLER': {
    label: 'Guards Killer',
    bgClass: 'bg-green-500/20',
    textClass: 'text-green-400',
  },
  'FORWARDS-FOCUSED': {
    label: 'Forwards Focused',
    bgClass: 'bg-orange-500/20',
    textClass: 'text-orange-400',
  },
  'CENTER-FOCUSED': {
    label: 'Center Focused',
    bgClass: 'bg-purple-500/20',
    textClass: 'text-purple-400',
  },
  'BALANCED': {
    label: 'Équilibré',
    bgClass: 'bg-zinc-500/20',
    textClass: 'text-zinc-400',
  },
}

function ProfileBadge({ profile }: { profile: string }) {
  const config = PROFILE_CONFIG[profile] || PROFILE_CONFIG['BALANCED']

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

function PositionRow({
  position,
  teamColor,
}: {
  position: ShotDistributionPosition
  teamColor: string
}) {
  const isForced = position.deviation >= 2
  const isBlocked = position.deviation <= -2

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Position label */}
      <span className="w-8 text-xs text-zinc-400 font-bold">{position.position}</span>

      {/* Distribution bar */}
      <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden relative">
        {/* Team bar */}
        <div
          className="absolute inset-y-0 left-0 rounded"
          style={{
            width: `${Math.min(position.fgaPct * 3, 100)}%`,
            backgroundColor: teamColor,
            opacity: 0.7,
          }}
        />
        {/* League average line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white/50 z-10"
          style={{
            left: `${Math.min(position.leagueAvgPct * 3, 100)}%`,
          }}
        />
        <span className="absolute inset-0 flex items-center px-1.5 text-[10px] font-mono text-white/90">
          {position.fgaPct.toFixed(1)}%
        </span>
      </div>

      {/* Deviation */}
      <span
        className={cn(
          'w-12 text-right text-[10px] font-mono font-bold',
          isForced && 'text-red-400',
          isBlocked && 'text-emerald-400',
          !isForced && !isBlocked && 'text-zinc-500'
        )}
      >
        {position.deviation > 0 ? '+' : ''}
        {position.deviation.toFixed(1)}
      </span>

      {/* Status indicator */}
      {isForced && <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}
      {isBlocked && <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
      {!isForced && !isBlocked && <span className="w-3" />}
    </div>
  )
}

export function ShotDistributionProfile({
  teamId,
  teamAbbreviation,
  className,
}: ShotDistributionProfileProps) {
  const [data, setData] = React.useState<ShotDistributionData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const teamColors = getTeamColors(teamAbbreviation)

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch(`/api/teams/${teamId}/shot-distribution`)
        if (!res.ok) throw new Error('Failed to fetch shot distribution data')

        const apiData: ShotDistributionData = await res.json()
        setData(apiData)
      } catch (err) {
        console.error('Error fetching shot distribution:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
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
          <BarChart3 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
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
          <BarChart3 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl', className)}>
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
            SHOT DISTRIBUTION
          </h2>
          <p className="text-[10px] tracking-[0.15em] uppercase text-zinc-500">
            Comment cette défense redistribue les tirs adverses
          </p>
        </div>
        <ProfileBadge profile={data.profile} />
      </div>

      {/* Dual Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
        {/* Left: Distribution by Position */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4" style={{ color: teamColors.primary }} />
            <span className="text-xs font-bold uppercase tracking-wide text-white">
              Distribution par position
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">
            Répartition des FGA adverses vs moyenne ligue
          </p>

          {/* Column headers */}
          <div className="flex items-center gap-2 pb-1 mb-1 border-b border-zinc-800/50 text-[9px] text-zinc-600 uppercase tracking-wide">
            <span className="w-8">Pos</span>
            <span className="flex-1">FGA%</span>
            <span className="w-12 text-right">vs Avg</span>
            <span className="w-3"></span>
          </div>

          <div className="space-y-0.5">
            {data.positions.map((pos) => (
              <PositionRow key={pos.position} position={pos} teamColor={teamColors.primary} />
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center gap-4 text-[9px] text-zinc-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: teamColors.primary, opacity: 0.7 }} />
              <span>FGA%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-3 bg-white/50" />
              <span>Moy. Ligue</span>
            </div>
          </div>
        </div>

        {/* Right: Defensive Analysis */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wide text-white">
              Analyse défensive
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mb-3">
            Impact sur la sélection de tirs adverses
          </p>

          <div className="space-y-3">
            {/* Forces To Section */}
            {data.insights.forcesTo.length > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-red-400">
                    Force vers (expose)
                  </span>
                </div>
                <div className="space-y-1">
                  {data.insights.forcesTo.map((item) => (
                    <div key={item.position} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">{item.position}</span>
                      <span className="font-mono font-bold text-red-400">
                        +{item.deviation.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blocks From Section */}
            {data.insights.blocksFrom.length > 0 && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                    Bloque (protège)
                  </span>
                </div>
                <div className="space-y-1">
                  {data.insights.blocksFrom.map((item) => (
                    <div key={item.position} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">{item.position}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {item.deviation.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Neutral message if both empty */}
            {data.insights.forcesTo.length === 0 && data.insights.blocksFrom.length === 0 && (
              <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <p className="text-xs text-zinc-400 text-center">
                  Distribution proche de la moyenne ligue
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Betting Tip Footer */}
      {data.insights.bettingTip && (
        <div className="px-4 py-3 border-t border-zinc-800 bg-amber-500/5">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 text-sm">💡</span>
            <div className="flex-1">
              <p className="text-xs text-zinc-300 leading-relaxed">
                {data.insights.bettingTip}
              </p>
            </div>
            <span className="text-[10px] text-zinc-600">{data.gamesPlayed} matchs</span>
          </div>
        </div>
      )}
    </div>
  )
}
