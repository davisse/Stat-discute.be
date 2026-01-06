import { cn } from '@/lib/utils'

/**
 * DvPPositionBars - Horizontal bar chart showing defensive performance by position
 *
 * Features:
 * - Horizontal bars with tier-based coloring
 * - Rank badges with tier labels
 * - League average marker on each bar
 * - Betting insight summary (Target/Avoid)
 */

export interface DvPBarData {
  position: string
  positionFull: string
  pointsAllowed: number
  rank: number
  leagueAvg: number
  diffFromAvg: number
  tier: 'elite' | 'good' | 'average' | 'below' | 'weak'
}

export interface DvPPositionBarsProps {
  data: DvPBarData[]
  teamAbbreviation: string
  className?: string
}

// Tier configuration
const TIER_CONFIG = {
  elite: {
    label: 'Elite',
    bgClass: 'bg-red-900/60',
    borderClass: 'border-red-700/50',
    textClass: 'text-red-200',
    barGradient: 'from-red-600 to-red-800',
  },
  good: {
    label: 'Good',
    bgClass: 'bg-orange-900/60',
    borderClass: 'border-orange-700/50',
    textClass: 'text-orange-200',
    barGradient: 'from-orange-500 to-orange-700',
  },
  average: {
    label: 'Avg',
    bgClass: 'bg-zinc-700/60',
    borderClass: 'border-zinc-600/50',
    textClass: 'text-zinc-300',
    barGradient: 'from-zinc-500 to-zinc-600',
  },
  below: {
    label: 'Below',
    bgClass: 'bg-emerald-900/60',
    borderClass: 'border-emerald-700/50',
    textClass: 'text-emerald-200',
    barGradient: 'from-emerald-500 to-emerald-700',
  },
  weak: {
    label: 'Weak',
    bgClass: 'bg-cyan-900/60',
    borderClass: 'border-cyan-700/50',
    textClass: 'text-cyan-200',
    barGradient: 'from-cyan-500 to-cyan-700',
  },
}

// Single position bar component
function PositionBar({ data, minValue, maxValue }: { data: DvPBarData; minValue: number; maxValue: number }) {
  const tierConfig = TIER_CONFIG[data.tier]
  const range = maxValue - minValue

  // Calculate bar width as percentage
  const barWidth = ((data.pointsAllowed - minValue) / range) * 100

  // Calculate league average position
  const avgPosition = ((data.leagueAvg - minValue) / range) * 100

  return (
    <div className="flex items-center gap-4">
      {/* Position label */}
      <div className="w-10 text-right">
        <span className="text-base font-bold text-white">{data.position}</span>
      </div>

      {/* Bar container */}
      <div className="flex-1 relative">
        {/* Background track */}
        <div className="h-12 bg-zinc-800/50 rounded-lg overflow-hidden relative">
          {/* Filled bar */}
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r",
              tierConfig.barGradient
            )}
            style={{ width: `${barWidth}%` }}
          />

          {/* League average marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10"
            style={{ left: `${avgPosition}%` }}
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white/50 rotate-45" />
          </div>

          {/* Value label inside bar */}
          <div className="absolute inset-0 flex items-center px-4">
            <span className="text-white font-mono text-lg font-bold drop-shadow-lg">
              {data.pointsAllowed.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Rank badge */}
      <div
        className={cn(
          "flex items-center justify-center w-14 h-10 rounded-lg font-mono text-sm font-bold border-2",
          tierConfig.bgClass,
          tierConfig.borderClass,
          tierConfig.textClass
        )}
      >
        #{data.rank}
      </div>

      {/* Tier label */}
      <div
        className={cn(
          "w-16 text-center px-2 py-2 rounded-lg text-sm font-semibold border-2",
          tierConfig.bgClass,
          tierConfig.borderClass,
          tierConfig.textClass
        )}
      >
        {tierConfig.label}
      </div>
    </div>
  )
}

// Betting insight summary
function BettingInsight({ data }: { data: DvPBarData[] }) {
  const targets = data.filter(p => p.rank >= 20).sort((a, b) => b.rank - a.rank)
  const avoids = data.filter(p => p.rank <= 6).sort((a, b) => a.rank - b.rank)

  if (targets.length === 0 && avoids.length === 0) {
    return (
      <div className="flex items-center justify-center gap-3 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
        <span className="text-zinc-400 text-base">No extreme matchups</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-6 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
      {targets.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Target</span>
            <div className="text-base text-white font-semibold">
              {targets.map(t => `${t.position} (#${t.rank})`).join(', ')}
            </div>
          </div>
        </div>
      )}
      {avoids.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Avoid</span>
            <div className="text-base text-white font-semibold">
              {avoids.map(a => `${a.position} (#${a.rank})`).join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function DvPPositionBars({ data, teamAbbreviation, className }: DvPPositionBarsProps) {
  // Calculate scale for bars
  const allValues = [...data.map(d => d.pointsAllowed), ...data.map(d => d.leagueAvg)]
  const minValue = Math.min(...allValues) - 1
  const maxValue = Math.max(...allValues) + 1

  // Sort by position order (PG, SG, SF, PF, C)
  const positionOrder = ['PG', 'SG', 'SF', 'PF', 'C']
  const sortedData = [...data].sort((a, b) =>
    positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position)
  )

  return (
    <div className={cn("space-y-5", className)}>
      {/* Scale reference */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-14">
        <span className="font-mono">{minValue.toFixed(0)} pts</span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-white/50 rotate-45" />
          <span className="font-medium">League Avg</span>
        </span>
        <span className="font-mono">{maxValue.toFixed(0)} pts</span>
      </div>

      {/* Position bars */}
      <div className="space-y-4">
        {sortedData.map((posData) => (
          <PositionBar
            key={posData.position}
            data={posData}
            minValue={minValue}
            maxValue={maxValue}
          />
        ))}
      </div>

      {/* Betting insight */}
      <div className="pt-3">
        <BettingInsight data={data} />
      </div>
    </div>
  )
}
