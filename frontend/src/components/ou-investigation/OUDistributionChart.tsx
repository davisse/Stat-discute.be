'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface GameTotal {
  gameId: string
  total: number
  homeTeam: string
  awayTeam: string
  date: string
  isOver: boolean
}

interface OUDistributionChartProps {
  homeTeamAbbr: string
  awayTeamAbbr: string
  homeTeamGames: GameTotal[]
  awayTeamGames: GameTotal[]
  currentLine: number
}

interface DistributionBucket {
  range: string
  rangeStart: number
  rangeEnd: number
  count: number
  games: GameTotal[]
}

export function OUDistributionChart({
  homeTeamAbbr,
  awayTeamAbbr,
  homeTeamGames,
  awayTeamGames,
  currentLine
}: OUDistributionChartProps) {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | 'both'>('both')
  const [hoveredBucket, setHoveredBucket] = useState<DistributionBucket | null>(null)

  // Create distribution buckets
  const distribution = useMemo(() => {
    const games = selectedTeam === 'home'
      ? homeTeamGames
      : selectedTeam === 'away'
        ? awayTeamGames
        : [...homeTeamGames, ...awayTeamGames]

    // Define buckets (195-200, 200-205, etc.)
    const bucketSize = 5
    const minTotal = Math.floor(Math.min(...games.map(g => g.total)) / bucketSize) * bucketSize
    const maxTotal = Math.ceil(Math.max(...games.map(g => g.total)) / bucketSize) * bucketSize

    const buckets: DistributionBucket[] = []
    for (let start = minTotal; start < maxTotal; start += bucketSize) {
      const end = start + bucketSize
      const bucketGames = games.filter(g => g.total >= start && g.total < end)
      buckets.push({
        range: `${start}-${end}`,
        rangeStart: start,
        rangeEnd: end,
        count: bucketGames.length,
        games: bucketGames
      })
    }

    return buckets
  }, [homeTeamGames, awayTeamGames, selectedTeam])

  // Calculate stats
  const stats = useMemo(() => {
    const games = selectedTeam === 'home'
      ? homeTeamGames
      : selectedTeam === 'away'
        ? awayTeamGames
        : [...homeTeamGames, ...awayTeamGames]

    const overCount = games.filter(g => g.total > currentLine).length
    const underCount = games.filter(g => g.total <= currentLine).length
    const avgTotal = games.reduce((sum, g) => sum + g.total, 0) / games.length

    return {
      overCount,
      underCount,
      overPct: games.length > 0 ? Math.round((overCount / games.length) * 100) : 0,
      avgTotal: avgTotal || 0,
      totalGames: games.length
    }
  }, [homeTeamGames, awayTeamGames, selectedTeam, currentLine])

  const getBarColor = (bucket: DistributionBucket) => {
    const midpoint = (bucket.rangeStart + bucket.rangeEnd) / 2
    if (midpoint > currentLine) {
      return '#ffffff' // Over - White
    } else if (midpoint < currentLine) {
      return '#52525b' // Under - Zinc-600
    }
    return '#a1a1aa' // On the line - Gray
  }

  return (
    <section className="mt-6 sm:mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-600 tracking-widest">02</span>
          <div className="w-8 h-px bg-zinc-700" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
          Distribution des Totaux
        </h2>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Team Selector */}
          <div className="flex gap-2">
            <TeamToggle
              label="Les deux"
              isActive={selectedTeam === 'both'}
              onClick={() => setSelectedTeam('both')}
            />
            <TeamToggle
              label={awayTeamAbbr}
              isActive={selectedTeam === 'away'}
              onClick={() => setSelectedTeam('away')}
            />
            <TeamToggle
              label={homeTeamAbbr}
              isActive={selectedTeam === 'home'}
              onClick={() => setSelectedTeam('home')}
            />
          </div>

          {/* Current Line Display */}
          <div className="flex items-center gap-3 px-3 py-2 bg-black/30 rounded-lg border border-zinc-800">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Ligne actuelle</span>
            <span className="text-xl font-black text-white tabular-nums">{currentLine}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] sm:h-[280px] relative">
          {/* O/U Line Indicator - Absolute positioned */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-white/10 border border-white/30 px-2 py-0.5 rounded text-[10px] font-bold text-white">
              LIGNE: {currentLine}
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={distribution}
              margin={{ top: 24, right: 10, left: -20, bottom: 0 }}
              onClick={(state) => {
                // Touch-friendly: tap to select bucket
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const payload = (state as any)?.activePayload?.[0]?.payload as DistributionBucket | undefined
                if (payload) {
                  setHoveredBucket(
                    hoveredBucket?.range === payload.range ? null : payload
                  )
                }
              }}
              onMouseMove={(state) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const payload = (state as any)?.activePayload?.[0]?.payload as DistributionBucket | undefined
                if (payload) {
                  setHoveredBucket(payload)
                }
              }}
              onMouseLeave={() => setHoveredBucket(null)}
            >
              <XAxis
                dataKey="range"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 9 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  // Show only the start value on mobile-friendly display
                  const start = value.split('-')[0]
                  return start
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 10 }}
                allowDecimals={false}
                width={30}
              />
              <Tooltip
                content={<CustomTooltip currentLine={currentLine} />}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {distribution.map((bucket, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(bucket)}
                    fillOpacity={hoveredBucket?.range === bucket.range ? 1 : 0.7}
                    stroke={hoveredBucket?.range === bucket.range ? '#fff' : 'transparent'}
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox
              label="Matchs analysés"
              value={stats.totalGames.toString()}
            />
            <StatBox
              label="Moyenne"
              value={stats.avgTotal.toFixed(1)}
              highlight={stats.avgTotal > currentLine ? 'over' : 'under'}
            />
            <StatBox
              label="Over"
              value={`${stats.overCount} (${stats.overPct}%)`}
              isOver={true}
            />
            <StatBox
              label="Under"
              value={`${stats.underCount} (${100 - stats.overPct}%)`}
              isOver={false}
            />
          </div>
        </div>

        {/* Visual Legend - Mobile wrap-friendly */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-white/70" />
            <span className="hidden sm:inline">Au-dessus</span>
            <span className="sm:hidden">Over</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-zinc-600/70" />
            <span className="hidden sm:inline">En-dessous</span>
            <span className="sm:hidden">Under</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-white font-bold">─ ─</span>
            <span>Ligne O/U</span>
          </span>
        </div>

        {/* Hovered Bucket Details - Mobile info panel */}
        {hoveredBucket && (
          <div className="mt-3 p-3 bg-black/40 border border-zinc-800 rounded-lg sm:hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{hoveredBucket.range} pts</span>
              <span className={`text-xs font-bold ${
                (hoveredBucket.rangeStart + hoveredBucket.rangeEnd) / 2 > currentLine
                  ? 'text-white'
                  : 'text-zinc-500'
              }`}>
                {(hoveredBucket.rangeStart + hoveredBucket.rangeEnd) / 2 > currentLine ? 'OVER' : 'UNDER'}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {hoveredBucket.count} match{hoveredBucket.count > 1 ? 's' : ''} dans cette tranche
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function TeamToggle({
  label,
  isActive,
  onClick
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
        isActive
          ? 'bg-white/20 border-white/50 text-white'
          : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
      }`}
    >
      {label}
    </button>
  )
}

function StatBox({
  label,
  value,
  highlight,
  isOver
}: {
  label: string
  value: string
  highlight?: 'over' | 'under'
  isOver?: boolean
}) {
  const getColor = () => {
    if (highlight === 'over') return 'text-white'
    if (highlight === 'under') return 'text-zinc-500'
    if (isOver === true) return 'text-white'
    if (isOver === false) return 'text-zinc-500'
    return 'text-zinc-300'
  }

  return (
    <div className="bg-black/30 rounded-lg p-3 text-center">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${getColor()}`}>
        {value}
      </div>
    </div>
  )
}

function CustomTooltip({
  active,
  payload,
  currentLine
}: {
  active?: boolean
  payload?: Array<{ payload: DistributionBucket }>
  currentLine: number
}) {
  if (!active || !payload || !payload[0]) return null

  const bucket = payload[0].payload
  const isOver = (bucket.rangeStart + bucket.rangeEnd) / 2 > currentLine

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
      <div className="text-sm font-bold text-white mb-1">
        {bucket.range} points
      </div>
      <div className="text-xs text-zinc-400 mb-2">
        {bucket.count} match{bucket.count > 1 ? 's' : ''}
      </div>
      <div className={`text-xs font-medium ${isOver ? 'text-white' : 'text-zinc-500'}`}>
        {isOver ? 'OVER' : 'UNDER'} la ligne de {currentLine}
      </div>
    </div>
  )
}

export default OUDistributionChart
