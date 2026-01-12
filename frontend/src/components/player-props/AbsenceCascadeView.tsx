'use client'

import { useState } from 'react'
import { TeammatePerformanceSplit } from '@/lib/queries'

interface AbsenceCascadeViewProps {
  absentPlayer: {
    playerId: number
    playerName: string
    teamId: number
    teamAbbr: string
    gamesPlayed: number
    gamesMissed: number
  }
  teammates: TeammatePerformanceSplit[]
}

// Helper to safely convert PostgreSQL numeric to number
const toNum = (val: number | string | null): number => {
  if (val === null) return 0
  return typeof val === 'string' ? parseFloat(val) : val
}

type StatType = 'pts' | 'reb' | 'ast' | 'stl' | 'blk' | '3pm' | 'fg'

const statConfig: Record<StatType, { label: string; shortLabel: string }> = {
  pts: { label: 'Points', shortLabel: 'PTS' },
  reb: { label: 'Rebonds', shortLabel: 'REB' },
  ast: { label: 'Passes', shortLabel: 'AST' },
  stl: { label: 'Interceptions', shortLabel: 'STL' },
  blk: { label: 'Contres', shortLabel: 'BLK' },
  '3pm': { label: '3 Points', shortLabel: '3PM' },
  fg: { label: 'Tirs', shortLabel: 'FG' },
}

