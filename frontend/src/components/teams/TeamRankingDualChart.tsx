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
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* PPG (Attack) Chart */}
      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4">
          PPG (Attaque) — Plus = meilleur
        </h3>
        <TeamPPGRankingChart data={data} selectedTeamId={selectedTeamId} />
      </div>

      {/* OPP PPG (Defense) Chart */}
      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4">
          OPP PPG (Defense) — Moins = meilleur
        </h3>
        <TeamOppPPGRankingChart data={data} selectedTeamId={selectedTeamId} />
      </div>
    </div>
  )
}
