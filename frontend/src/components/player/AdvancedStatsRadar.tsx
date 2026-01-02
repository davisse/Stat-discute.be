'use client'

import { useState, useEffect, useRef } from 'react'

interface AdvancedStatsRadarProps {
  tsPct: number      // True Shooting % (good: >58%, elite: >62%)
  efgPct: number     // Effective FG % (good: >52%, elite: >56%)
  usage: number      // Usage Rate (high: >25%)
  offRtg: number     // Offensive Rating (good: >110)
  defRtg: number     // Defensive Rating (good: <110, lower is better)
  netRtg: number     // Net Rating (positive is good)
}

// Tier classification for visual styling
function getTier(value: number, thresholds: { elite: number; good: number; avg: number }, inverted = false): 'elite' | 'good' | 'avg' | 'poor' {
  if (inverted) {
    if (value <= thresholds.elite) return 'elite'
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.avg) return 'avg'
    return 'poor'
  }
  if (value >= thresholds.elite) return 'elite'
  if (value >= thresholds.good) return 'good'
  if (value >= thresholds.avg) return 'avg'
  return 'poor'
}

const tierColors = {
  elite: { text: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/30' },
  good: { text: 'text-emerald-500', bg: 'bg-emerald-600', glow: 'shadow-emerald-600/20' },
  avg: { text: 'text-zinc-400', bg: 'bg-zinc-500', glow: 'shadow-zinc-500/20' },
  poor: { text: 'text-red-400', bg: 'bg-red-500', glow: 'shadow-red-500/30' }
}

export default function AdvancedStatsRadar({
  tsPct,
  efgPct,
  usage,
  offRtg,
  defRtg,
  netRtg
}: AdvancedStatsRadarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Calculate tiers
  const tsTier = getTier(tsPct, { elite: 62, good: 58, avg: 54 })
  const efgTier = getTier(efgPct, { elite: 56, good: 52, avg: 48 })
  const usageTier = getTier(usage, { elite: 28, good: 24, avg: 20 })
  const offTier = getTier(offRtg, { elite: 118, good: 112, avg: 106 })
  const defTier = getTier(defRtg, { elite: 106, good: 110, avg: 114 }, true)
  const netTier = getTier(netRtg, { elite: 8, good: 4, avg: 0 })

  // Progress bar calculations (0-100%)
  const tsProgress = Math.min(100, Math.max(0, ((tsPct - 40) / 30) * 100))
  const efgProgress = Math.min(100, Math.max(0, ((efgPct - 35) / 30) * 100))
  const usageProgress = Math.min(100, Math.max(0, ((usage - 10) / 25) * 100))
  const offProgress = Math.min(100, Math.max(0, ((offRtg - 90) / 40) * 100))
  const defProgress = Math.min(100, Math.max(0, ((130 - defRtg) / 40) * 100))

  return (
    <div ref={containerRef} className="w-full">
      {/* Header */}
      <div className="flex items-baseline gap-4 mb-12">
        <h2 className="text-5xl md:text-7xl font-black text-white uppercase" style={{ letterSpacing: '-0.05em' }}>
          Advanced
        </h2>
        <span className="text-5xl md:text-7xl font-light text-zinc-600 uppercase" style={{ letterSpacing: '-0.05em' }}>
          Analytics
        </span>
      </div>

      {/* Main Grid - Editorial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* Left Column - Net Rating Hero */}
        <div className="lg:col-span-4 flex flex-col justify-center">
          <div className="relative">
            {/* Large Net Rating Display */}
            <div className="mb-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.2em]">
                Net Rating
              </span>
            </div>
            <div className={`text-8xl md:text-9xl font-bold font-mono tracking-tighter ${tierColors[netTier].text}`}
                 style={{
                   transition: isVisible ? 'all 800ms ease-out' : 'none',
                   opacity: isVisible ? 1 : 0,
                   transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
                 }}>
              {netRtg > 0 ? '+' : ''}{netRtg.toFixed(1)}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${tierColors[netTier].bg}`} />
              <span className="text-sm text-zinc-500">
                {netTier === 'elite' ? 'Elite Impact' :
                 netTier === 'good' ? 'Positive Impact' :
                 netTier === 'avg' ? 'Neutral Impact' : 'Negative Impact'}
              </span>
            </div>

            {/* Off/Def Breakdown */}
            <div className="mt-8 pt-8 border-t border-zinc-800">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-xs text-zinc-600 uppercase tracking-wider">Offense</span>
                  <div className={`text-3xl font-bold font-mono ${tierColors[offTier].text}`}>
                    {offRtg.toFixed(1)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-zinc-600 uppercase tracking-wider">Defense</span>
                  <div className={`text-3xl font-bold font-mono ${tierColors[defTier].text}`}>
                    {defRtg.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Metrics Stack */}
        <div className="lg:col-span-8">
          <div className="space-y-8">

            {/* True Shooting % */}
            <div className="group"
                 style={{
                   transition: isVisible ? 'all 600ms ease-out 100ms' : 'none',
                   opacity: isVisible ? 1 : 0,
                   transform: isVisible ? 'translateX(0)' : 'translateX(30px)'
                 }}>
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg text-zinc-400 font-medium">True Shooting</span>
                  <span className="text-xs text-zinc-600 font-mono">TS%</span>
                </div>
                <span className={`text-4xl font-bold font-mono ${tierColors[tsTier].text}`}>
                  {tsPct.toFixed(1)}
                  <span className="text-lg text-zinc-600">%</span>
                </span>
              </div>
              <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full ${tierColors[tsTier].bg} transition-all duration-1000 ease-out`}
                  style={{ width: isVisible ? `${tsProgress}%` : '0%' }}
                />
                {/* Threshold markers */}
                <div className="absolute top-0 h-full w-px bg-zinc-700" style={{ left: '60%' }} title="Good: 58%" />
                <div className="absolute top-0 h-full w-px bg-zinc-600" style={{ left: '73%' }} title="Elite: 62%" />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-zinc-700 font-mono">
                <span>40%</span>
                <span>58%</span>
                <span>70%</span>
              </div>
            </div>

            {/* Effective FG% */}
            <div className="group"
                 style={{
                   transition: isVisible ? 'all 600ms ease-out 200ms' : 'none',
                   opacity: isVisible ? 1 : 0,
                   transform: isVisible ? 'translateX(0)' : 'translateX(30px)'
                 }}>
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg text-zinc-400 font-medium">Effective FG</span>
                  <span className="text-xs text-zinc-600 font-mono">eFG%</span>
                </div>
                <span className={`text-4xl font-bold font-mono ${tierColors[efgTier].text}`}>
                  {efgPct.toFixed(1)}
                  <span className="text-lg text-zinc-600">%</span>
                </span>
              </div>
              <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full ${tierColors[efgTier].bg} transition-all duration-1000 ease-out`}
                  style={{ width: isVisible ? `${efgProgress}%` : '0%' }}
                />
                <div className="absolute top-0 h-full w-px bg-zinc-700" style={{ left: '57%' }} title="Good: 52%" />
                <div className="absolute top-0 h-full w-px bg-zinc-600" style={{ left: '70%' }} title="Elite: 56%" />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-zinc-700 font-mono">
                <span>35%</span>
                <span>52%</span>
                <span>65%</span>
              </div>
            </div>

            {/* Usage Rate */}
            <div className="group"
                 style={{
                   transition: isVisible ? 'all 600ms ease-out 300ms' : 'none',
                   opacity: isVisible ? 1 : 0,
                   transform: isVisible ? 'translateX(0)' : 'translateX(30px)'
                 }}>
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg text-zinc-400 font-medium">Usage Rate</span>
                  <span className="text-xs text-zinc-600 font-mono">USG%</span>
                </div>
                <span className={`text-4xl font-bold font-mono ${tierColors[usageTier].text}`}>
                  {usage.toFixed(1)}
                  <span className="text-lg text-zinc-600">%</span>
                </span>
              </div>
              <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full ${tierColors[usageTier].bg} transition-all duration-1000 ease-out`}
                  style={{ width: isVisible ? `${usageProgress}%` : '0%' }}
                />
                <div className="absolute top-0 h-full w-px bg-zinc-700" style={{ left: '56%' }} title="High: 24%" />
                <div className="absolute top-0 h-full w-px bg-zinc-600" style={{ left: '72%' }} title="Very High: 28%" />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-zinc-700 font-mono">
                <span>10%</span>
                <span>24%</span>
                <span>35%</span>
              </div>
            </div>

            {/* Offensive Rating Bar */}
            <div className="group"
                 style={{
                   transition: isVisible ? 'all 600ms ease-out 400ms' : 'none',
                   opacity: isVisible ? 1 : 0,
                   transform: isVisible ? 'translateX(0)' : 'translateX(30px)'
                 }}>
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg text-zinc-400 font-medium">Offensive Rating</span>
                  <span className="text-xs text-zinc-600 font-mono">ORtg</span>
                </div>
                <span className={`text-4xl font-bold font-mono ${tierColors[offTier].text}`}>
                  {offRtg.toFixed(1)}
                </span>
              </div>
              <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full ${tierColors[offTier].bg} transition-all duration-1000 ease-out`}
                  style={{ width: isVisible ? `${offProgress}%` : '0%' }}
                />
                <div className="absolute top-0 h-full w-px bg-zinc-700" style={{ left: '55%' }} title="Good: 112" />
                <div className="absolute top-0 h-full w-px bg-zinc-600" style={{ left: '70%' }} title="Elite: 118" />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-zinc-700 font-mono">
                <span>90</span>
                <span>112</span>
                <span>130</span>
              </div>
            </div>

            {/* Defensive Rating Bar */}
            <div className="group"
                 style={{
                   transition: isVisible ? 'all 600ms ease-out 500ms' : 'none',
                   opacity: isVisible ? 1 : 0,
                   transform: isVisible ? 'translateX(0)' : 'translateX(30px)'
                 }}>
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg text-zinc-400 font-medium">Defensive Rating</span>
                  <span className="text-xs text-zinc-600 font-mono">DRtg</span>
                </div>
                <span className={`text-4xl font-bold font-mono ${tierColors[defTier].text}`}>
                  {defRtg.toFixed(1)}
                </span>
              </div>
              <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full ${tierColors[defTier].bg} transition-all duration-1000 ease-out`}
                  style={{ width: isVisible ? `${defProgress}%` : '0%' }}
                />
                <div className="absolute top-0 h-full w-px bg-zinc-700" style={{ left: '50%' }} title="Good: 110" />
                <div className="absolute top-0 h-full w-px bg-zinc-600" style={{ left: '60%' }} title="Elite: 106" />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-zinc-700 font-mono">
                <span>130</span>
                <span>110</span>
                <span>90</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="mt-12 pt-8 border-t border-zinc-800/50">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Elite</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-500" />
            <span>Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Below Avg</span>
          </div>
        </div>
      </div>
    </div>
  )
}
