'use client'

import { TeamPPGRankingChart } from './TeamPPGRankingChart'
import { TeamOppPPGRankingChart } from './TeamOppPPGRankingChart'

interface TeamRankingData {
  team_id: number
  abbreviation: string
  ppg: number
  opp_ppg: number
}

interface TeamRankingDualChartProps {
  data: TeamRankingData[]
  selectedTeamId?: number
  className?: string
}

export function TeamRankingDualChart({ data, selectedTeamId, className = '' }: TeamRankingDualChartProps) {
  return (
    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-8 ${className}`}>
      {/* Cinematic Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          CLASSEMENT
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base tracking-[0.2em] uppercase mt-2">
          Attaque & Défense de la Ligue
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* PPG (Attack) Chart */}
        <div className="p-3 sm:p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
          <h3 className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 mb-2 sm:mb-4">
            PPG (Attaque) — Plus = meilleur
          </h3>
          <TeamPPGRankingChart data={data} selectedTeamId={selectedTeamId} />
        </div>

        {/* OPP PPG (Defense) Chart */}
        <div className="p-3 sm:p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
          <h3 className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 mb-2 sm:mb-4">
            OPP PPG (Défense) — Moins = meilleur
          </h3>
          <TeamOppPPGRankingChart data={data} selectedTeamId={selectedTeamId} />
        </div>
      </div>
    </div>
  )
}
