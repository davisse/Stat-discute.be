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
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4 ${className}`}>
      {/* PPG (Attack) Chart */}
      <div className="p-2 sm:p-4 bg-zinc-900/50 sm:border sm:border-zinc-800 sm:rounded-lg">
        <h3 className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 mb-2 sm:mb-4">
          PPG (Attaque) — Plus = meilleur
        </h3>
        <TeamPPGRankingChart data={data} selectedTeamId={selectedTeamId} />
      </div>

      {/* OPP PPG (Defense) Chart */}
      <div className="p-2 sm:p-4 bg-zinc-900/50 sm:border sm:border-zinc-800 sm:rounded-lg">
        <h3 className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 mb-2 sm:mb-4">
          OPP PPG (Defense) — Moins = meilleur
        </h3>
        <TeamOppPPGRankingChart data={data} selectedTeamId={selectedTeamId} />
      </div>
    </div>
  )
}