export function AbsenceCascadeView({ absentPlayer, teammates }: AbsenceCascadeViewProps) {
  const [activeStat, setActiveStat] = useState<StatType>('pts')

  const availability = ((absentPlayer.gamesPlayed / (absentPlayer.gamesPlayed + absentPlayer.gamesMissed)) * 100).toFixed(0)

  // Get stat values based on active stat type
  const getStatValues = (teammate: TeammatePerformanceSplit) => {
    switch (activeStat) {
      case 'pts':
        return {
          with: toNum(teammate.with_pts),
          without: toNum(teammate.without_pts),
          boost: toNum(teammate.pts_boost),
        }
      case 'reb':
        return {
          with: toNum(teammate.with_reb),
          without: toNum(teammate.without_reb),
          boost: toNum(teammate.reb_boost),
        }
      case 'ast':
        return {
          with: toNum(teammate.with_ast),
          without: toNum(teammate.without_ast),
          boost: toNum(teammate.ast_boost),
        }
      case 'blk':
        return {
          with: toNum(teammate.with_blk),
          without: toNum(teammate.without_blk),
          boost: toNum(teammate.blk_boost),
        }
      case 'stl':
        return {
          with: toNum(teammate.with_stl),
          without: toNum(teammate.without_stl),
          boost: toNum(teammate.stl_boost),
        }
      case '3pm':
        return {
          with: toNum(teammate.with_3pm),
          without: toNum(teammate.without_3pm),
          boost: toNum(teammate.three_pm_boost),
        }
      case 'fg':
        return {
          with: toNum(teammate.with_fgm),
          without: toNum(teammate.without_fgm),
          boost: toNum(teammate.without_fgm) - toNum(teammate.with_fgm),
          withFga: toNum(teammate.with_fga),
          withoutFga: toNum(teammate.without_fga),
        }
    }
  }

  // Get boost color class
  const getBoostColor = (boost: number, stat: StatType) => {
    const threshold = stat === 'blk' || stat === 'stl' || stat === '3pm' ? 1 : stat === 'fg' ? 2 : 3
    const smallThreshold = stat === 'blk' || stat === 'stl' || stat === '3pm' ? 0.5 : stat === 'fg' ? 1 : 1.5

    if (boost >= threshold) return 'text-emerald-400'
    if (boost >= smallThreshold) return 'text-emerald-500'
    if (boost > 0) return 'text-emerald-600'
    if (boost <= -threshold) return 'text-red-400'
    if (boost < 0) return 'text-red-500'
    return 'text-zinc-400'
  }

  // Get row/card background for significant changes
  const getRowBg = (boost: number, stat: StatType) => {
    const threshold = stat === 'blk' || stat === 'stl' || stat === '3pm' ? 1 : stat === 'fg' ? 2 : 3
    if (boost >= threshold) return 'bg-emerald-500/5'
    if (boost <= -threshold) return 'bg-red-500/5'
    return ''
  }

  // Sort teammates by current stat boost
  const sortedTeammates = [...teammates].sort((a, b) => {
    const aStats = getStatValues(a)
    const bStats = getStatValues(b)
    return bStats.boost - aStats.boost
  })

  const threshold = activeStat === 'blk' || activeStat === 'stl' || activeStat === '3pm' ? 1 : activeStat === 'fg' ? 2 : 3

  if (teammates.length === 0) {
    return (
      <div className="bg-zinc-900/50 md:border md:border-zinc-800 md:rounded-xl p-4 md:p-8 text-center">
        <p className="text-zinc-400 text-sm md:text-base">Données insuffisantes pour l&apos;analyse d&apos;impact</p>
        <p className="text-xs md:text-sm text-zinc-500 mt-1">Minimum 3 matchs avec et sans le joueur requis</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header - Mobile: compact, Desktop: horizontal */}
      <div className="bg-zinc-900/50 md:border md:border-zinc-800 rounded-lg md:rounded-xl p-3 md:p-4">
        {/* Mobile: Compact layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-bold">{absentPlayer.playerName}</span>
              <span className="text-zinc-500 text-xs ml-2">absent</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-bold text-white">{absentPlayer.gamesMissed}</span>
              <span className="text-zinc-500 text-xs ml-1">MJ</span>
            </div>
          </div>
          <div className="text-xs text-zinc-500 mt-1">{availability}% disponibilité</div>
        </div>
        {/* Desktop: Full horizontal layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 text-sm">Quand</span>
            <span className="text-white font-bold">{absentPlayer.playerName}</span>
            <span className="text-zinc-400 text-sm">est absent</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-3xl font-mono font-bold text-white">{absentPlayer.gamesMissed}</span>
              <span className="text-zinc-500 text-sm ml-2">matchs manqués</span>
            </div>
            <div className="text-xs text-zinc-500 border-l border-zinc-700 pl-4">
              {availability}% disponibilité
            </div>
          </div>
        </div>
      </div>

      {/* Stat Tabs - Full width scrollable on mobile */}
      <div className="-mx-4 md:mx-0 px-4 md:px-0">
        <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(Object.keys(statConfig) as StatType[]).map((stat) => (
            <button
              key={stat}
              onClick={() => setActiveStat(stat)}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 min-w-[44px] ${
                activeStat === stat
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400 active:bg-zinc-700'
              }`}
            >
              {statConfig[stat].shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: Card layout (default) */}
      <div className="md:hidden space-y-2">
        {sortedTeammates.map((teammate) => {
          const stats = getStatValues(teammate)
          const isProp = stats.boost >= threshold

          return (
            <div
              key={teammate.teammate_id}
              className={`bg-zinc-900/50 rounded-lg p-3 ${getRowBg(stats.boost, activeStat)}`}
            >
              {/* Row 1: Name + Boost */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-white font-medium text-sm truncate">{teammate.teammate_name}</span>
                  {isProp && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-medium flex-shrink-0">
                      PROP
                    </span>
                  )}
                </div>
                <span className={`font-mono font-bold text-base ml-2 ${getBoostColor(stats.boost, activeStat)}`}>
                  {stats.boost > 0 ? '+' : ''}{stats.boost.toFixed(1)}
                  {stats.boost >= threshold && <span className="text-xs ml-0.5">↑</span>}
                  {stats.boost <= -threshold && <span className="text-xs ml-0.5">↓</span>}
                </span>
              </div>
              {/* Row 2: Stats comparison */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500">Sans:</span>
                  {activeStat === 'fg' ? (
                    <span className="text-white font-mono font-medium">
                      {stats.without.toFixed(1)}<span className="text-zinc-500 text-[10px]">FGM</span>/{(stats as { withoutFga: number }).withoutFga?.toFixed(1)}<span className="text-zinc-500 text-[10px]">FGA</span>
                    </span>
                  ) : (
                    <span className="text-white font-mono font-medium">{stats.without.toFixed(1)}</span>
                  )}
                </div>
                <span className="text-zinc-700">→</span>
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500">Avec:</span>
                  {activeStat === 'fg' ? (
                    <span className="text-zinc-400 font-mono">
                      {stats.with.toFixed(1)}<span className="text-zinc-500 text-[10px]">FGM</span>/{(stats as { withFga: number }).withFga?.toFixed(1)}<span className="text-zinc-500 text-[10px]">FGA</span>
                    </span>
                  ) : (
                    <span className="text-zinc-400 font-mono">{stats.with.toFixed(1)}</span>
                  )}
                </div>
                <span className="text-zinc-600 ml-auto font-mono text-[10px]">{teammate.without_games} MJ</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
          <div className="col-span-4 text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
            Titulaire
          </div>
          <div className="col-span-1 text-[10px] uppercase tracking-wider text-zinc-500 font-medium text-center">
            Pos
          </div>
          <div className="col-span-2 text-[10px] uppercase tracking-wider text-zinc-500 font-medium text-right">
            Sans
          </div>
          <div className="col-span-2 text-[10px] uppercase tracking-wider text-zinc-500 font-medium text-right">
            Avec
          </div>
          <div className="col-span-2 text-[10px] uppercase tracking-wider text-zinc-500 font-medium text-right">
            Boost
          </div>
          <div className="col-span-1 text-[10px] uppercase tracking-wider text-zinc-500 font-medium text-right">
            MJ
          </div>
        </div>

        {/* Rows */}
        {sortedTeammates.map((teammate) => {
          const stats = getStatValues(teammate)

          return (
            <div
              key={teammate.teammate_id}
              className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-zinc-800/50 last:border-b-0 hover:bg-zinc-800/30 transition-colors ${getRowBg(stats.boost, activeStat)}`}
            >
              {/* Nom + badge PROP */}
              <div className="col-span-4 flex items-center gap-2">
                <span className="text-white font-medium truncate">{teammate.teammate_name}</span>
                {stats.boost >= threshold && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-medium">
                    PROP
                  </span>
                )}
              </div>

              {/* Position */}
              <div className="col-span-1 text-center">
                <span className="text-xs text-zinc-500 font-mono">
                  {teammate.position || '-'}
                </span>
              </div>

              {/* Stats sans (mis en avant) */}
              <div className="col-span-2 text-right">
                {activeStat === 'fg' ? (
                  <span className="text-white font-mono font-bold">
                    {stats.without.toFixed(1)}<span className="text-zinc-500 text-[10px] font-normal">FGM</span>/{(stats as { withoutFga: number }).withoutFga?.toFixed(1)}<span className="text-zinc-500 text-[10px] font-normal">FGA</span>
                  </span>
                ) : (
                  <span className="text-white font-mono font-bold">
                    {stats.without.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Stats avec */}
              <div className="col-span-2 text-right">
                {activeStat === 'fg' ? (
                  <span className="text-zinc-500 font-mono">
                    {stats.with.toFixed(1)}<span className="text-[10px]">FGM</span>/{(stats as { withFga: number }).withFga?.toFixed(1)}<span className="text-[10px]">FGA</span>
                  </span>
                ) : (
                  <span className="text-zinc-500 font-mono">
                    {stats.with.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Boost */}
              <div className="col-span-2 text-right">
                <span className={`font-mono font-bold ${getBoostColor(stats.boost, activeStat)}`}>
                  {stats.boost > 0 ? '+' : ''}{stats.boost.toFixed(1)}
                  {stats.boost >= threshold && <span className="ml-1">↑</span>}
                  {stats.boost <= -threshold && <span className="ml-1">↓</span>}
                </span>
              </div>

              {/* Matchs joués sans */}
              <div className="col-span-1 text-right">
                <span className="text-xs text-zinc-500 font-mono">
                  {teammate.without_games}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-[10px] text-zinc-600">
          Titulaires uniquement • Min 3 matchs • Trié par boost {statConfig[activeStat].shortLabel}
        </p>
      </div>
    </div>
  )
}
