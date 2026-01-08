'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { ShotDistributionPosition } from '@/lib/queries'

/**
 * ShotDistributionChart - Bar chart visualization for shot distribution
 *
 * Layout:
 * - Mobile (base): Horizontal stacked bars
 * - Desktop (lg+): Vertical bars side by side
 *
 * Features:
 * - Team-colored bars
 * - League average reference line (continuous across all bars)
 * - Deviation badges with color coding
 * - Animated bar growth on mount
 */

export interface ShotDistributionChartProps {
  positions: ShotDistributionPosition[]
  teamColor: string
  className?: string
}

// Get color class based on deviation value
function getDeviationColor(deviation: number): string {
  if (deviation >= 2) return 'text-red-400'
  if (deviation <= -2) return 'text-green-400'
  return 'text-zinc-400'
}

// Get badge background based on deviation
function getDeviationBadgeClass(deviation: number): string {
  if (deviation >= 2) return 'bg-red-500/20 text-red-400 border border-red-500/30'
  if (deviation <= -2) return 'bg-green-500/20 text-green-400 border border-green-500/30'
  return 'bg-zinc-800 text-zinc-400 border border-zinc-700'
}

export function ShotDistributionChart({
  positions,
  teamColor,
  className,
}: ShotDistributionChartProps) {
  const [animated, setAnimated] = React.useState(false)

  // Trigger animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Calculate scale with padding for visual clarity
  // Include league averages in scale calculation to ensure lines are visible
  const allValues = [
    ...positions.map((p) => p.fgaPct),
    ...positions.map((p) => p.leagueAvgPct),
  ]
  const maxFgaPct = Math.max(...allValues) + 2
  const minFgaPct = Math.min(...allValues) - 2
  const range = maxFgaPct - minFgaPct

  return (
    <div className={cn('', className)}>
      {/* Mobile: Horizontal stacked bars */}
      <div className="lg:hidden space-y-3">
        {positions.map((pos, index) => (
          <div key={pos.position} className="flex items-center gap-3">
            {/* Position label */}
            <div className="w-10 text-center">
              <span className="text-sm font-bold text-white">{pos.position}</span>
            </div>

            {/* Bar container */}
            <div className="flex-1 h-8 bg-zinc-800 rounded-lg relative overflow-hidden">
              {/* Actual bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                style={{
                  width: animated ? `${(pos.fgaPct / maxFgaPct) * 100}%` : '0%',
                  backgroundColor: teamColor,
                  transitionDelay: `${index * 100}ms`,
                }}
              />
              {/* League avg line */}
              <div
                className="absolute inset-y-0 w-0.5 bg-white/60 z-10"
                style={{ left: `${(pos.leagueAvgPct / maxFgaPct) * 100}%` }}
              />
            </div>

            {/* Stats */}
            <div className="w-24 text-right flex items-center justify-end gap-2">
              <span className="text-sm font-mono text-white">{pos.fgaPct.toFixed(1)}%</span>
              <span
                className={cn('text-xs font-mono font-bold', getDeviationColor(pos.deviation))}
              >
                {pos.deviation > 0 ? '+' : ''}
                {pos.deviation.toFixed(1)}
              </span>
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: teamColor }} />
            <span className="text-xs text-zinc-400">FGA%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-white/60" />
            <span className="text-xs text-zinc-400">Moy. Ligue</span>
          </div>
        </div>
      </div>

      {/* Desktop: Vertical bars */}
      <div className="hidden lg:block">
        {/* Bars container */}
        <div className="flex items-end justify-center gap-8">
          {positions.map((pos, index) => (
            <div key={pos.position} className="flex flex-col items-center" style={{ width: '72px' }}>
              {/* Deviation badge - fixed width for alignment */}
              <div
                className={cn(
                  'w-full text-center px-2 py-1 rounded text-xs font-mono font-bold mb-3',
                  getDeviationBadgeClass(pos.deviation)
                )}
              >
                {pos.deviation > 0 ? '+' : ''}
                {pos.deviation.toFixed(1)}%
              </div>

              {/* Bar container - fixed height */}
              <div
                className="relative w-full bg-zinc-800/80 rounded-t-lg"
                style={{ height: '180px' }}
              >
                {/* Actual bar */}
                <div
                  className="absolute bottom-0 inset-x-0 rounded-t-lg transition-all duration-700 ease-out"
                  style={{
                    height: animated ? `${((pos.fgaPct - minFgaPct) / range) * 100}%` : '0%',
                    backgroundColor: teamColor,
                    transitionDelay: `${index * 100}ms`,
                  }}
                />
                {/* League avg line - per position */}
                <div
                  className="absolute inset-x-0 h-0.5 bg-zinc-400 z-10"
                  style={{
                    bottom: `${((pos.leagueAvgPct - minFgaPct) / range) * 100}%`,
                  }}
                />
              </div>

              {/* Percentage value */}
              <div className="mt-3 text-center">
                <span className="text-lg font-bold font-mono text-white">
                  {pos.fgaPct.toFixed(1)}%
                </span>
              </div>

              {/* Position label */}
              <span className="mt-1 text-sm font-bold text-zinc-400">{pos.position}</span>
            </div>
          ))}
        </div>

        {/* Legend - reorganized in 2 rows */}
        <div className="mt-8 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: teamColor }} />
              <span className="text-xs text-zinc-400">% FGA adverses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-px bg-zinc-500" />
              <span className="text-xs text-zinc-400">Moyenne Ligue</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-green-400">−X%</span>
              <span className="text-xs text-zinc-500">=</span>
              <span className="text-xs text-zinc-400">Limite les tirs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-red-400">+X%</span>
              <span className="text-xs text-zinc-500">=</span>
              <span className="text-xs text-zinc-400">Expose aux tirs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
