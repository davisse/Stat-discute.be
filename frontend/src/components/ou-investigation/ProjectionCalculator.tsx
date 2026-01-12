'use client'

import { useState, useMemo } from 'react'

interface ProjectionCalculatorProps {
  homeTeamAbbr: string
  awayTeamAbbr: string
  currentLine: number
  homeTeamAvgTotal: number    // Average total in home team games
  awayTeamAvgTotal: number    // Average total in away team games
  combinedAvg: number         // Combined average
  historicalRange: {          // Historical total range
    min: number
    max: number
    p25: number
    p50: number
    p75: number
  }
}

export function ProjectionCalculator({
  homeTeamAbbr,
  awayTeamAbbr,
  currentLine,
  homeTeamAvgTotal,
  awayTeamAvgTotal,
  combinedAvg,
  historicalRange
}: ProjectionCalculatorProps) {
  const [projectedTotal, setProjectedTotal] = useState(Math.round(combinedAvg))
  const [isAdjusting, setIsAdjusting] = useState(false)

  // Slider range: min to max with moderate padding
  const sliderMin = Math.floor(historicalRange.min - 5)
  const sliderMax = Math.ceil(historicalRange.max + 5)

  // Calculate the position of the line on the slider (for gradient)
  const linePositionPercent = ((currentLine - sliderMin) / (sliderMax - sliderMin)) * 100

  // Calculate position relative to current line
  const lineComparison = useMemo(() => {
    const diff = projectedTotal - currentLine
    const absPercent = Math.abs(diff / currentLine * 100)
    return {
      diff,
      direction: diff > 0 ? 'OVER' : diff < 0 ? 'UNDER' : 'ON LINE',
      color: diff > 0 ? '#ffffff' : diff < 0 ? '#52525b' : '#a1a1aa',
      absPercent: absPercent.toFixed(1)
    }
  }, [projectedTotal, currentLine])

  // Position relative to team averages
  const teamComparison = useMemo(() => {
    const vsHome = projectedTotal - homeTeamAvgTotal
    const vsAway = projectedTotal - awayTeamAvgTotal
    const vsCombined = projectedTotal - combinedAvg
    return {
      vsHome: { diff: vsHome, label: vsHome >= 0 ? `+${vsHome.toFixed(1)}` : vsHome.toFixed(1) },
      vsAway: { diff: vsAway, label: vsAway >= 0 ? `+${vsAway.toFixed(1)}` : vsAway.toFixed(1) },
      vsCombined: { diff: vsCombined, label: vsCombined >= 0 ? `+${vsCombined.toFixed(1)}` : vsCombined.toFixed(1) }
    }
  }, [projectedTotal, homeTeamAvgTotal, awayTeamAvgTotal, combinedAvg])

  // Percentile position of projected total
  const percentilePosition = useMemo(() => {
    if (projectedTotal <= historicalRange.p25) return 'Bas (<P25)'
    if (projectedTotal <= historicalRange.p50) return 'Moyen-bas (P25-P50)'
    if (projectedTotal <= historicalRange.p75) return 'Moyen-haut (P50-P75)'
    return 'Élevé (>P75)'
  }, [projectedTotal, historicalRange])

  // Quick preset buttons
  const presets = [
    { label: 'Ligne', value: currentLine },
    { label: 'Combiné', value: Math.round(combinedAvg) },
    { label: 'P50', value: Math.round(historicalRange.p50) },
    { label: `${homeTeamAbbr}`, value: Math.round(homeTeamAvgTotal) },
    { label: `${awayTeamAbbr}`, value: Math.round(awayTeamAvgTotal) }
  ]

  return (
    <section className="mt-6 sm:mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-600 tracking-widest">06</span>
          <div className="w-8 h-px bg-zinc-700" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
          Calculateur de Projection
        </h2>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
        {/* Main Display */}
        <div className="flex flex-col items-center mb-6">
          {/* Projected Total - Large Display */}
          <div className="relative">
            <div
              className={`text-5xl sm:text-6xl font-black tabular-nums transition-transform ${
                isAdjusting ? 'scale-110' : ''
              }`}
              style={{ color: lineComparison.color }}
            >
              {projectedTotal}
            </div>
            <span className="absolute -right-8 top-0 text-sm text-zinc-500">pts</span>
          </div>

          {/* Line Comparison Badge */}
          <div
            className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${
              lineComparison.diff > 0
                ? 'bg-white/15 text-white'
                : lineComparison.diff < 0
                  ? 'bg-zinc-600/30 text-zinc-400'
                  : 'bg-zinc-500/20 text-zinc-300'
            }`}
          >
            {lineComparison.direction} {lineComparison.diff !== 0 && `(${lineComparison.diff > 0 ? '+' : ''}${lineComparison.diff})`}
          </div>
        </div>

        {/* Slider Container */}
        <div className="mb-6">
          {/* Reference marks above slider */}
          <div className="relative h-6 mb-2">
            {/* Line marker */}
            <div
              className="absolute bottom-0 flex flex-col items-center"
              style={{
                left: `${((currentLine - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <span className="text-[9px] text-white font-bold">LIGNE</span>
              <div className="w-0.5 h-2 bg-white" />
            </div>

            {/* Combined avg marker */}
            <div
              className="absolute bottom-0 flex flex-col items-center"
              style={{
                left: `${((combinedAvg - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <span className="text-[9px] text-zinc-500">MOY</span>
              <div className="w-0.5 h-2 bg-zinc-500" />
            </div>
          </div>

          {/* Slider Input with gradient track */}
          <div className="relative">
            {/* Gradient background track */}
            <div
              className="absolute inset-0 h-3 rounded-full pointer-events-none"
              style={{
                background: `linear-gradient(to right,
                  rgba(82, 82, 91, 0.5) 0%,
                  rgba(82, 82, 91, 0.3) ${linePositionPercent - 5}%,
                  rgba(161, 161, 170, 0.3) ${linePositionPercent}%,
                  rgba(255, 255, 255, 0.15) ${linePositionPercent + 5}%,
                  rgba(255, 255, 255, 0.25) 100%)`
              }}
            />
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              value={projectedTotal}
              onChange={(e) => setProjectedTotal(parseInt(e.target.value))}
              onMouseDown={() => setIsAdjusting(true)}
              onMouseUp={() => setIsAdjusting(false)}
              onTouchStart={() => setIsAdjusting(true)}
              onTouchEnd={() => setIsAdjusting(false)}
              className="relative w-full h-3 appearance-none bg-transparent rounded-full cursor-pointer z-10
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-7
                         [&::-webkit-slider-thumb]:h-7
                         [&::-webkit-slider-thumb]:sm:w-6
                         [&::-webkit-slider-thumb]:sm:h-6
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-white
                         [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:cursor-grab
                         [&::-webkit-slider-thumb]:active:cursor-grabbing
                         [&::-webkit-slider-thumb]:transition-transform
                         [&::-webkit-slider-thumb]:hover:scale-110
                         [&::-moz-range-thumb]:w-7
                         [&::-moz-range-thumb]:h-7
                         [&::-moz-range-thumb]:sm:w-6
                         [&::-moz-range-thumb]:sm:h-6
                         [&::-moz-range-thumb]:rounded-full
                         [&::-moz-range-thumb]:bg-white
                         [&::-moz-range-thumb]:border-0
                         [&::-moz-range-thumb]:cursor-grab
                         [&::-moz-range-thumb]:active:cursor-grabbing
                         [&::-webkit-slider-runnable-track]:bg-transparent
                         [&::-moz-range-track]:bg-transparent"
            />
          </div>

          {/* Scale labels */}
          <div className="flex justify-between mt-2 text-[10px] text-zinc-600 tabular-nums">
            <span>{sliderMin}</span>
            <span>{sliderMax}</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex overflow-x-auto sm:overflow-visible sm:flex-wrap justify-start sm:justify-center gap-2 mb-6 pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setProjectedTotal(preset.value)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                projectedTotal === preset.value
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
              }`}
            >
              {preset.label}: {preset.value}
            </button>
          ))}
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* vs Current Line */}
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">vs Ligne</div>
            <div
              className="text-lg font-bold tabular-nums"
              style={{ color: lineComparison.color }}
            >
              {lineComparison.diff > 0 ? '+' : ''}{lineComparison.diff}
            </div>
          </div>

          {/* vs Combined Avg */}
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">vs Moy. Combinée</div>
            <div
              className={`text-lg font-bold tabular-nums ${
                teamComparison.vsCombined.diff >= 0 ? 'text-white' : 'text-zinc-500'
              }`}
            >
              {teamComparison.vsCombined.label}
            </div>
          </div>

          {/* vs Home Team Avg */}
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
              vs {homeTeamAbbr}
            </div>
            <div
              className={`text-lg font-bold tabular-nums ${
                teamComparison.vsHome.diff >= 0 ? 'text-white' : 'text-zinc-500'
              }`}
            >
              {teamComparison.vsHome.label}
            </div>
          </div>

          {/* vs Away Team Avg */}
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
              vs {awayTeamAbbr}
            </div>
            <div
              className={`text-lg font-bold tabular-nums ${
                teamComparison.vsAway.diff >= 0 ? 'text-white' : 'text-zinc-500'
              }`}
            >
              {teamComparison.vsAway.label}
            </div>
          </div>
        </div>

        {/* Percentile Position */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Position historique: <span className="text-zinc-400 font-medium">{percentilePosition}</span></span>
        </div>

        {/* Insight Box */}
        <div className="mt-4 p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
              Utilisez le curseur pour explorer différents scénarios de total.
              <span className="text-zinc-500"> Comparez votre projection aux moyennes et à la ligne actuelle.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectionCalculator
