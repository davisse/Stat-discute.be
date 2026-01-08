'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { getTeamColors } from '@/lib/team-colors'
import { ShotDistributionChart } from './ShotDistributionChart'
import { ChevronDown } from 'lucide-react'
import type { ShotDistributionData, ShotDistributionPosition } from '@/lib/queries'

/**
 * ShotDistributionProfile - Container component for Shot Distribution visualization
 *
 * Shows how a defense forces opponents to redistribute their shots by position.
 * Complements DvPTeamProfile (efficiency) with a focus on shot DISTRIBUTION.
 *
 * Layout:
 * - Desktop (lg+): Side-by-side (Chart left, Insights right)
 * - Mobile: Stacked (Chart top, Insights bottom)
 */

export interface ShotDistributionProfileProps {
  teamId: number
  teamAbbreviation: string
  className?: string
}

// Profile badge labels and emojis
const PROFILE_CONFIG: Record<string, { label: string; emoji: string; description: string }> = {
  'GUARDS-KILLER': {
    label: 'Guards Killer',
    emoji: '🎯',
    description: 'Limite les tirs des guards',
  },
  'FORWARDS-FOCUSED': {
    label: 'Forwards Focused',
    emoji: '🏋️',
    description: 'Force le jeu vers les ailiers',
  },
  'CENTER-FOCUSED': {
    label: 'Center Focused',
    emoji: '🗼',
    description: 'Force le jeu vers le pivot',
  },
  'BALANCED': {
    label: 'Balanced',
    emoji: '⚖️',
    description: 'Distribution équilibrée',
  },
}

export function ShotDistributionProfile({
  teamId,
  teamAbbreviation,
  className,
}: ShotDistributionProfileProps) {
  const [data, setData] = React.useState<ShotDistributionData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [tableExpanded, setTableExpanded] = React.useState(false)

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
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-6', className)}>
        <div className="flex items-center justify-center gap-3 text-zinc-500 py-12">
          <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
          <span>Loading shot distribution profile...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-6', className)}>
        <p className="text-red-400 text-center py-8">{error}</p>
      </div>
    )
  }

  // No data state
  if (!data) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-6', className)}>
        <p className="text-zinc-500 text-center py-8">No shot distribution data available</p>
      </div>
    )
  }

  const profileConfig = PROFILE_CONFIG[data.profile] || PROFILE_CONFIG['BALANCED']

  return (
    <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl', className)}>
      {/* Header Cinématique */}
      <div className="text-center pt-6 pb-4 sm:pt-8 sm:pb-6 px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
          SHOT DISTRIBUTION
        </h2>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white -mt-1">
          PROFILE
        </h3>
        <p className="text-xs sm:text-sm tracking-[0.2em] uppercase text-zinc-400 mt-3">
          How this defense reshapes opponent shot selection
        </p>

        {/* Badge Profil Défensif */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/80 border border-zinc-700 rounded-full">
          <span className="text-lg">{profileConfig.emoji}</span>
          <span className="text-sm font-bold tracking-wider text-white uppercase">
            {profileConfig.label}
          </span>
        </div>
      </div>

      {/* Content - Stack mobile, Side-by-side desktop */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 lg:items-start">
          {/* Chart - 7 colonnes sur desktop */}
          <div className="lg:col-span-7">
            <ShotDistributionChart
              positions={data.positions}
              teamColor={teamColors.primary}
            />
          </div>

          {/* Insights - 5 colonnes sur desktop */}
          <div className="lg:col-span-5 space-y-3">
            {/* Forces To Section */}
            {data.insights.forcesTo.length > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h4 className="text-[10px] uppercase tracking-wider text-red-400 mb-2 font-semibold">
                  Force les tirs vers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.insights.forcesTo.map((item) => (
                    <span
                      key={item.position}
                      className="px-3 py-1.5 bg-red-500/20 rounded-full text-sm font-mono text-white"
                    >
                      {item.position}{' '}
                      <span className="text-red-400 font-bold">+{item.deviation.toFixed(1)}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Blocks From Section */}
            {data.insights.blocksFrom.length > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="text-[10px] uppercase tracking-wider text-green-400 mb-2 font-semibold">
                  Bloque les tirs de
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.insights.blocksFrom.map((item) => (
                    <span
                      key={item.position}
                      className="px-3 py-1.5 bg-green-500/20 rounded-full text-sm font-mono text-white"
                    >
                      {item.position}{' '}
                      <span className="text-green-400 font-bold">{item.deviation.toFixed(1)}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Betting Tip */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">💡</span>
                <div className="min-w-0">
                  <h4 className="text-[10px] uppercase tracking-wider text-amber-400 mb-1 font-semibold">
                    Tip Paris
                  </h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {data.insights.bettingTip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Table - Expandable sur mobile */}
        <div className="mt-6">
          {/* Toggle button - Mobile only */}
          <button
            className="lg:hidden w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg text-zinc-400 hover:text-white transition-colors"
            onClick={() => setTableExpanded(!tableExpanded)}
          >
            <span className="text-sm uppercase tracking-wider">Stats détaillées</span>
            <ChevronDown
              className={cn('w-5 h-5 transition-transform', tableExpanded && 'rotate-180')}
            />
          </button>

          {/* Table - Always visible on desktop, expandable on mobile */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              'lg:max-h-none lg:opacity-100 lg:mt-4',
              tableExpanded
                ? 'max-h-96 opacity-100 mt-3'
                : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="py-2.5 px-4 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-semibold w-16">
                      Pos
                    </th>
                    <th className="py-2.5 px-4 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      FGA
                    </th>
                    <th className="py-2.5 px-4 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      FGM
                    </th>
                    <th className="py-2.5 px-4 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      FG%
                    </th>
                    <th className="py-2.5 px-4 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      FGA%
                    </th>
                    <th className="py-2.5 px-4 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      vs LIG
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.positions.map((pos: ShotDistributionPosition) => (
                    <tr
                      key={pos.position}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-bold text-white">{pos.position}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-zinc-300 tabular-nums">
                        {pos.fga.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-zinc-300 tabular-nums">
                        {pos.fgm.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-zinc-300 tabular-nums">
                        {pos.fgPct.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-white font-bold tabular-nums">
                        {pos.fgaPct.toFixed(1)}%
                      </td>
                      <td
                        className={cn(
                          'py-2.5 px-4 text-right font-mono font-bold tabular-nums',
                          pos.deviation >= 2
                            ? 'text-red-400'
                            : pos.deviation <= -2
                              ? 'text-green-400'
                              : 'text-zinc-400'
                        )}
                      >
                        {pos.deviation > 0 ? '+' : ''}
                        {pos.deviation.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-zinc-800 text-center">
        <p className="text-xs text-zinc-500">
          Distribution des FGA adverses vs moyenne ligue • {data.gamesPlayed} matchs analysés
        </p>
      </div>
    </div>
  )
}
