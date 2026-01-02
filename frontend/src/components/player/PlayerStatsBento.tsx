'use client'

import StatCard from './StatCard'

export interface PlayerStatsData {
  games_played: number
  ppg: number
  rpg: number
  apg: number
  spg: number
  bpg: number
  fg_pct: number | null
  three_pct: number | null
  ft_pct: number | null
  mpg: number
  tov: number
  ppg_rank: number
  rpg_rank: number
  apg_rank: number
  spg_rank: number
  bpg_rank: number
  fg_pct_rank: number | null
  three_pct_rank: number | null
  ft_pct_rank: number | null
  mpg_rank: number
  tov_rank: number
  total_players: number
}

interface PlayerStatsBentoProps {
  stats: PlayerStatsData
  season?: string
}

export default function PlayerStatsBento({ stats, season = '2025-26' }: PlayerStatsBentoProps) {
  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase" style={{ letterSpacing: '-0.05em' }}>
            Traditional
          </h2>
          <span className="text-2xl md:text-4xl font-light text-zinc-600 uppercase" style={{ letterSpacing: '-0.05em' }}>
            Stats
          </span>
        </div>
        <span className="text-xs text-zinc-500">
          Season {season} • {stats.games_played} games
        </span>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* PPG - Hero Card (span-1, row-span-2 on desktop) */}
        <StatCard
          label="Points Per Game"
          shortLabel="PPG"
          value={stats.ppg}
          rank={stats.ppg_rank}
          totalPlayers={stats.total_players}
          size="hero"
          className="col-span-2 lg:col-span-1 lg:row-span-2"
        />

        {/* RPG */}
        <StatCard
          label="Rebounds Per Game"
          shortLabel="RPG"
          value={stats.rpg}
          rank={stats.rpg_rank}
          totalPlayers={stats.total_players}
          size="medium"
        />

        {/* APG */}
        <StatCard
          label="Assists Per Game"
          shortLabel="APG"
          value={stats.apg}
          rank={stats.apg_rank}
          totalPlayers={stats.total_players}
          size="medium"
        />

        {/* STL - row-span-2 on desktop */}
        <StatCard
          label="Steals Per Game"
          shortLabel="STL"
          value={stats.spg}
          rank={stats.spg_rank}
          totalPlayers={stats.total_players}
          size="medium"
          className="lg:row-span-2"
        />

        {/* MPG */}
        <StatCard
          label="Minutes Per Game"
          shortLabel="MPG"
          value={stats.mpg}
          rank={stats.mpg_rank}
          totalPlayers={stats.total_players}
          size="small"
        />

        {/* Shooting Efficiency - spans 2 columns */}
        <div className="col-span-2 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3">
            Shooting Efficiency
          </div>
          <div className="grid grid-cols-3 gap-4">
            {/* FG% */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.fg_pct !== null ? `${stats.fg_pct}%` : '-'}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">FG%</div>
              {stats.fg_pct_rank !== null && (
                <div className={`text-[10px] mt-0.5 ${stats.fg_pct_rank <= 10 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  #{stats.fg_pct_rank}
                </div>
              )}
            </div>

            {/* 3P% */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.three_pct !== null ? `${stats.three_pct}%` : '-'}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">3P%</div>
              {stats.three_pct_rank !== null && (
                <div className={`text-[10px] mt-0.5 ${stats.three_pct_rank <= 10 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  #{stats.three_pct_rank}
                </div>
              )}
            </div>

            {/* FT% */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.ft_pct !== null ? `${stats.ft_pct}%` : '-'}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">FT%</div>
              {stats.ft_pct_rank !== null && (
                <div className={`text-[10px] mt-0.5 ${stats.ft_pct_rank <= 10 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  #{stats.ft_pct_rank}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BLK */}
        <StatCard
          label="Blocks Per Game"
          shortLabel="BLK"
          value={stats.bpg}
          rank={stats.bpg_rank}
          totalPlayers={stats.total_players}
          size="small"
        />

        {/* TOV - with lower is better flag */}
        <StatCard
          label="Turnovers Per Game"
          shortLabel="TOV"
          value={stats.tov}
          rank={stats.tov_rank}
          totalPlayers={stats.total_players}
          size="small"
          lowerIsBetter={true}
          className="col-span-2 lg:col-span-1"
        />
      </div>
    </div>
  )
}
